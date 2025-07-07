@echo off

REM Change the working direcotry to the location of the start script
cd /d "%~dp0"

REM Check if Docker is in swarm mode
docker info | findstr /i "Swarm: active" >nul
if %errorlevel% neq 0 (
    echo Docker is not in swarm mode. Initializing swarm...
    docker swarm init
    if %errorlevel% neq 0 (
        echo Failed to initialize Docker swarm. Exiting...
        exit /b 1
    )
) else (
    echo Docker is ready to use with GEAR.
)

REM Check if the Docker stack "gear" is already running
docker stack ls | findstr /i "gear" >nul
if %errorlevel% equ 0 (
    echo Docker stack "gear" is already running. Opening http://localhost:5173...
    start http://localhost:5173
    exit /b 0
)


REM Deploy the Docker stack
echo Deploying Docker stack from ../deploy/docker-compose.yml...
docker stack deploy -c ../deploy/docker-compose.yml gear

if %errorlevel% neq 0 (
    echo Failed to deploy Docker stack. Exiting...
    exit /b 1
)

:check_logs
docker service logs gear_web | findstr /i "Local: http://localhost:5173" >nul
if %errorlevel% neq 0 (
    echo Waiting for the application to be ready...
    timeout /t 5 >nul
    goto check_logs
)
echo Application is ready! Opening http://localhost:5173...
start http://localhost:5173
exit /b 0