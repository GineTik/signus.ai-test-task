#!/bin/sh
set -e

echo "Running Prisma migrations..."
npx prisma migrate deploy --schema=./shared/prisma/schema.prisma

echo "Starting the application..."
exec "$@" 