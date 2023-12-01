# FROM node:lts-bullseye-slim
FROM node:16-alpine

RUN mkdir /app
WORKDIR /app
COPY package.json /app
RUN npm install
COPY . /app
EXPOSE 8081
CMD ["npm", "start"]