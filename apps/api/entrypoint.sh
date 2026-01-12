#!/bin/sh
set -e

echo "🚀 Starting API container..."

# Wait for database to be ready
echo "⏳ Waiting for database..."
until pg_isready -h postgres -p 5432 -U smartops >/dev/null 2>&1; do
  sleep 1
done

echo "✅ Database is ready"

# Push schema to database (creates tables if they don't exist)
echo "📦 Pushing Prisma schema to database..."
npx prisma db push --url="$DATABASE_URL" --accept-data-loss

# Seed initial roles
echo "🌱 Seeding initial roles..."
npx ts-node prisma/init-roles.ts

# Seed database with test data (if DATABASE_SEED is true or not set, run seed)
if [ "${DATABASE_SEED:-true}" = "true" ]; then
  echo "🌱 Seeding database with test data..."
  npx ts-node prisma/seed.ts || echo "⚠️ Seed script failed or data already exists, continuing..."
fi

echo "✅ Initialization complete"

# Start the application
echo "🎯 Starting NestJS application..."
exec node dist/main.js
