FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./
RUN npm install

# Copy source code
COPY . .

# Build NestJS app
RUN npm run build

# Expose port
EXPOSE 8001

# Start the application
CMD ["npm", "run", "start:prod"]