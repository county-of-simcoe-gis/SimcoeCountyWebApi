FROM node:18-slim
RUN apt-get update
RUN apt-get --assume-yes install fonts-tlwg-garuda-ttf
# Create app directory
WORKDIR /usr/src/app
#Copy the package.json file to container folder
COPY package*.json ./
#Install required packages
# RUN apk add python3
RUN npm install --legacy-peer-deps
RUN npm audit fix --legacy-peer-deps
#Copy only the required files to container
COPY . .

EXPOSE 80
CMD [ "node", "server.js" ]
