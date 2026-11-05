#!/bin/bash
set -e

# Caché de Laravel y migraciones en PostgreSQL
php artisan config:cache
php artisan route:cache
php artisan view:cache
php artisan migrate --force

# Iniciar servicios
php-fpm -D
nginx -g "daemon off;"