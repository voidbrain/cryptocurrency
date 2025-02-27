FROM node:22

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY src/centralRegistry.js ./src/centralRegistry.js

EXPOSE 4000

CMD ["node", "src/centralRegistry.js"]
