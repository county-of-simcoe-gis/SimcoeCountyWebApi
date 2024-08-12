FROM node:20-slim
RUN apt-get update
RUN apt-get --assume-yes install fonts-tlwg-garuda-ttf python3
#Install required packages
#RUN apt-get install python3 -y

# Create app directory
WORKDIR /usr/src/app
#Copy the package.json file to container folder
COPY package*.json ./

RUN npm install --legacy-peer-deps
RUN npm audit fix --legacy-peer-deps
#Copy only the required files to container
COPY . .

EXPOSE 80
CMD [ "node", "server.js" ]
