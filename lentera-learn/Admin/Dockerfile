FROM node:20-alpine

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .

EXPOSE 8080

# Set environment variables for Docker - these can be overridden in docker-compose
ENV VITE_API_BASE_URL=http://localhost:3001/api/v1
ENV VITE_API_PROXY_TARGET=http://lentera-learn-backend:3001

CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0", "--port", "8080"]