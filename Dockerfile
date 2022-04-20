FROM node:16-alpine as build

WORKDIR /usr/src/app

COPY package*.json ./

ENV NODE_ENV=development
RUN npm ci

COPY . .

RUN npm run build

# Production image
FROM node:16-alpine

# Puppeteer runtime dependencies
RUN apk update && apk add --no-cache nmap && \
    echo @edge http://nl.alpinelinux.org/alpine/edge/community >> /etc/apk/repositories && \
    echo @edge http://nl.alpinelinux.org/alpine/edge/main >> /etc/apk/repositories && \
    apk update && \
    apk add --no-cache \
      chromium \
      harfbuzz \
      "freetype>2.8" \
      ttf-freefont \
      nss

WORKDIR /usr/src/app

ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
ENV NODE_ENV=production

COPY --from=build /usr/src/app/package*.json ./

# Installs runtime dependencies
RUN npm ci

COPY --from=build /usr/src/app/dist ./dist

ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser

RUN adduser \
  --disabled-password \
  har

USER har

CMD ["npm", "run", "start"]