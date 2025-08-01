#!/bin/bash

# Deploy script for Sistema de Avaliações
# Usage: ./deploy.sh [environment]
# Environments: dev, prod

set -e

ENVIRONMENT=${1:-prod}
PROJECT_NAME="sistema-avaliacoes"

echo "���� Starting deployment for environment: $ENVIRONMENT"

# Function to check if docker is running
check_docker() {
    if ! docker info > /dev/null 2>&1; then
        echo "❌ Docker is not running. Please start Docker and try again."
        exit 1
    fi
    echo "✅ Docker is running"
}

# Function to deploy development environment
deploy_dev() {
    echo "📦 Building and starting development environment..."
    
    # Stop existing containers
    docker-compose -f docker-compose.dev.yml down
    
    # Build and start containers
    docker-compose -f docker-compose.dev.yml up --build -d
    
    echo "🌍 Development environment is running at:"
    echo "   Frontend: http://localhost:4200"
    echo "   Backend API: http://localhost:8081"
    echo "   Database: localhost:5433"
    echo "   Redis: localhost:6380"
    echo "   Adminer: http://localhost:8083"
    echo ""
    echo "📋 To view logs: docker-compose -f docker-compose.dev.yml logs -f"
    echo "🛑 To stop: docker-compose -f docker-compose.dev.yml down"
}

# Function to deploy production environment
deploy_prod() {
    echo "📦 Building and starting production environment..."
    
    # Stop existing containers
    docker-compose down
    
    # Build and start containers
    docker-compose up --build -d
    
    echo "🌍 Production environment is running at:"
    echo "   Frontend: http://localhost:8080"
    echo "   Database: localhost:5432"
    echo "   Redis: localhost:6379"
    echo ""
    echo "📋 To view logs: docker-compose logs -f"
    echo "🛑 To stop: docker-compose down"
}

# Function to show health status
show_health() {
    echo "🏥 Checking container health..."
    docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
}

# Main deployment logic
main() {
    check_docker
    
    case $ENVIRONMENT in
        "dev")
            deploy_dev
            ;;
        "prod")
            deploy_prod
            ;;
        *)
            echo "❌ Invalid environment: $ENVIRONMENT"
            echo "Valid options: dev, prod"
            exit 1
            ;;
    esac
    
    # Wait a moment for containers to start
    sleep 5
    show_health
    
    echo ""
    echo "✅ Deployment completed successfully!"
}

# Run main function
main "$@"
