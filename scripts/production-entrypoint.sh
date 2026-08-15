#!/bin/sh

set -eu

echo "DB_USER: ${DB_USERNAME}"
echo "DB_HOST: ${DB_WRITE_HOST}"
echo "DB_NAME: ${DB_NAME}"
echo "DB_PORT: ${DB_PORT}"
echo "DB_PASSWORD: ${DB_PASSWORD}"
echo "DB_PASSWORD_LENGTH: ${#DB_PASSWORD}"

echo "Applying production database migrations..."
npm run db:migrate:production

echo "Applying idempotent production seeders..."
npm run db:seed:production

echo "Starting Project Pulse API..."
exec npm start