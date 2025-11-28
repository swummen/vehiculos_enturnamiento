FROM node:20 AS build

# Establecer directorio de trabajo
WORKDIR /app

# Copiar solo package*.json (copia package.json y package-lock.json si existe)
COPY package*.json ./

# Instalar dependencias (completas)
RUN npm install

# Copiar todo el código del proyecto
COPY . .

# ===============================================
# ETAPA 2: PRODUCCIÓN (más ligera)
# ===============================================
FROM node:20-slim AS production

WORKDIR /app

# Copiar dependencias instaladas desde build
COPY --from=build /app/node_modules ./node_modules

# Copiar solo los archivos del proyecto
COPY --from=build /app ./

# Expone el puerto que Render usará para conectarse
# Asegúrate que tu server.js escuche este puerto (Render asigna PORT)
EXPOSE 3000

# Comando de inicio
CMD ["node", "server.js"]