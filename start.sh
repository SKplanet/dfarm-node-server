#!/bin/bash
git reset --hard
git pull
bower install
grunt build
forever restartall
