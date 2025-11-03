# Use an official Node.js runtime as a parent image
FROM node:20-alpine AS base

# Set the working directory
WORKDIR /usr/src/app

# Install curl for healthchecks
RUN apk add --no-cache curl

# Copy package.json and package-lock.json (if available)
COPY package*.json ./

# Install app dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Generate Prisma client
RUN npx prisma generate

# Build the TypeScript code
RUN npm run build

# Expose the port the app runs on (assuming 3001, update if different)
EXPOSE 3001

# Define the command to run the app
CMD [ "sh", "-c", "npm run prisma:deploy && npm start" ]
