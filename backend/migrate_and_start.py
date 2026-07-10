import os
import sys
import time
import subprocess

def wait_for_db():
    import psycopg2
    database_url = os.getenv("DATABASE_URL")
    print(f"Waiting for database: {database_url}")
    
    for i in range(30):
        try:
            conn = psycopg2.connect(database_url)
            conn.close()
            print("Database is ready!")
            return True
        except Exception as e:
            print(f"Attempt {i+1}/30: Database not ready yet... {e}")
            time.sleep(2)
    
    print("Database never became ready!")
    sys.exit(1)

def run_migrations():
    print("Running Alembic migrations...")
    result = subprocess.run(
        ["alembic", "upgrade", "head"],
        cwd="/app",
        capture_output=True,
        text=True
    )
    print("STDOUT:", result.stdout)
    print("STDERR:", result.stderr)
    if result.returncode != 0:
        print("Migration FAILED!")
        sys.exit(1)
    print("Migrations complete!")

def start_server():
    print("Starting FastAPI server...")
    os.execvp("uvicorn", [
        "uvicorn", "app.main:app",
        "--host", "0.0.0.0",
        "--port", "8000"
    ])

if __name__ == "__main__":
    wait_for_db()
    run_migrations()
    start_server()