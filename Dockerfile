
# 1. Install dependencies only when needed
FROM node:20-slim AS base
WORKDIR /app

# 2. Install dependencies
FROM base AS deps
COPY package.json package-lock.json* ./
RUN npm ci

# 3. Build the app
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run prisma:generate
RUN npm run build

# 4. Production image
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production

# Copy the built application, dependencies, and prisma schema
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/shared/prisma ./shared/prisma
COPY --from=builder /app/docker-entrypoint.sh ./docker-entrypoint.sh

RUN chmod +x ./docker-entrypoint.sh

EXPOSE 3000

ENTRYPOINT ["./docker-entrypoint.sh"]

# Command to run the NestJS application
CMD ["node", "dist/main"]

