#!/bin/bash

echo "🔧 Testing backend build..."

# Test the simplified Dockerfile first
echo "📦 Testing simplified Dockerfile..."
cd ../sistema-avaliacoes-api
docker build -f Dockerfile.dev.simple -t test-backend-simple .

if [ $? -eq 0 ]; then
    echo "✅ Simplified build successful!"
    
    # Test the full Dockerfile
    echo "📦 Testing full Dockerfile..."
    docker build -f Dockerfile.dev -t test-backend-full .
    
    if [ $? -eq 0 ]; then
        echo "✅ Full build successful!"
        echo "🎯 Recommendation: Use Dockerfile.dev"
    else
        echo "⚠️ Full build failed, but simplified works"
        echo "🎯 Recommendation: Use Dockerfile.dev.simple"
    fi
else
    echo "❌ Both builds failed. Check composer.json and dependencies."
fi

# Cleanup
docker rmi test-backend-simple test-backend-full 2>/dev/null || true

echo "🏁 Build test completed."
