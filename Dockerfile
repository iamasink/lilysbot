# FROM node:lts-iron as base

# # Create the bot's directory
# RUN mkdir -p /usr/src/bot
# WORKDIR /usr/src/bot

# COPY package.json /usr/src/bot
# RUN npm install

# FROM node:lts-iron as prod

# RUN rm -rf /usr/src/bot/dist
# COPY dist /usr/src/bot/dist

# # Start the bot.
# CMD ["node", "dist/index.js"]





# Stage 1: Install dependencies
FROM node:lts-iron AS dependencies

# Set the working directory
WORKDIR /usr/src/bot

# Copy only package.json and package-lock.json (if available)
COPY package*.json ./

# Install dependencies
RUN npm install

# Stage 2: Compile TypeScript code
FROM dependencies AS builder

# Copy the source code
COPY src ./src
COPY tsconfig.json ./

# Compile TypeScript code
RUN npm run build

# Stage 3: Create the production image
FROM node:lts-iron AS prod

# Set the working directory
WORKDIR /usr/src/bot

# Copy the node_modules directory from the dependencies stage
COPY --from=dependencies /usr/src/bot/node_modules ./node_modules

# Copy the compiled application code
COPY --from=builder /usr/src/bot/dist ./dist

# Start the bot
CMD ["node", "dist/index.js"]

