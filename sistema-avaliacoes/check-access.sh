#!/bin/bash

echo "🌐 Checking external access to containers..."

# Get host IP
HOST_IP=$(hostname -I | awk '{print $1}' 2>/dev/null || echo "localhost")
echo "🏠 Detected host IP: $HOST_IP"

echo ""
echo "📊 Container Status:"
docker-compose -f docker-compose.dev.yml ps 2>/dev/null || docker-compose -f docker-compose.cloud.yml ps

echo ""
echo "🔗 Testing URLs:"

# Test frontend
echo -n "Frontend (4200): "
if curl -s --connect-timeout 3 "http://localhost:4200" > /dev/null 2>&1; then
    echo "✅ http://localhost:4200"
elif curl -s --connect-timeout 3 "http://$HOST_IP:4200" > /dev/null 2>&1; then
    echo "✅ http://$HOST_IP:4200"
else
    echo "❌ Not accessible"
fi

# Test API
echo -n "API (8081): "
if curl -s --connect-timeout 3 "http://localhost:8081/health" > /dev/null 2>&1; then
    echo "✅ http://localhost:8081"
elif curl -s --connect-timeout 3 "http://$HOST_IP:8081/health" > /dev/null 2>&1; then
    echo "✅ http://$HOST_IP:8081"
else
    echo "❌ Not accessible"
fi

# Test database
echo -n "Database (5433): "
if nc -z localhost 5433 2>/dev/null; then
    echo "✅ localhost:5433"
elif nc -z $HOST_IP 5433 2>/dev/null; then
    echo "✅ $HOST_IP:5433"
else
    echo "❌ Not accessible"
fi

echo ""
echo "🔧 Troubleshooting:"
echo "1. If you're in a cloud environment (like fly.dev), try:"
echo "   - Replace 'localhost' with your actual host/domain"
echo "   - Check if ports are exposed in your cloud config"

echo ""
echo "2. If you're on a VM or Docker Desktop:"
echo "   - Try http://0.0.0.0:4200 and http://0.0.0.0:8081"
echo "   - Check Docker Desktop port forwarding"

echo ""
echo "3. For cloud deployment, try the cloud environment:"
echo "   ./deploy.sh cloud"

echo ""
echo "📱 Cloud URLs to try:"
echo "   Frontend: http://$HOST_IP:4200"
echo "   API: http://$HOST_IP:8081"
echo "   Health: http://$HOST_IP:8081/health"
