@echo off

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
docker stack rm gear