# Build stage
FROM node:18-alpine AS builder
WORKDIR /app

# Declare build argument
ARG VITE_API_URL=http://localhost:5000

# Copy package files
COPY package*.json ./
RUN npm ci

# Copy source files
COPY . .

# Set environment variable for Vite build
ENV VITE_API_URL=$VITE_API_URL

# Build the application with production mode
RUN npm run build -- --mode production

# Production stage
FROM node:18-alpine
WORKDIR /app

# Install serve globally
RUN npm install -g serve

# Copy built files from builder stage
COPY --from=builder /app/dist ./dist

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001
USER nodejs

EXPOSE 3000

CMD ["serve", "-s", "dist", "-l", "3000"]