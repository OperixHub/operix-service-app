FROM oven/bun:1-alpine

WORKDIR /app

COPY package.json ./

RUN bun install

COPY . .

ENV VITE_BASE_URL_API=http://localhost:3000

EXPOSE 3000

CMD ["sh", "-c", "bun install && bun run dev"]
