FROM node:22-alpine

WORKDIR /app

COPY tsconfig*.json ./
COPY package*.json ./

RUN pnpm install

COPY . .

RUN pnpm run build

CMD ["pnpm", "start"]
