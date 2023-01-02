#!/bin/sh
envsubst < /usr/share/nginx/html/statistics-dashboard/en/assets/env.template.js > /usr/share/nginx/html/statistics-dashboard/en/assets/env.js
exec "$@"
