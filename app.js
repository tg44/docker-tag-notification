require('dotenv').config()
require('log-timestamp');
const fs = require('fs')
const fsa = fs.promises
const axios = require('axios')
const CronJob = require('cron').CronJob;
const docker = require('docker-registry-client')

const isVerbose = process.env.IS_VERBOSE || false
const discordUrl = process.env.DISCORD
const cron = process.env.CRON_EXPRESSION || '21 14,44 * * * *'
const timeZone = process.env.CRON_TIMEZONE || 'Europe/Budapest'

const rawdata = fs.readFileSync('conf/conf.json')
const config = JSON.parse(rawdata)

if(isVerbose) {
  console.info("Transformed config: " + JSON.stringify(config))
  console.info("Discord url: " + discordUrl)
  console.info("Cron expression: " + cron + " in " + timeZone)
}

const job = new CronJob(cron, function() {
  run().then(() => {
    if (isVerbose) {
      console.info("Successful run!")
    }
  }).catch(err => console.error(err))
}, null, true, timeZone);
job.start();
console.info("App started!")

async function run() {
  await Promise.all(config.repos.map(e => checkOne(e.name, e.tag)))
}

async function checkOne(name, tag) {
  if(isVerbose) {
    console.log(`checking; ${name}:${tag}`)
  }
  const client = docker.createClientV2({name})
  const newM = await getManifest(client, tag)

  const fileName = `conf/${name.split('/').join('-')}-${tag}.json`

  let oldM = {}
  try{
    oldM = JSON.parse(await fsa.readFile(fileName))
  } catch {}
  oldM.signatures = null
  newM.signatures = null
  if(JSON.stringify(oldM)===JSON.stringify(newM)) {
    return
  } else {
    await notify([{title: "New docker version alert!", description: `${name}:${tag} is updated!`}])
    await fsa.writeFile(fileName,JSON.stringify(newM))
  }
}

function getManifest(client, ref) {
  return new Promise((resolve, reject) => {
    client.getManifest({ref, acceptManifestLists: true}, (err, manifest) => {
      if (err) {
        return reject(err);
      }
      return resolve(manifest);
    });
  });
}


//data: [{title: "", description: "", url: ""}]
async function notify(data) {

  if(isVerbose) {
    console.info("Will send: " + JSON.stringify(data))
  }

  await axios.post(discordUrl, {
    embeds: data
  })
}
