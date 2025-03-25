FROM node:18-alpine AS builder

WORKDIR /app

# Install OpenSSL
RUN apk add --no-cache openssl

# Copy package files
COPY package*.json ./

# Install dependencies including devDependencies
RUN npm install

# Copy prisma schema and generate client
COPY prisma ./prisma/
RUN npx prisma generate

# Copy lib directory
COPY lib ./lib/

# Copy source code
COPY . .

# Build application
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

# Production image
FROM node:18-alpine AS runner

WORKDIR /app

# Install required packages
RUN apk add --no-cache openssl sshpass openssh-client

# Copy necessary files from builder
COPY --from=builder /app/next.config.js ./
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/lib ./lib
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma
COPY --from=builder /app/node_modules/tsconfig-paths ./node_modules/tsconfig-paths
COPY --from=builder /app/node_modules/ts-node ./node_modules/ts-node
COPY --from=builder /app/node_modules/typescript ./node_modules/typescript
COPY --from=builder /app/tsconfig.json ./

# Copy package files
COPY package*.json ./

# Install production dependencies and generate Prisma client
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN npm install --production && \
    npx prisma generate

# Expose port
EXPOSE 3000

# Start the application
CMD ["node", "server.js"] 