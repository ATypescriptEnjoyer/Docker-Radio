FROM node:16 as client

ARG DOMAIN
ARG OGG_STREAM_ENDPOINT
ARG MPEG_STREAM_ENDPOINT
ARG SOCKET_IO_PROTOCOL
ARG WEB_PROTOCOL

ARG REACT_APP_SOCKET_IO_CONNECTION=${SOCKET_IO_PROTOCOL}://${DOMAIN}/
ARG REACT_APP_STREAM_URL=${WEB_PROTOCOL}://${DOMAIN}${OGG_STREAM_ENDPOINT}
ARG REACT_APP_BACKUP_STREAM_URL=${WEB_PROTOCOL}://${DOMAIN}${MPEG_STREAM_ENDPOINT}

COPY client /app

WORKDIR /app

RUN yarn install

RUN yarn build

FROM ubuntu:latest

ARG PORT=4000
ARG OGG_STREAM_ENDPOINT=/stream
ARG MPEG_STREAM_ENDPOINT=/backup_stream
ARG ICECAST_PASSWORD=hackme

ENV PORT=${PORT}
ENV OGG_STREAM_ENDPOINT=${OGG_STREAM_ENDPOINT}
ENV MPEG_STREAM_ENDPOINT=${MPEG_STREAM_ENDPOINT}
ENV ICECAST_PASSWORD=${ICECAST_PASSWORD}

RUN apt update && apt upgrade -y 

RUN apt-get install icecast2 ices2 curl ffmpeg -qq
RUN curl -sL https://deb.nodesource.com/setup_16.x | bash -
RUN apt-get install nodejs -qq
RUN sed -i "s#ENABLE=.*#ENABLE=true#" /etc/default/icecast2
RUN npm install -g yarn ts-node

RUN mkdir -p /var/log/ices

COPY casting/icecast.xml /etc/icecast2/icecast.xml
COPY casting/ices-playlist.xml /etc/ices2/ices-playlist.xml

RUN sed -i "s/hackme/$ICECAST_PASSWORD/g" /etc/icecast2/icecast.xml
RUN sed -i "s/hackme/$ICECAST_PASSWORD/g" /etc/ices2/ices-playlist.xml

COPY server /app
COPY --from=client /app/build /app/build
COPY start.sh .
RUN chmod +x start.sh

WORKDIR /app

RUN yarn install

EXPOSE ${PORT}

WORKDIR /

CMD ["/start.sh"]