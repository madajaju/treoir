FROM node:alpine

# Create app directory
WORKDIR /usr/src/app

COPY . .

RUN npm install

WORKDIR /usr/src/app/web

RUN npm install

EXPOSE 5173

# Run SvelteKit app in development mode
CMD ["npm", "run", "dev", "--", "--host"]
