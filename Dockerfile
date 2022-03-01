FROM ubuntu:latest

RUN apt update && apt upgrade -y 

RUN apt-get install -y icecast2 ices2
RUN sed -i "s#ENABLE=.*#ENABLE=true#" /etc/default/icecast2

RUN mkdir -p /var/log/ices

WORKDIR /etc/ices2/

CMD /etc/init.d/icecast2 start && ices2 /etc/ices2/ices-playlist.xml