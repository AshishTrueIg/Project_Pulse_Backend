#!/bin/sh

set -eu

echo "Applying database migrations..."
npm run db:migrate

echo "Applying idempotent bootstrap seeders..."
npm run db:seed

echo "Starting Project Pulse API..."
exec npm run start:dev
