# Estágio de build (contexto = raiz do projeto; arquivos do app em frontend/)
FROM node:20 AS build

WORKDIR /app

COPY frontend/package*.json ./

RUN npm ci

COPY frontend/ ./

RUN npm run build

# Estágio final: Nginx servindo os estáticos + proxy /api
FROM nginx:alpine

COPY --from=build /app/dist/frontend/browser /usr/share/nginx/html

COPY docker/nginx/default.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
