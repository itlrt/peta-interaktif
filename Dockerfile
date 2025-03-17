FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install


# Copy source code
COPY . .

# Build application
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

# Production image
FROM node:18-alpine AS runner

WORKDIR /app


# Copy necessary files from builder
COPY --from=builder /app/next.config.js ./
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

# Copy package files
COPY package*.json ./

# Install production dependencies and generate Prisma client
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN npm install --production

# Expose port
EXPOSE 3000

# Start the application
CMD ["node", "server.js"]