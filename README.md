[![Docker Build Status](https://img.shields.io/docker/cloud/build/tg44/docker-tag-notification?style=flat-square)](https://hub.docker.com/r/tg44/docker-tag-notification)

# docker-tag-notification

A simple service which periodically check docker tags, and if they modified it post them to discord.

## Config syntax

The app works with one `conf.json` which looks like this;
```
{
    "repos": [
        {
            "name": "alpine",
            "tag": "latest"
        }
    ]
}
```

## Running the app

### Local install / dev
You need node 12, start with `npm i` and then `node app.js`.
For setting the discord server url you need to `export DISCORD="mydiscordhookurl"` before the service start.

For enable debugging you can  `export IS_VERBOSE=true`

(Or you can add these to a `.env` file.)

### Docker and compose
For docker you can run;
```
docker run -e DISCORD="mydiscordhookurl" -v ${PWD}/conf:/home/node/app/conf tg44/docker-tag-notification
```
For docker compose;
```
version: '3.1'
services:
  docker-tag-notification:
    image: tg44/docker-tag-notification
    restart: unless-stopped
    volumes:
      - /otp/docker-tag-notification/:/home/node/app/conf
    environment:
      - DISCORD=mydiscordhookurl
```

In the early config/template writing/testing phase, you can add the `IS_VERBOSE` env var too. 

You can also add `CRON_EXPRESSION` and `CRON_TIMEZONE` if you want to override the default ones (every 30 minute, Eu/Budapest). The cron starts with seconds!
