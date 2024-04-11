#!/bin/bash

# Copy .env
echo "Creating .env"
cp .env build/.env

# Start service
echo "Starting app"
cd build && node app.js