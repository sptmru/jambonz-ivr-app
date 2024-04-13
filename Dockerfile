FROM node:20
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
COPY docker-entrypoint.sh .
RUN chmod +x docker-entrypoint.sh
RUN mkdir /usr/src/app/logs

ENTRYPOINT ["/usr/src/app/docker-entrypoint.sh"]