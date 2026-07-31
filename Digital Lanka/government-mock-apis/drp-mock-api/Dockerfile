FROM php:8.2-apache

# Enable Apache mod_rewrite for clean URL routing
RUN a2enmod rewrite

# Install PDO and PDO MySQL extensions
RUN docker-php-ext-install pdo pdo_mysql

# Copy all application source files into the web root
COPY . /var/www/html/

# Create uploads directory and make it writable by Apache
RUN mkdir -p /var/www/html/uploads \
    && chown -R www-data:www-data /var/www/html/uploads \
    && chmod 755 /var/www/html/uploads

# Allow .htaccess to override Apache settings (needed for URL rewriting)
RUN sed -i 's|AllowOverride None|AllowOverride All|g' /etc/apache2/apache2.conf

EXPOSE 80
