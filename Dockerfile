# Use Bun official image
FROM oven/bun:latest

# Set working directory
WORKDIR /app

# Copy dependency files
COPY package.json bun.lockb ./

RUN apt-get update -y && apt-get install -y openssl

# Install dependencies
RUN bun install

RUN bunx prisma generate
RUN bunx prisma db push

# Copy source code
COPY . .

# Set environment variables (optional)
ENV NODE_ENV=production

# Expose port
EXPOSE 3000

# Start the server
CMD ["bun", "src/index.ts"]