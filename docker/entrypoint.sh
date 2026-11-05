#!/bin/bash
set -e

# Render asigna un puerto dinámico en la variable $PORT (por defecto usaremos 10000 si se ejecuta localmente)
PORT="${PORT:-10000}"

# Reemplazar dinámicamente el puerto en el archivo de configuración por defecto de Nginx
sed -i -E "s/listen\s+[0-9]+;/listen ${PORT};/g" /etc/nginx/sites-available/default
sed -i -E "s/listen\s+\[::\]:[0-9]+;/listen [::]:${PORT};/g" /etc/nginx/sites-available/default

# Caché de Laravel y migraciones en PostgreSQL
php artisan config:cache
php artisan route:cache
php artisan view:cache
php artisan migrate --force

# Iniciar servicios
php-fpm -D
nginx -g "daemon off;"