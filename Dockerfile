FROM node:16.3.0-alpine as client

COPY client /app
WORKDIR /app
RUN yarn install && yarn build

FROM ubuntu:22.04 as server

RUN apt-get update \
    && apt-get install icecast2 ices2 curl ffmpeg -y \
    && curl -sL https://deb.nodesource.com/setup_16.x | bash - \
    && apt-get install nodejs \
    && sed -i "s#ENABLE=.*#ENABLE=true#" /etc/default/icecast2 \
    && npm install -g yarn ts-node \
    && mkdir -p /var/log/ices

COPY casting/icecast.xml /etc/icecast2/icecast.xml.bak
COPY casting/ices-playlist.xml /etc/ices2/ices-playlist.xml.bak

COPY server /app
COPY --from=client /app/build /app/build

WORKDIR /app

RUN yarn install && yarn build && yarn install --production

ENTRYPOINT [ "yarn", "start" ]