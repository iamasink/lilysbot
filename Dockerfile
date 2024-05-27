# Stage 1: Install dependencies
FROM node:lts-iron AS dependencies

# Set the working directory
WORKDIR /usr/src/bot

# Copy only package.json and package-lock.json (if available)
COPY package*.json ./

# Install dependencies
RUN npm install -g pnpm
RUN pnpm install

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

ENV NODE_ENV=prod

# Start the bot
CMD ["node", "dist/index.js"]

