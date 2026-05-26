FROM nginx:alpine
RUN rm -rf /usr/share/nginx/html/*
COPY index.html /usr/share/nginx/html/
COPY html/ /usr/share/nginx/html/html/
COPY css/ /usr/share/nginx/html/css/
COPY js/ /usr/share/nginx/html/js/
EXPOSE 80
COPY default.conf /etc/nginx/conf.d/default.conf