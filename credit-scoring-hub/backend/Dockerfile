FROM node:20-alpine

WORKDIR /app

COPY package.json ./
RUN npm install

COPY tsconfig.json ./
COPY prisma ./prisma
RUN npx prisma generate

COPY src ./src
COPY .env ./.env

RUN npm run build

EXPOSE 8080

CMD ["sh", "-c", "npx prisma db push && node dist/index.js"]
