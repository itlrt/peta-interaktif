#!/bin/sh

# Jalankan migrasi database
npx prisma migrate deploy

# Jalankan aplikasi
exec node server.js 