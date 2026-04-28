FROM node:20-alpine AS build

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY tsconfig.json ./
COPY backend ./backend

RUN npm run build

# --- Imagen final ---
FROM node:20-alpine

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci --omit=dev

COPY --from=build /app/dist ./dist
COPY frontend ./frontend

RUN mkdir -p /app/data
VOLUME /app/data

EXPOSE 3001
ENV PORT=3001

CMD ["node", "dist/index.js"]
