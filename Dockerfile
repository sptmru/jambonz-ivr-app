FROM node:20
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
COPY docker-entrypoint.sh .
RUN chmod +x docker-entrypoint.sh

ENV NEW_RELIC_NO_CONFIG_FILE=true
ENV NEW_RELIC_DISTRIBUTED_TRACING_ENABLED=true
ENV NEW_RELIC_LOG=stdout

ENTRYPOINT ["/usr/src/app/docker-entrypoint.sh"]