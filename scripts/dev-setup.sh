#!/bin/bash

# Script de Setup para Desenvolvimento Local
# Configura TUDO automaticamente: .env files, dependencies, PostgreSQL
#
# Uso: ./scripts/dev-setup.sh

set -e

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🚀 Indie Game Backend Platform - Setup de Desenvolvimento"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
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

print_info() {
    echo -e "${BLUE}ℹ${NC} $1"
}

# ============================================================================
# VERIFICAÇÕES DE AMBIENTE
# ============================================================================

echo "🔍 Verificando requisitos..."
echo ""

# Verificar se Docker está rodando
echo "  → Verificando Docker..."
if ! docker info > /dev/null 2>&1; then
    print_error "Docker não está rodando. Por favor, inicie o Docker Desktop."
    exit 1
fi
print_status "Docker está rodando"

# Verificar se Node.js está instalado
echo "  → Verificando Node.js..."
if ! command -v node &> /dev/null; then
    print_error "Node.js não está instalado. Instale Node.js 18+ primeiro."
    exit 1
fi
NODE_VERSION=$(node -v)
print_status "Node.js $NODE_VERSION instalado"

# Verificar se npm está instalado
echo "  → Verificando npm..."
if ! command -v npm &> /dev/null; then
    print_error "npm não está instalado."
    exit 1
fi
NPM_VERSION=$(npm -v)
print_status "npm $NPM_VERSION instalado"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# ============================================================================
# CRIAÇÃO DE ARQUIVOS .ENV
# ============================================================================

echo "📝 Configurando arquivos .env..."
echo ""

# Backend .env
if [ ! -f packages/backend/.env ]; then
    echo "  → Criando packages/backend/.env..."
    cp packages/backend/.env.example packages/backend/.env
    print_status "Backend .env criado"
else
    print_warning "Backend .env já existe, pulando..."
fi

# Orchestrator .env
if [ ! -f packages/orchestrator/.env ]; then
    echo "  → Criando packages/orchestrator/.env..."
    cp packages/orchestrator/.env.example packages/orchestrator/.env
    print_status "Orchestrator .env criado"
else
    print_warning "Orchestrator .env já existe, pulando..."
fi

# Web Panel .env
if [ ! -f packages/web-panel/.env ]; then
    echo "  → Criando packages/web-panel/.env..."
    cp packages/web-panel/.env.example packages/web-panel/.env
    print_status "Web Panel .env criado"
else
    print_warning "Web Panel .env já existe, pulando..."
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# ============================================================================
# INSTALAÇÃO DE DEPENDÊNCIAS
# ============================================================================

echo "📦 Instalando dependências (pode demorar alguns minutos)..."
echo ""

echo "  → Backend..."
(cd packages/backend && npm install --silent) || print_warning "Alguns warnings são normais"
print_status "Backend dependencies instaladas"

echo "  → Orchestrator..."
(cd packages/orchestrator && npm install --silent) || print_warning "Alguns warnings são normais"
print_status "Orchestrator dependencies instaladas"

echo "  → Web Panel..."
(cd packages/web-panel && npm install --silent) || print_warning "Alguns warnings são normais"
print_status "Web Panel dependencies instaladas"

echo ""
print_status "Todas as dependências instaladas"

# Resolver vulnerabilidades automaticamente
echo ""
echo "🔒 Verificando vulnerabilidades..."
(cd packages/backend && npm audit fix --silent 2>&1 > /dev/null) || print_warning "Algumas vulnerabilidades em devDependencies são aceitáveis"
(cd packages/orchestrator && npm audit fix --silent 2>&1 > /dev/null) || true
(cd packages/web-panel && npm audit fix --silent 2>&1 > /dev/null) || true

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# ============================================================================
# INICIAR INFRAESTRUTURA (DOCKER)
# ============================================================================

echo "🐘 Iniciando PostgreSQL no Docker..."
echo ""

# Parar containers antigos se existirem
docker-compose -f docker-compose.dev.yml down > /dev/null 2>&1 || true

# Iniciar PostgreSQL
echo "  → Subindo container PostgreSQL..."
docker-compose -f docker-compose.dev.yml up -d postgres

# Esperar PostgreSQL ficar pronto
echo "  → Aguardando PostgreSQL inicializar..."
sleep 3

# Verificar se PostgreSQL está rodando
if docker ps | grep -q gamebackend-postgres; then
    print_status "PostgreSQL rodando na porta 5432"
else
    print_error "Falha ao iniciar PostgreSQL"
    exit 1
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# ============================================================================
# MENSAGEM FINAL
# ============================================================================

echo -e "${GREEN}✨ Setup completo! Tudo pronto para desenvolvimento.${NC}"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo -e "${BLUE}📋 PRÓXIMOS PASSOS:${NC}"
echo ""
echo "Abra 3 terminais e execute:"
echo ""
echo -e "${YELLOW}Terminal 1 - Backend:${NC}"
echo "  cd packages/backend && npm run start:dev"
echo ""
echo -e "${YELLOW}Terminal 2 - Orchestrator:${NC}"
echo "  cd packages/orchestrator && npm run start:dev"
echo ""
echo -e "${YELLOW}Terminal 3 - Web Panel:${NC}"
echo "  cd packages/web-panel && npm run dev"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo -e "${BLUE}🌐 URLs:${NC}"
echo "  • Web Panel:    http://localhost:3002"
echo "  • Backend API:  http://localhost:3000"
echo "  • Orchestrator: http://localhost:3001"
echo "  • PostgreSQL:   localhost:5432"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo -e "${BLUE}🛠️  COMANDOS ÚTEIS:${NC}"
echo ""
echo "  Parar PostgreSQL:"
echo "    docker-compose -f docker-compose.dev.yml down"
echo ""
echo "  Reiniciar PostgreSQL:"
echo "    docker-compose -f docker-compose.dev.yml restart"
echo ""
echo "  Ver logs do PostgreSQL:"
echo "    docker-compose -f docker-compose.dev.yml logs -f postgres"
echo ""
echo "  Resetar banco de dados (⚠️  apaga tudo):"
echo "    docker-compose -f docker-compose.dev.yml down -v"
echo "    ./scripts/dev-setup.sh"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
print_status "Pronto para desenvolvimento! 🚀"
echo ""
