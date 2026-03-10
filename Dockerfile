FROM node:20-alpine

WORKDIR /app

# install deps first
COPY package*.json ./
RUN npm ci

# copy the rest of the app
COPY . .

# vite default port
EXPOSE 5173

# --host so Vite listens on 0.0.0.0 so can be acces from outside container
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0", "--port", "5173"]
