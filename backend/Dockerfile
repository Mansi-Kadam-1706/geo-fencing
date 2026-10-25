# mongoose 9 needs Node >= 20.19, so use 22
FROM node:22-alpine
WORKDIR /app
ENV NODE_ENV=production

COPY package*.json ./
RUN npm ci --omit=dev --no-audit --no-fund

COPY . .

# server.js listens on process.env.PORT with no fallback, so PORT must be set
ENV PORT=5000
EXPOSE 5000
USER node
CMD ["node", "server.js"]
