@echo off
REM Start API and Frontend servers

echo Starting PDF Insight AI...
echo.

REM Start API in a new window
echo Starting API (FastAPI) on http://localhost:8000
start "PDF Insight AI - API" cmd /k cd api && python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000

REM Wait a bit for API to start
timeout /t 2

REM Start Frontend server in a new window
echo Starting Frontend on http://localhost:8080
start "PDF Insight AI - Frontend" cmd /k python -m http.server 8080

echo.
echo Both servers are starting in separate windows!
echo API: http://localhost:8000
echo Frontend: http://localhost:8080
echo API Docs: http://localhost:8000/docs
pause
