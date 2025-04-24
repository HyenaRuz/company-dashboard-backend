FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install --legacy-peer-deps

COPY . .

RUN npm run build

RUN npx prisma generate

EXPOSE 8082

CMD ["npm", "run", "start:prod"]