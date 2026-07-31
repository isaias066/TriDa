# Imagen base de Node
FROM node:18-alpine

# Carpeta de trabajo dentro del contenedor
WORKDIR /app

# Copiar archivos de dependencias
COPY package*.json ./

# Instalar dependencias
RUN npm install

# Copiar todo el código del backend
COPY . .

# Puerto donde corre Express
EXPOSE 3000

# Comando para iniciar el backend
CMD ["npm", "start"]