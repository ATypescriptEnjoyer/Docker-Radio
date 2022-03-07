#!/bin/bash

#Start radio services
cd /etc/ices2/
/etc/init.d/icecast2 start && ices2 /etc/ices2/ices-playlist.xml &

sleep 5 # Sleep to give icecast time to boot up

#Relay for webkit clients
ffmpeg -re -i http://localhost:8000${OGG_STREAM_ENDPOINT} -vn \
-codec:a libmp3lame -b:a 64k -f mp3 \
-content_type audio/mpeg \
icecast://source:${ICECAST_PASSWORD}@localhost:8000${MPEG_STREAM_ENDPOINT} &

#Start webserver

cd /app
npx ts-node server.ts