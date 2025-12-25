# Local Development Setup - Quick Start

Este guia é para desenvolvimento local. **NÃO** use este setup em produção.

## Opção 1: Desenvolvimento Rápido (Recomendado)

Esta opção roda apenas o PostgreSQL no Docker e os serviços diretamente no Node.js.

### 1. Instalar Dependências

```bash
# Root do projeto
npm install

# Backend
cd packages/backend
npm install

# Orchestrator
cd ../orchestrator
npm install

# Web Panel
cd ../web-panel
npm install
```

### 2. Configurar Variáveis de Ambiente

```bash
# Na raiz do projeto
cp .env.example .env

# Edite o .env com suas configurações
# Para desenvolvimento local, as configurações default funcionam
```

### 3. Iniciar PostgreSQL

```bash
# Na raiz do projeto
docker-compose -f docker-compose.dev.yml up -d
```

Isso inicia apenas o PostgreSQL na porta 5432.

### 4. Iniciar os Serviços

Abra **3 terminais separados**:

**Terminal 1 - Backend:**
```bash
cd packages/backend
npm run start:dev
```

**Terminal 2 - Orchestrator:**
```bash
cd packages/orchestrator
npm run start:dev
```

**Terminal 3 - Web Panel:**
```bash
cd packages/web-panel
npm run dev
```

### 5. Acessar

- **Web Panel:** http://localhost:3002
- **Backend API:** http://localhost:3000
- **Orchestrator:** http://localhost:3001 (apenas interno)

---

## Opção 2: Docker Completo (Mais Lento)

Use isso apenas se quiser testar o build de produção.

### 1. Build e Start

```bash
npm run dev:build
```

Isso vai buildar e iniciar todos os serviços em Docker.

**⚠️ Aviso:** O primeiro build pode levar 5-10 minutos.

---

## Resolver Vulnerabilidades do npm

Após `npm install`, você pode ver vulnerabilidades. Para resolver:

### Método 1: Fix Automático (Seguro)

```bash
npm audit fix
```

Isso corrige vulnerabilidades que não quebram compatibilidade.

### Método 2: Fix Forçado (Pode Quebrar)

```bash
npm audit fix --force
```

⚠️ **Cuidado:** Pode atualizar pacotes com breaking changes.

### Método 3: Ignorar (Para MVP)

Para um MVP, vulnerabilidades de dependências de desenvolvimento (devDependencies) geralmente são aceitáveis. Foque em vulnerabilidades de `dependencies` (runtime).

Verifique quais são críticas:
```bash
npm audit --production
```

---

## Problemas Comuns

### Porta Já em Uso

**Erro:** `Error: listen EADDRINUSE: address already in use :::3000`

**Solução:**
```bash
# Encontre o processo
lsof -i :3000

# Mate o processo
kill -9 <PID>
```

### PostgreSQL Não Conecta

**Erro:** `Error: connect ECONNREFUSED 127.0.0.1:5432`

**Solução:**
```bash
# Verifique se o container está rodando
docker ps | grep postgres

# Se não estiver, inicie
docker-compose -f docker-compose.dev.yml up -d postgres
```

### Backend Não Inicia

**Erro:** `Cannot find module 'typeorm'`

**Solução:**
```bash
cd packages/backend
rm -rf node_modules package-lock.json
npm install
```

### Web Panel Erro de Build

**Erro:** `Could not resolve "@vitejs/plugin-react"`

**Solução:**
```bash
cd packages/web-panel
npm install --save-dev @vitejs/plugin-react vite
```

---

## Verificar que Tudo Está Funcionando

### 1. Backend Health Check

```bash
curl http://localhost:3000/health
```

Deve retornar:
```json
{"status":"ok","timestamp":"..."}
```

### 2. Orchestrator Health Check

```bash
curl http://localhost:3001/health
```

Deve retornar:
```json
{"status":"ok","timestamp":"...","stats":{...}}
```

### 3. Web Panel

Abra http://localhost:3002 no navegador.

---

## Parar os Serviços

### Se rodando com npm (Opção 1):

Pressione `Ctrl+C` em cada terminal.

Para parar o PostgreSQL:
```bash
docker-compose -f docker-compose.dev.yml down
```

### Se rodando com Docker (Opção 2):

```bash
docker-compose down
```

---

## Limpar Tudo (Reset Completo)

```bash
# Parar containers
docker-compose -f docker-compose.dev.yml down -v

# Limpar node_modules
rm -rf node_modules packages/*/node_modules

# Reinstalar
npm install
cd packages/backend && npm install
cd ../orchestrator && npm install
cd ../web-panel && npm install
```

---

## Próximos Passos

Depois que tudo estiver rodando:

1. Crie uma conta: http://localhost:3002/register
2. Veja os docs: `/docs` folder
3. Teste a API: Veja `docs/api-reference.md`
4. Integre Unity SDK: Veja `docs/unity-sdk-guide.md`

---

**Dica:** Para desenvolvimento, use a **Opção 1**. É muito mais rápida e permite hot-reload.
