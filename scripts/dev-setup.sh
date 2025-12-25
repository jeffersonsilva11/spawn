#!/bin/bash

# Script de Setup para Desenvolvimento Local
# Configura tudo automaticamente

set -e

echo "🚀 Indie Game Backend Platform - Setup de Desenvolvimento"
echo ""

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Função para printar mensagens
print_status() {
    echo -e "${GREEN}✓${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

# Verificar se Docker está rodando
echo "Verificando Docker..."
if ! docker info > /dev/null 2>&1; then
    print_error "Docker não está rodando. Por favor, inicie o Docker Desktop."
    exit 1
fi
print_status "Docker está rodando"

# Verificar se Node.js está instalado
echo "Verificando Node.js..."
if ! command -v node &> /dev/null; then
    print_error "Node.js não está instalado. Instale Node.js 18+ primeiro."
    exit 1
fi
NODE_VERSION=$(node -v)
print_status "Node.js $NODE_VERSION instalado"

# Criar .env se não existir
if [ ! -f .env ]; then
    echo "Criando arquivo .env..."
    cp .env.example .env
    print_status ".env criado"
else
    print_warning ".env já existe, pulando..."
fi

# Instalar dependências
echo ""
echo "📦 Instalando dependências..."

echo "  → Root dependencies..."
npm install > /dev/null 2>&1 || print_warning "Alguns warnings são normais"

echo "  → Backend dependencies..."
cd packages/backend
npm install > /dev/null 2>&1 || print_warning "Alguns warnings são normais"
cd ../..

echo "  → Orchestrator dependencies..."
cd packages/orchestrator
npm install > /dev/null 2>&1 || print_warning "Alguns warnings são normais"
cd ../..

echo "  → Web Panel dependencies..."
cd packages/web-panel
npm install > /dev/null 2>&1 || print_warning "Alguns warnings são normais"
cd ../..

print_status "Todas as dependências instaladas"

# Resolver vulnerabilidades automaticamente
echo ""
echo "🔒 Resolvendo vulnerabilidades do npm..."
npm audit fix > /dev/null 2>&1 || print_warning "Algumas vulnerabilidades não podem ser corrigidas automaticamente"

# Iniciar PostgreSQL
echo ""
echo "🐘 Iniciando PostgreSQL..."
docker-compose -f docker-compose.dev.yml up -d postgres

# Esperar PostgreSQL ficar pronto
echo "Aguardando PostgreSQL ficar pronto..."
sleep 5

# Verificar se PostgreSQL está rodando
if docker ps | grep -q gamebackend-postgres; then
    print_status "PostgreSQL está rodando na porta 5432"
else
    print_error "Falha ao iniciar PostgreSQL"
    exit 1
fi

# Mensagem final
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo -e "${GREEN}✓ Setup completo!${NC}"
echo ""
echo "Para iniciar o desenvolvimento, abra 3 terminais:"
echo ""
echo "Terminal 1 (Backend):"
echo "  cd packages/backend && npm run start:dev"
echo ""
echo "Terminal 2 (Orchestrator):"
echo "  cd packages/orchestrator && npm run start:dev"
echo ""
echo "Terminal 3 (Web Panel):"
echo "  cd packages/web-panel && npm run dev"
echo ""
echo "Depois acesse:"
echo "  - Web Panel: http://localhost:3002"
echo "  - Backend API: http://localhost:3000"
echo ""
echo "Para parar o PostgreSQL:"
echo "  docker-compose -f docker-compose.dev.yml down"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
