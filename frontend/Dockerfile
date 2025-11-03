# Stage 1: Build the React application
FROM node:20-alpine AS build

# Copy the whole repository so shared folders (components/, types.ts, constants.ts) are available
WORKDIR /usr/src/app
COPY . /usr/src/app

# Install and build from the frontend folder
WORKDIR /usr/src/app/frontend
RUN npm ci || npm install
# Make node_modules available to root-level shared components
RUN ln -s /usr/src/app/frontend/node_modules /usr/src/app/node_modules || true
RUN npm run build

# Stage 2: Serve the static files with Nginx
FROM nginx:stable-alpine

RUN apk add --no-cache curl

COPY --from=build /usr/src/app/frontend/dist /usr/share/nginx/html

# Copy the Nginx configuration file (from repo root path)
COPY frontend/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
