# FastAPI backend — production image
FROM python:3.12-slim

WORKDIR /app
ENV PYTHONDONTWRITEBYTECODE=1 PYTHONUNBUFFERED=1

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY app ./app

EXPOSE 8000
# 0.0.0.0 so the container is reachable; read-only API
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
