FROM node:22.12.0

WORKDIR /app/cafeteria_fe

COPY package*.json .

RUN npm install

COPY . .

RUN chmod +x ./start.sh

EXPOSE 5173

CMD ["sh", "./start.sh"]
