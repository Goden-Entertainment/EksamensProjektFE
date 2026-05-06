 # Use Nginx as a web server to serve your HTML files
FROM nginx:alpine

  # Copy your HTML files into Nginx's default serving folder
COPY EksamensProjektFE/html/ /usr/share/nginx/html/

  # Nginx listens on port 80 by default
EXPOSE 80