
# Dockerfile
FROM python:3.11-slim

WORKDIR /app

COPY backend/ .  # assuming all your code is in backend/

RUN pip install --upgrade pip
RUN pip install -r requirements.txt

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "10000"]
