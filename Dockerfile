# ==========================================
# Etapa 1: Compilar el frontend (React / Vite)
# ==========================================
FROM node:20-alpine AS frontend-builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# ==========================================
# Etapa 2: Imagen final de producción (PHP + Nginx)
# ==========================================
FROM php:8.2-fpm

# Instalar dependencias del sistema y limpiar caché
RUN apt-get update && apt-get install -y --no-install-recommends \
    libpng-dev \
    libonig-dev \
    libxml2-dev \
    zip \
    unzip \
    libpq-dev \
    nginx \
    supervisor \
    && rm -rf /var/lib/apt/lists/*

# Instalar extensiones PHP para PostgreSQL
RUN docker-php-ext-install pdo pdo_pgsql pgsql mbstring exif pcntl bcmath gd

# Instalar Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

WORKDIR /var/www/html

# 1. Copiar primero solo los archivos de dependencias de PHP para aprovechar el caché
COPY composer.json composer.lock ./
RUN composer install --no-dev --optimize-autoloader --no-interaction --no-scripts

# 2. Copiar el resto del código fuente
COPY . .

# 3. Copiar los archivos compilados de React desde la Etapa 1
COPY --from=frontend-builder /app/public/build /var/www/html/public/build

# Finalizar scripts de composer
RUN composer dump-autoload --optimize

# Permisos necesarios para Laravel/Symfony en storage y cache
RUN chown -R www-data:www-data /var/www/html/storage /var/www/html/bootstrap/cache \
    && chmod -R 775 /var/www/html/storage /var/www/html/bootstrap/cache

# Configuración Nginx
COPY docker/nginx.conf /etc/nginx/sites-available/default

# Render asigna dinámicamente un puerto, por lo que el entrypoint debe inyectarlo en Nginx
EXPOSE 10000

COPY docker/entrypoint.sh /usr/local/bin/entrypoint.sh
RUN chmod +x /usr/local/bin/entrypoint.sh

ENTRYPOINT ["entrypoint.sh"]