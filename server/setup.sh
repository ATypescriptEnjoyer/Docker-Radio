#Configure Auth
sed -i "s/hackme/$ICECAST_PASSWORD/g" /etc/icecast.xml
sed -i "s/hackme/$ICECAST_PASSWORD/g" /etc/ices2/ices-playlist.xml

#Configure Frontend
cp -r /app/data/public/* /app/build

echo "Setup Script Completed"