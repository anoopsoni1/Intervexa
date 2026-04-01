# Production Dockerfile for API server
FROM node:20

WORKDIR /app

# Copy dependency manifests
COPY package.json package*.json ./

# Install dependencies (production only for smaller image; use npm install if no lock file)
RUN npm ci --omit=dev 2>/dev/null || npm install --omit=dev

# Copy application source
COPY . .

EXPOSE 5000

CMD ["node", "src/server.js"]
