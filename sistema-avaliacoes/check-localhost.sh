#!/bin/bash

echo "🏠 Checking localhost access (127.0.0.1)..."

echo ""
echo "📊 Docker Containers Status:"
docker-compose -f docker-compose.local.yml ps 2>/dev/null || echo "⚠️ Local containers not running. Run: ./deploy.sh local"

echo ""
echo "🔍 Port Scanning (nmap):"
if command -v nmap >/dev/null 2>&1; then
    echo "Scanning localhost ports 4200, 8081, 5433, 6380, 8083..."
    nmap -p 4200,8081,5433,6380,8083 localhost
else
    echo "nmap not available, using netstat..."
    netstat -tuln | grep -E ':(4200|8081|5433|6380|8083)'
fi

echo ""
echo "🌐 Testing URLs:"

# Test frontend
echo -n "Frontend (4200): "
if curl -s --connect-timeout 3 "http://localhost:4200" >/dev/null 2>&1; then
    echo "✅ http://localhost:4200"
elif curl -s --connect-timeout 3 "http://127.0.0.1:4200" >/dev/null 2>&1; then
    echo "✅ http://127.0.0.1:4200"
else
    echo "❌ Not accessible"
    echo "   Try: docker-compose -f docker-compose.local.yml logs frontend-local"
fi

# Test API
echo -n "API (8081): "
if curl -s --connect-timeout 3 "http://localhost:8081/health" >/dev/null 2>&1; then
    echo "✅ http://localhost:8081"
elif curl -s --connect-timeout 3 "http://127.0.0.1:8081/health" >/dev/null 2>&1; then
    echo "✅ http://127.0.0.1:8081"
else
    echo "❌ Not accessible"
    echo "   Try: docker-compose -f docker-compose.local.yml logs nginx-api-local"
fi

# Test database
echo -n "Database (5433): "
if nc -z localhost 5433 2>/dev/null; then
    echo "✅ localhost:5433"
elif nc -z 127.0.0.1 5433 2>/dev/null; then
    echo "✅ 127.0.0.1:5433"
else
    echo "❌ Not accessible"
fi

# Test redis
echo -n "Redis (6380): "
if nc -z localhost 6380 2>/dev/null; then
    echo "✅ localhost:6380"
elif nc -z 127.0.0.1 6380 2>/dev/null; then
    echo "✅ 127.0.0.1:6380"
else
    echo "❌ Not accessible"
fi

echo ""
echo "🔧 Troubleshooting:"

# Check if Docker is running
if ! docker info >/dev/null 2>&1; then
    echo "❌ Docker is not running. Start Docker Desktop/Service first."
else
    echo "✅ Docker is running"
fi

# Check for port conflicts
echo ""
echo "🚨 Port Conflict Check:"
for port in 4200 8081 5433 6380 8083; do
    if lsof -i :$port >/dev/null 2>&1; then
        echo "⚠️  Port $port is in use:"
        lsof -i :$port 2>/dev/null | head -2
    fi
done

echo ""
echo "🛠️ Solutions:"
echo "1. Stop any existing containers:"
echo "   docker-compose -f docker-compose.local.yml down"
echo ""
echo "2. Run local environment:"
echo "   ./deploy.sh local"
echo ""
echo "3. If ports are in use, kill conflicting processes:"
echo "   sudo lsof -ti:4200 | xargs kill -9"
echo "   sudo lsof -ti:8081 | xargs kill -9"
echo ""
echo "4. Check Docker Desktop port forwarding settings"
echo ""
echo "5. Alternative: Use different ports in docker-compose.local.yml"

echo ""
echo "📱 Quick Test URLs:"
echo "   Frontend: http://localhost:4200"
echo "   API Health: http://localhost:8081/health"
echo "   API Debug: http://localhost:8081/debug"
echo "   Adminer: http://localhost:8083"
