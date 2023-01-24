FROM nginx:1.18.0-alpine
CMD ["nginx", "-g", "daemon off;"]

COPY ./nginx-docker.conf /etc/nginx/nginx.conf
COPY ./mime.types /etc/nginx
COPY ./dist /usr/share/nginx/html

COPY ./env.copy.sh .
RUN chmod 755 ./env.copy.sh
ENTRYPOINT ["sh", "./env.copy.sh"]
