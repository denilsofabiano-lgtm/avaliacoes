#!/bin/bash

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 Iniciando Sistema de Avaliações - Full Stack${NC}"

# Verificar se o PHP está instalado
if ! command -v php &> /dev/null; then
    echo -e "${RED}❌ PHP não está instalado. Por favor, instale o PHP 8.1 ou superior${NC}"
    echo -e "${YELLOW}💡 Para instalar no Ubuntu/Debian: sudo apt install php8.1-cli php8.1-sqlite3 php8.1-xml php8.1-curl${NC}"
    exit 1
fi

# Verificar se o Composer está instalado
if ! command -v composer &> /dev/null; then
    echo -e "${RED}❌ Composer não está instalado. Por favor, instale o Composer${NC}"
    echo -e "${YELLOW}💡 Visite: https://getcomposer.org/download/${NC}"
    exit 1
fi

# Verificar se o Node.js está instalado
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js não está instalado. Por favor, instale o Node.js${NC}"
    exit 1
fi

echo -e "${YELLOW}📋 Preparando Backend (PHP/Symfony)...${NC}"

# Navegar para o diretório do backend
cd sistema-avaliacoes-api

# Instalar dependências do PHP se necessário
if [ ! -d "vendor" ]; then
    echo -e "${BLUE}📦 Instalando dependências do Composer...${NC}"
    composer install --no-interaction
fi

# Configurar banco SQLite para facilitar setup
echo -e "${BLUE}🗄️ Configurando banco de dados SQLite...${NC}"
export DATABASE_URL="sqlite:///%kernel.project_dir%/var/data.db"

# Criar diretório var se não existir
mkdir -p var

# Executar migrações do banco
echo -e "${BLUE}🔄 Executando migrações do banco...${NC}"
php bin/console doctrine:database:create --if-not-exists --no-interaction
php bin/console doctrine:migrations:migrate --no-interaction

# Carregar dados iniciais se existir fixtures
if [ -f "src/DataFixtures/AppFixtures.php" ]; then
    echo -e "${BLUE}📊 Carregando dados iniciais...${NC}"
    php bin/console doctrine:fixtures:load --no-interaction
fi

# Gerar chaves JWT se não existirem
echo -e "${BLUE}🔐 Configurando autenticação JWT...${NC}"
mkdir -p config/jwt
if [ ! -f "config/jwt/private.pem" ]; then
    openssl genpkey -out config/jwt/private.pem -aes256 -algorithm rsa -pkeyopt rsa_keygen_bits:4096 -pass pass:avaliacoes2024
    openssl pkey -in config/jwt/private.pem -out config/jwt/public.pem -pubout -passin pass:avaliacoes2024
fi

echo -e "${GREEN}✅ Backend configurado com sucesso!${NC}"

# Voltar para o diretório raiz
cd ..

echo -e "${YELLOW}📋 Preparando Frontend (Angular)...${NC}"

# Navegar para o diretório do frontend
cd sistema-avaliacoes

# Instalar dependências do Node se necessário
if [ ! -d "node_modules" ]; then
    echo -e "${BLUE}📦 Instalando dependências do npm...${NC}"
    npm install
fi

echo -e "${GREEN}✅ Frontend configurado com sucesso!${NC}"

# Voltar para o diretório raiz
cd ..

echo -e "${BLUE}🚀 Iniciando servidores...${NC}"

# Função para cleanup quando script for interrompido
cleanup() {
    echo -e "\n${YELLOW}🛑 Parando servidores...${NC}"
    kill $BACKEND_PID $FRONTEND_PID 2>/dev/null
    exit 0
}
trap cleanup SIGINT SIGTERM

# Iniciar backend em background
echo -e "${GREEN}🌐 Iniciando Backend Symfony na porta 8081...${NC}"
cd sistema-avaliacoes-api
DATABASE_URL="sqlite:///%kernel.project_dir%/var/data.db" JWT_PASSPHRASE=avaliacoes2024 php -S localhost:8081 -t public &
BACKEND_PID=$!

# Aguardar um pouco para o backend iniciar
sleep 3

cd ..

# Iniciar frontend em background
echo -e "${GREEN}🌐 Iniciando Frontend Angular na porta 4200...${NC}"
cd sistema-avaliacoes
npm start &
FRONTEND_PID=$!

cd ..

echo -e "${GREEN}🎉 Sistema iniciado com sucesso!${NC}"
echo -e "${BLUE}📱 Frontend: ${YELLOW}http://localhost:4200${NC}"
echo -e "${BLUE}🔌 Backend API: ${YELLOW}http://localhost:8081${NC}"
echo -e "${BLUE}📚 Documentação API: ${YELLOW}http://localhost:8081/api/doc${NC}"
echo ""
echo -e "${YELLOW}👤 Credenciais de login:${NC}"
echo -e "${BLUE}   Admin: ${GREEN}admin@sistema.com / admin123${NC}"
echo -e "${BLUE}   Professor: ${GREEN}professor@sistema.com / prof123${NC}"
echo -e "${BLUE}   Aluno: ${GREEN}aluno@sistema.com / aluno123${NC}"
echo ""
echo -e "${RED}⚠️  Pressione Ctrl+C para parar ambos os servidores${NC}"

# Aguardar indefinidamente
wait
