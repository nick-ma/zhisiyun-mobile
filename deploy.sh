#!/usr/bin/env sh
scp -pC ../../views/m.jade root@www.zhisiyun.com:/var/gisiclouds/www/gisiclouds/views
scp -rC ../../views/mobile/ root@www.zhisiyun.com:/var/gisiclouds/www/gisiclouds/views
scp -pC _static/app.js root@www.zhisiyun.com:/var/gisiclouds/www/gisiclouds/client/m/_static
scp -pC _static/main.css root@www.zhisiyun.com:/var/gisiclouds/www/gisiclouds/client/m/_static
# scp -C _static/require.js root@www.zhisiyun.com:/var/gisiclouds/www/gisiclouds/client/m/_static

# scp -rC _static/ root@www.zhisiyun.com:/var/gisiclouds/www/gisiclouds/client/m
