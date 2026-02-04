# Étape 1 : Construction (Build)
FROM node:18-alpine as build

WORKDIR /app
COPY package*.json ./
RUN npm install

COPY . .
# C'est ici que la variable d'environnement sera "cuite" dans le code
ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL
RUN npm run build

# Étape 2 : Serveur Web (Nginx)
FROM nginx:alpine
# On copie le site construit dans le dossier de Nginx
COPY --from=build /app/dist /usr/share/nginx/html
# On ajoute une config pour que React Router marche (sinon refresh = 404)
RUN echo 'server { \
    listen 80; \
    location / { \
        root /usr/share/nginx/html; \
        index index.html index.htm; \
        try_files $uri $uri/ /index.html; \
    } \
}' > /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]