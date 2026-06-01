FROM python:3.10.12

WORKDIR /app/cafeteria_be

COPY requirements.txt .

RUN pip install -r requirements.txt

COPY . .

RUN sed -i 's/\r$//' ./start.sh && chmod +x ./start.sh

EXPOSE 8000

CMD ["sh", "./start.sh"]
