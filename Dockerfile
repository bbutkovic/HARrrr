# syntax=docker/dockerfile:1
FROM node:18-alpine as build

WORKDIR /build

COPY package*.json ./

RUN NODE_ENV=development npm ci

COPY . .

RUN npm run build

RUN npm ci --only=production

# Production image
FROM node:18-alpine

# Puppeteer runtime dependencies
RUN --mount=type=cache,target=/var/cache/apt \
    apk update && apk add --no-cache nmap && \
    echo @edge http://nl.alpinelinux.org/alpine/edge/community >> /etc/apk/repositories && \
    echo @edge http://nl.alpinelinux.org/alpine/edge/main >> /etc/apk/repositories && \
    apk update && \
    apk add --no-cache \
      chromium \
      harfbuzz \
      "freetype>2.8" \
      ttf-freefont \
      nss

WORKDIR /app

COPY --from=build /build/package*.json ./
COPY --from=build /build/node_modules ./node_modules
COPY --from=build /build/dist ./dist

RUN adduser \
  --disabled-password \
  har

USER har

ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser

CMD ["npm", "run", "start"]