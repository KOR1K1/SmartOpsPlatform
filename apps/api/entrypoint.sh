#!/bin/sh
set -e

echo "🚀 Starting API container..."

# Wait for database to be ready
echo "⏳ Waiting for database..."
until pg_isready -h postgres -p 5432 -U smartops >/dev/null 2>&1; do
  sleep 1
done

echo "✅ Database is ready"

# Apply database migrations
echo "📦 Applying database migrations..."
if npx prisma migrate deploy --url="$DATABASE_URL" 2>/dev/null; then
  echo "✅ Migrations applied successfully"
else
  echo "⚠️ No migrations found or migration failed."
  echo "   For first-time setup, use 'prisma db push' or create initial migration:"
  echo "   npx prisma migrate dev --name init"
  echo "   Falling back to db push for initial setup..."
  npx prisma db push --url="$DATABASE_URL" --accept-data-loss || {
    echo "❌ Database setup failed"
    exit 1
  }
fi

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
