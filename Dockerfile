# Menggunakan Node.js Alpine image untuk ukuran yang lebih kecil
FROM node:18-alpine AS deps

# Install dependencies yang diperlukan sistem
RUN apk add --no-cache libc6-compat openssl

WORKDIR /app

# Copy file dependency
COPY package.json package-lock.json* ./

# Install dependencies saja (production + dev untuk build)
RUN npm ci

# Stage 2: Builder - Build aplikasi
FROM node:18-alpine AS builder

RUN apk add --no-cache libc6-compat openssl

WORKDIR /app

# Copy dependencies dari stage deps
COPY --from=deps /app/node_modules ./node_modules

# Copy source code
COPY . .

# Generate Prisma client sebelum build
RUN npx prisma generate

# Set environment untuk build
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production

# Build aplikasi Next.js
RUN npm run build

# Stage 3: Runner - Production image
FROM node:18-alpine AS runner

WORKDIR /app

# Install dependencies sistem yang diperlukan
RUN apk add --no-cache openssl curl

# Buat user non-root untuk security
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Set environment production
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Copy file yang diperlukan untuk production
COPY --from=builder /app/next.config.js ./
COPY --from=builder /app/public ./public
COPY --from=builder /app/package.json ./package.json

# Copy Prisma files
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma

# Copy built Next.js aplikasi
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Install hanya production dependencies
RUN npm ci --only=production && npm cache clean --force

# Generate Prisma client di production environment
RUN npx prisma generate

# Switch ke user non-root
USER nextjs

# Expose port
EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3000/api/health || exit 1

# Start aplikasi
CMD ["node", "server.js"] 