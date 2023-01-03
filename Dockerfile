FROM nginx:1.18.0

CMD ["nginx-debug", "-g", "daemon off;"]

# nginx conf
COPY ./nginx-docker.conf /etc/nginx/nginx.conf
COPY ./mime.types /etc/nginx
COPY ./dist /usr/share/nginx/html

COPY ./env.copy.sh .
RUN chmod 755 ./env.copy.sh
ENTRYPOINT ["bash", "./env.copy.sh"]
