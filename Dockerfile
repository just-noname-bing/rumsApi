FROM node:18.3.0

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install --legacy-peer-deps
RUN npm -g install typescript
COPY . .
RUN npm run build

# ENV NODE_ENV=production
EXPOSE 4000
CMD [ "npm", "run", "prod"]