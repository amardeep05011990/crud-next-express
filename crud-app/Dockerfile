# Use official Node.js LTS image
FROM node:18-alpine

# Set working directory
WORKDIR /usr/src/app

# Install global tools (nodemon for hot-reload)
RUN npm install -g nodemon

# Copy package.json and package-lock.json
COPY package*.json ./

# Install ALL dependencies (including dev)
RUN npm install

# Copy source code
COPY . .

# Expose port
EXPOSE 5000

# Set environment variables for development
ENV NODE_ENV=development

# Run app with nodemon (auto-reload)
CMD ["nodemon", "backendapp/server.js"]

