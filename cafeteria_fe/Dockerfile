FROM node:22.12.0

WORKDIR /app/cafeteria_fe

COPY package*.json .

RUN npm install

COPY . .

RUN sed -i 's/\r$//' ./start.sh && chmod +x ./start.sh

EXPOSE 5173

CMD ["sh", "./start.sh"]
