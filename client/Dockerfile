FROM node:22-alpine

WORKDIR /app
# Install curl
RUN apk add --no-cache curl

COPY package*.json ./
RUN npm install

COPY . .

# Expose the port the app runs on
EXPOSE 3005

CMD ["node", "miner.js"]
