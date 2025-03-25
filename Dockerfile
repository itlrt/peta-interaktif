FROM node:18-alpine AS builder

WORKDIR /app

# Install dependencies untuk build
RUN apk add --no-cache libc6-compat openssl-dev

# Install dependencies termasuk 'sharp' untuk image optimization
COPY package*.json ./
RUN npm ci

# Copy source code
COPY . .

# Generate Prisma Client
RUN npx prisma generate

# Build aplikasi
RUN npm run build

# Stage 2: Runner
FROM node:18-alpine AS runner
WORKDIR /app

# Install dependencies yang diperlukan
RUN apk add --no-cache openssl-dev

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

# Create system user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy build output dari builder
COPY --from=builder /app/public ./public
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma

# Set proper permissions
RUN chown -R nextjs:nodejs /app

# Switch ke non-root user
USER nextjs

EXPOSE 3000

ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

# Add migration script
COPY --chmod=755 docker-entrypoint.sh .
ENTRYPOINT ["./docker-entrypoint.sh"]