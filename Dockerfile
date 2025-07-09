# Use Bun official image
FROM oven/bun:latest

# Set working directory
WORKDIR /app

# Copy dependency files
COPY package.json bun.lockb ./

RUN apt-get update -y && apt-get install -y openssl

# Install dependencies
RUN bun install

# Copy source code
COPY prisma ./prisma
COPY . .

RUN bun run generate

# Set environment variables (optional)
ENV NODE_ENV=production

# Expose port
EXPOSE 3000

# Start the server
CMD ["bun", "src/index.ts"]