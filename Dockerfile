FROM node:20-alpine AS builder
WORKDIR /app

# Copy root and workspace package files
COPY package*.json ./
COPY client/package*.json ./client/
COPY server/package*.json ./server/

# Install dependencies
RUN npm run install:all

# Copy all source files
COPY . .

# Build Vite client production assets
RUN npm run build

# Stage 2: Production Runner
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=5000

COPY package*.json ./
COPY server/package*.json ./server/
RUN npm install --prefix server --omit=dev

# Copy backend source and frontend built dist
COPY server ./server
COPY --from=builder /app/client/dist ./client/dist

EXPOSE 5000

CMD ["node", "server/src/server.js"]
