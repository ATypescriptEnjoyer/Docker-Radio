#!/bin/bash

#Start radio services
cd /etc/ices2/
/etc/init.d/icecast2 start && ices2 /etc/ices2/ices-playlist.xml &

#Relay for webkit clients
#REPLACE 'hackme' WITH YOUR PASSWORD
ffmpeg -re -i http://localhost:8000/stream -vn \
-codec:a libmp3lame -b:a 64k -f mp3 \
-content_type audio/mpeg \
icecast://source:hackme@localhost:8000/backup_stream &

#Start webserver

cd /app
npx ts-node server.ts