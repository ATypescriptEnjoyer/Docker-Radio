FROM node:16 as client

COPY client /app

WORKDIR /app

RUN yarn install

RUN yarn build

FROM ubuntu:latest

RUN apt update && apt upgrade -y 

RUN apt-get install icecast2 ices2 curl -qq
RUN curl -sL https://deb.nodesource.com/setup_16.x | bash -
RUN apt-get install nodejs -qq
RUN sed -i "s#ENABLE=.*#ENABLE=true#" /etc/default/icecast2
RUN npm install -g yarn ts-node


RUN mkdir -p /var/log/ices

COPY server /app
COPY --from=client /app/build /app/build
COPY start.sh .
RUN chmod +x start.sh

EXPOSE 4000

CMD ["/start.sh"]