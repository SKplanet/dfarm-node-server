#!/bin/bash
git reset --hard
git pull
bower install
grunt build
forever start -l /app/devicefarm/logs/forever/access.log -o /app/devicefarm/logs/forever/out.log -e /app/devicefarm/logs/forever/err.log -a dist/server/app.js
node git2distd.js > logs/git2dist.log &