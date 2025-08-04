#!/bin/bash

echo "🔍 Diagnosing container accessibility..."

echo "📊 Container Status:"
docker-compose -f docker-compose.dev.yml ps

echo ""
echo "🌐 Port Mappings:"
docker-compose -f docker-compose.dev.yml port frontend-dev 4200 2>/dev/null || echo "❌ Frontend port not mapped"
docker-compose -f docker-compose.dev.yml port nginx-api-dev 80 2>/dev/null || echo "❌ API port not mapped"

echo ""
echo "📋 Container Logs (last 10 lines):"
echo "--- Frontend Logs ---"
docker-compose -f docker-compose.dev.yml logs --tail=10 frontend-dev

echo ""
echo "--- Nginx API Logs ---"
docker-compose -f docker-compose.dev.yml logs --tail=10 nginx-api-dev

echo ""
echo "--- Backend Logs ---"
docker-compose -f docker-compose.dev.yml logs --tail=10 backend-dev

echo ""
echo "🧪 Connectivity Tests:"
echo "Testing internal connectivity..."

# Test if containers can reach each other
docker-compose -f docker-compose.dev.yml exec frontend-dev wget -q --spider http://nginx-api-dev/health 2>/dev/null && echo "✅ Frontend can reach API" || echo "❌ Frontend cannot reach API"

echo ""
echo "📝 Recommendations:"
echo "1. Check if ports 4200 and 8081 are available on your system"
echo "2. Try accessing via the container IP directly"
echo "3. Check firewall settings"
echo "4. For cloud environments, ensure port forwarding is configured"

echo ""
echo "🔗 Try these URLs if on cloud environment:"
echo "- Replace 'localhost' with your actual host IP"
echo "- Check if your cloud provider exposes these ports"
echo "- Verify proxy/load balancer configuration"
