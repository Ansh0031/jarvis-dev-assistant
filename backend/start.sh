#!/bin/bash
echo "Waiting for database..."
sleep 10
echo "Running Alembic migrations..."
alembic upgrade head
echo "Migrations done! Starting FastAPI..."
uvicorn app.main:app --host 0.0.0.0 --port 8000