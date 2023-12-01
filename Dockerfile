# FROM node:lts-bullseye-slim
FROM node:16-alpine
 
RUN npm install
 

EXPOSE 4000

CMD [ "npm", "start" ]