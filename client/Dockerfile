# ── Étape 1 : Build React ────────────────────────────────
FROM node:20-alpine AS build
WORKDIR /app
 
# Copier les manifestes de dépendances en premier
# (optimisation du cache Docker : ne rebuild que si package.json change)
COPY package*.json ./
RUN npm install
 
# Copier le code source et builder
COPY . .
RUN chmod -R 755 node_modules/.bin

# Build React
RUN npm run build
 
# ── Étape 2 : Servir avec Nginx ──────────────────────────
FROM nginx:1.25-alpine
 
# Copier le build React vers nginx
COPY --from=build /app/build /usr/share/nginx/html
 
# Copier la config nginx personnalisée
COPY nginx.conf /etc/nginx/conf.d/default.conf
 
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
