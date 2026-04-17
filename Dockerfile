# Build stage
FROM node:18-alpine AS builder
WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

ENV NODE_ENV=production
ENV NODE_OPTIONS=--max_old_space_size=4096
RUN npm run build

# Runtime stage
FROM node:18-alpine
WORKDIR /app

ENV NODE_ENV=production

COPY --from=builder /app ./

EXPOSE 3000
CMD ["next", "start"]
