# Use Debian-based image (fixes Prisma engine OpenSSL/musl issues on Alpine)
FROM node:20-bookworm-slim AS base

# Set the working directory
WORKDIR /usr/src/app

# Install curl and openssl for healthchecks and Prisma engines
RUN apt-get update \
    && apt-get install -y --no-install-recommends curl openssl ca-certificates \
    && rm -rf /var/lib/apt/lists/*

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
