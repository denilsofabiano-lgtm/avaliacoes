#!/bin/bash

echo "🧹 Cleaning up containers and port conflicts..."

echo "🛑 Stopping all sistema-avaliacoes containers..."
docker-compose -f docker-compose.dev.yml down 2>/dev/null || true
docker-compose -f docker-compose.cloud.yml down 2>/dev/null || true
docker-compose -f docker-compose.local.yml down 2>/dev/null || true

echo "🗑️ Removing sistema-avaliacoes containers..."
docker rm -f sistema-avaliacoes-frontend-dev 2>/dev/null || true
docker rm -f sistema-avaliacoes-frontend-local 2>/dev/null || true
docker rm -f sistema-avaliacoes-backend-dev 2>/dev/null || true
docker rm -f sistema-avaliacoes-backend-local 2>/dev/null || true
docker rm -f sistema-avaliacoes-nginx-dev 2>/dev/null || true
docker rm -f sistema-avaliacoes-nginx-local 2>/dev/null || true
docker rm -f sistema-avaliacoes-db-dev 2>/dev/null || true
docker rm -f sistema-avaliacoes-db-local 2>/dev/null || true
docker rm -f sistema-avaliacoes-redis-dev 2>/dev/null || true
docker rm -f sistema-avaliacoes-redis-local 2>/dev/null || true
docker rm -f sistema-avaliacoes-adminer-dev 2>/dev/null || true
docker rm -f sistema-avaliacoes-adminer-local 2>/dev/null || true

echo "🔍 Checking for port conflicts..."
PORTS=(4200 8081 5433 6380 8083)

for port in "${PORTS[@]}"; do
    echo -n "Port $port: "
    if lsof -i :$port >/dev/null 2>&1; then
        echo "⚠️ In use"
        echo "   Processes using port $port:"
        lsof -i :$port | grep -v COMMAND
        
        echo -n "   Kill processes on port $port? [y/N]: "
        read -r response
        if [[ "$response" =~ ^[Yy]$ ]]; then
            echo "   Killing processes on port $port..."
            lsof -ti :$port | xargs kill -9 2>/dev/null || true
            echo "   ✅ Port $port cleared"
        fi
    else
        echo "✅ Available"
    fi
done

echo ""
echo "🐳 Docker system status:"
docker system df

echo ""
echo "🏠 Ready to deploy locally:"
echo "   ./deploy.sh local"
echo ""
echo "🔍 Check after deploy:"
echo "   ./check-localhost.sh"
echo ""
echo "📋 View logs if needed:"
echo "   docker-compose -f docker-compose.local.yml logs -f"

echo ""
echo "✅ Cleanup completed!"
