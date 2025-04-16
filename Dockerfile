FROM ghcr.io/puppeteer/puppeteer:24.6.0

USER root

# Add user so we don't need --no-sandbox.
RUN mkdir -p /home/pptruser/Downloads /app \
    && chown -R pptruser:pptruser /home/pptruser \
    && chown -R pptruser:pptruser /app

WORKDIR /app

ADD package.json /app/package.json

ENV XDG_CONFIG_HOME=/tmp/.chromium
ENV XDG_CACHE_HOME=/tmp/.chromium

RUN npm config set registry http://registry.npmjs.org

RUN npm install --legacy-peer-deps

ADD . /app

RUN npx prisma generate

RUN npx puppeteer browsers install

RUN npm run build

EXPOSE 8081

CMD ["npm", "run", "start:prod"]
