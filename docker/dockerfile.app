FROM node:20-alpine
WORKDIR /app

COPY ./back-end/package*.json ./
RUN npm ci --only=production

COPY ./back-end/src ./src
COPY ./db ./db
COPY ./certs ./certs

RUN cd ./db && npm ci --only=production

USER node
EXPOSE 3000

CMD ["node", "src/app.js"]