#!/bin/bash

#Start radio services
cd /etc/ices2/
/etc/init.d/icecast2 start && ices2 /etc/ices2/ices-playlist.xml &

#Start webserver

cd /app
npx ts-node server.ts