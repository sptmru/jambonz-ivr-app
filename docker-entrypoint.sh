#!/bin/bash

# Copy .env
echo "Creating .env"
cp .env.example build/.env
cp .env.example .env

# Start service
echo "Starting app"
cd build && node app.js