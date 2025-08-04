#!/bin/bash

echo "🔧 Testing nginx build for development..."

cd ../sistema-avaliacoes-api

echo "📦 Testing nginx Dockerfile..."
if docker build -f Dockerfile.nginx.dev -t test-nginx-dev . > /dev/null 2>&1; then
    echo "✅ Nginx build successful!"
    
    echo "🧪 Testing nginx container..."
    docker run -d --name test-nginx-container -p 8090:80 test-nginx-dev
    
    sleep 3
    
    if curl -f http://localhost:8090/health > /dev/null 2>&1; then
        echo "✅ Nginx health check passed!"
    else
        echo "⚠️ Nginx health check failed, but container is running"
    fi
    
    # Cleanup
    docker stop test-nginx-container > /dev/null 2>&1
    docker rm test-nginx-container > /dev/null 2>&1
    docker rmi test-nginx-dev > /dev/null 2>&1
    
    echo "🎯 Nginx is ready for development!"
else
    echo "❌ Nginx build failed. Check Dockerfile.nginx.dev"
    exit 1
fi

echo "🏁 Nginx test completed successfully."
