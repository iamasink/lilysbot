FROM node:lts-iron

# Create the bot's directory
RUN mkdir -p /usr/src/bot
WORKDIR /usr/src/bot

COPY package.json /usr/src/bot
RUN npm install

RUN rm -rf /usr/src/bot/dist
COPY dist /usr/src/bot/dist

# Start the bot.
CMD ["node", "dist/index.js"]