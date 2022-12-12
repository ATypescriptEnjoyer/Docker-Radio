#Configure Auth
cp /etc/icecast2/icecast.xml.bak /etc/icecast2/icecast.xml
cp /etc/ices2/ices-playlist.xml.bak /etc/ices2/ices-playlist.xml
sed -i "s/hackme/$ICECAST_PASSWORD/g" /etc/icecast2/icecast.xml
sed -i "s/hackme/$ICECAST_PASSWORD/g" /etc/ices2/ices-playlist.xml

#Configure Frontend
cp -r /app/data/public/* /app/build