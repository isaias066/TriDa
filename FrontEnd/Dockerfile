# Imagen base de Node
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 5173

# Comando para correr React (o npm run dev)
CMD ["npm", "run", "dev", "--", "--host"]