FROM node:18-alpine as client

COPY client /app
WORKDIR /app
RUN yarn install && yarn build

FROM node:18-alpine as server

RUN apk add icecast ices curl ffmpeg --no-cache \
    && mkdir -p /var/log/ices \
    && mkdir -p /var/log/icecast2/ \
    && touch /var/log/icecast2/error.log \
    && touch /var/log/icecast2/access.log \
    && adduser -D alpine \
    && chown -R alpine:alpine /var/log/icecast2/ \
    && chown -R alpine:alpine /usr/share/icecast

COPY build_files/icecast.xml /etc/icecast.xml
COPY build_files/ices-playlist.xml /etc/ices2/ices-playlist.xml

COPY server /app

WORKDIR /app

RUN yarn install && yarn build && yarn install --production && yarn cache clean

COPY --from=client /app/build /app/build

ENTRYPOINT [ "yarn", "start" ]