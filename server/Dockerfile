# Use an official Node.js runtime as a parent image
FROM node:22.7

# Set the working directory
WORKDIR /usr/src/app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Expose the port the server will run on
# HTTP port
EXPOSE 5555
# DHT port
EXPOSE 20001 

# Command to run the server with --experimental-strip-types
CMD ["node", "--experimental-strip-types", "src/server.ts"]
