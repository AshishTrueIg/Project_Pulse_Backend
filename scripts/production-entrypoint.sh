#!/bin/sh

set -eu

echo "Applying production database migrations..."
npm run db:migrate:production

echo "Applying idempotent production seeders..."
npm run db:seed:production

echo "Starting Project Pulse API..."
exec npm start
