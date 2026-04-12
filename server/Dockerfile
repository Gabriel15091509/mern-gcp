FROM node:20-alpine
 
# Créer le répertoire de travail
WORKDIR /app
 
# Copier les dépendances en premier (cache Docker)
COPY package*.json ./
 
# Installer uniquement les dépendances de production
RUN npm install --omit=dev
 
# Copier le code source
COPY . .
 
# Port exposé
EXPOSE 5000
 
# Sécurité : ne pas tourner en root
USER node
 
# Démarrer l'application
CMD ["node", "src/index.js"]
