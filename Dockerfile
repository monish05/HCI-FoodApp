# Build stage
FROM node:20-alpine AS build
WORKDIR /app
COPY frontend/package.json frontend/package-lock.json ./
RUN npm ci
COPY frontend/ ./
RUN npm run build

# Run stage (Hugging Face Spaces: runs as uid 1000; node image already has "node" user with uid 1000)
FROM node:20-alpine
USER node
WORKDIR /home/node/app

COPY --from=build --chown=node /app/dist ./dist

EXPOSE 7860
ENV PORT=7860
CMD ["sh", "-c", "npx --yes serve -s dist -l ${PORT}"]
