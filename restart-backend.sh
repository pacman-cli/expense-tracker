#!/bin/bash
echo "🛑 Stopping backend..."
kill 20499 2>/dev/null
sleep 2

echo "🚀 Starting backend..."
cd backend
nohup mvn spring-boot:run > ../backend.log 2>&1 &
echo "✅ Backend starting... Check backend.log for status"
echo "⏳ Waiting for backend to be ready..."
sleep 5

for i in {1..10}; do
    if curl -s http://localhost:8080/actuator/health > /dev/null 2>&1; then
        echo "✅ Backend is ready!"
        exit 0
    fi
    echo "Waiting... ($i/10)"
    sleep 2
done

echo "⚠️  Backend may still be starting. Check backend.log"
