# FROM node:lts-bullseye-slim
FROM node:16-alpine

# create root application folder
WORKDIR /vms_domain_application

# copy configs to /variaMosLenguageService folder
COPY package*.json ./
COPY tsconfig.json ./
 
RUN npm install
 

EXPOSE 4000

CMD [ "npm", "start" ]