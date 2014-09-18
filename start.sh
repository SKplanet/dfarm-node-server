#!/bin/bash
git reset --hard
git pull
bower install
forever restartall
