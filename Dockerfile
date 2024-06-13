FROM node:20-slim

RUN apt-get update
RUN apt-get install chromium -y

RUN groupadd -r gomining
RUN useradd -rm -g gomining -G audio,video gomining
RUN mkdir -p /app
RUN chown -R gomining:gomining /app

USER gomining

ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium

WORKDIR /app

COPY package.json /app
COPY ./src /app/src

RUN npm install

CMD ["npm", "start"]
