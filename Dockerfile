FROM node:22-slim

WORKDIR /app

# Install system dependencies if needed
RUN apt-get update && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

# Copy root package files
COPY package*.json ./
COPY apps/web/package*.json ./apps/web/
COPY apps/api/package*.json ./apps/api/
COPY apps/admin/package*.json ./apps/admin/

# Install dependencies (this will use the container's native filesystem)
RUN npm install

# Copy the rest of the code
COPY . .

# Generate Prisma client
RUN npm run prisma:generate

# Expose ports
EXPOSE 5173 5174 4000

# Start everything
CMD ["npm", "run", "dev"]
