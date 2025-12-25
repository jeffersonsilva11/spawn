#!/bin/bash

# Script para resetar PostgreSQL completamente
# Remove TUDO relacionado ao PostgreSQL e inicia do zero

set -e

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🔄 Resetando PostgreSQL Completamente"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Cores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

print_status() {
    echo -e "${GREEN}✓${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

# 1. Parar e remover container
echo "1. Parando container PostgreSQL..."
docker stop gamebackend-postgres 2>/dev/null || print_warning "Container já estava parado"
docker rm gamebackend-postgres 2>/dev/null || print_warning "Container já foi removido"
print_status "Container removido"

# 2. Parar via docker-compose
echo ""
echo "2. Parando via docker-compose..."
docker-compose -f docker-compose.dev.yml down -v 2>/dev/null || docker compose -f docker-compose.dev.yml down -v 2>/dev/null || true
print_status "Docker-compose parado"

# 3. Remover volumes nomeados
echo ""
echo "3. Removendo volumes..."
docker volume rm spawn_postgres_data 2>/dev/null || true
docker volume rm postgres_data 2>/dev/null || true
docker volume ls | grep postgres | awk '{print $2}' | xargs -r docker volume rm 2>/dev/null || true
print_status "Volumes removidos"

# 4. Limpar volumes órfãos
echo ""
echo "4. Limpando volumes órfãos..."
docker volume prune -f > /dev/null 2>&1
print_status "Volumes órfãos limpos"

# 5. Verificar que não há volumes postgres
echo ""
echo "5. Verificando volumes restantes..."
VOLUMES=$(docker volume ls | grep -i postgres || true)
if [ -z "$VOLUMES" ]; then
    print_status "Nenhum volume PostgreSQL encontrado (correto!)"
else
    print_warning "Ainda existem volumes:"
    echo "$VOLUMES"
fi

# 6. Iniciar PostgreSQL do zero
echo ""
echo "6. Iniciando PostgreSQL do ZERO..."
if command -v docker-compose &> /dev/null; then
    docker-compose -f docker-compose.dev.yml up -d postgres
else
    docker compose -f docker-compose.dev.yml up -d postgres
fi

# 7. Aguardar PostgreSQL
echo ""
echo "7. Aguardando PostgreSQL inicializar (10 segundos)..."
sleep 10

# 8. Verificar logs
echo ""
echo "8. Verificando logs do PostgreSQL..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
if command -v docker-compose &> /dev/null; then
    docker-compose -f docker-compose.dev.yml logs --tail=20 postgres
else
    docker compose -f docker-compose.dev.yml logs --tail=20 postgres
fi
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# 9. Testar conexão
echo ""
echo "9. Testando conexão com o PostgreSQL..."
if docker exec gamebackend-postgres psql -U gamebackend -d gamebackend -c "SELECT 1;" > /dev/null 2>&1; then
    print_status "PostgreSQL funcionando! Usuário 'gamebackend' criado com sucesso!"
else
    print_warning "Ainda não conectou. Aguarde mais alguns segundos..."
    sleep 5
    if docker exec gamebackend-postgres psql -U gamebackend -d gamebackend -c "SELECT 1;" > /dev/null 2>&1; then
        print_status "PostgreSQL funcionando agora!"
    else
        echo -e "${RED}✗${NC} Erro: PostgreSQL não está aceitando conexões"
        echo "Execute: docker compose -f docker-compose.dev.yml logs postgres"
        exit 1
    fi
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${GREEN}✨ PostgreSQL resetado com sucesso!${NC}"
echo ""
echo "Agora você pode executar o backend:"
echo "  cd packages/backend && npm run start:dev"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
