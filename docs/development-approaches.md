# Abordagens de Desenvolvimento e Produção

Este documento explica as duas abordagens recomendadas para rodar a plataforma em diferentes ambientes.

## 📋 Sumário

1. [Desenvolvimento Local (Híbrida)](#desenvolvimento-local-híbrida) ⭐ **Recomendado para Dev**
2. [Produção (Docker Completo)](#produção-docker-completo) ⭐ **Recomendado para Prod**
3. [Comparação](#comparação)
4. [Como Escolher](#como-escolher)

---

## 🛠️ Desenvolvimento Local (Híbrida)

### Conceito

- **Docker**: Apenas infraestrutura (PostgreSQL, Redis no futuro)
- **Apps**: Rodando localmente via `npm run dev`

### Vantagens

✅ **Hot-reload instantâneo** - Mudanças no código refletem imediatamente
✅ **Debugging fácil** - Breakpoints funcionam normalmente no VSCode
✅ **Logs claros** - Output direto no terminal, sem precisar entrar no container
✅ **Desenvolvimento rápido** - Sem rebuild de imagens Docker
✅ **Menos recursos** - Não precisa rodar Node.js dentro de containers

### Desvantagens

⚠️ **Requer Node.js local** - Precisa ter Node.js 18+ instalado
⚠️ **Múltiplos terminais** - 3 terminais rodando simultaneamente
⚠️ **Dependências no sistema** - npm/node precisam estar instalados

### Setup Completo

```bash
# 1. Execute o script de setup (faz TUDO automaticamente)
./scripts/dev-setup.sh

# O script vai:
# ✓ Criar todos os .env files
# ✓ Instalar todas as dependências
# ✓ Subir PostgreSQL no Docker
# ✓ Verificar que tudo está ok

# 2. Abra 3 terminais e execute:

# Terminal 1 - Backend
cd packages/backend && npm run start:dev

# Terminal 2 - Orchestrator
cd packages/orchestrator && npm run start:dev

# Terminal 3 - Web Panel
cd packages/web-panel && npm run dev

# 3. Acesse:
# http://localhost:3002 - Web Panel
# http://localhost:3000 - Backend API
# http://localhost:3001 - Orchestrator
```

### Comandos Úteis

```bash
# Parar PostgreSQL
docker-compose -f docker-compose.dev.yml down

# Ver logs do PostgreSQL
docker-compose -f docker-compose.dev.yml logs -f postgres

# Resetar banco de dados (⚠️ apaga tudo)
docker-compose -f docker-compose.dev.yml down -v
./scripts/dev-setup.sh
```

### Estrutura de Arquivos

```
spawn/
├── docker-compose.dev.yml       # Apenas PostgreSQL
├── packages/
│   ├── backend/
│   │   ├── .env                 # Configuração local
│   │   ├── .env.example         # Template
│   │   └── src/                 # Hot-reload ativo
│   ├── orchestrator/
│   │   ├── .env
│   │   ├── .env.example
│   │   └── src/                 # Hot-reload ativo
│   └── web-panel/
│       ├── .env
│       ├── .env.example
│       └── src/                 # Hot-reload ativo (Vite)
└── scripts/
    └── dev-setup.sh             # Setup automático
```

---

## 🚀 Produção (Docker Completo)

### Conceito

- **Tudo containerizado** - Backend, Orchestrator, Web Panel, PostgreSQL
- **Orquestração via Docker Compose** ou Kubernetes
- **Isolamento completo** - Cada serviço em seu próprio container

### Vantagens

✅ **Consistência total** - Funciona igual em qualquer ambiente
✅ **Deploy simples** - Um comando sobe tudo
✅ **Isolamento** - Serviços não interferem entre si
✅ **Escalabilidade** - Fácil de escalar horizontalmente
✅ **Pronto para cloud** - AWS ECS, Kubernetes, etc.

### Desvantagens

⚠️ **Rebuild lento** - Mudanças requerem rebuild da imagem
⚠️ **Debugging complexo** - Precisa entrar no container
⚠️ **Mais recursos** - Cada serviço usa mais memória/CPU

### Setup Produção

```bash
# 1. Build de todas as imagens
docker-compose build

# 2. Subir todos os serviços
docker-compose up -d

# 3. Ver logs
docker-compose logs -f

# 4. Parar tudo
docker-compose down
```

### Estrutura Docker (Produção)

```yaml
# docker-compose.yml (produção)
services:
  postgres:
    image: postgres:15-alpine
    # ... configuração

  backend:
    build: ./packages/backend
    depends_on:
      - postgres

  orchestrator:
    build: ./packages/orchestrator
    # ... configuração

  web-panel:
    build: ./packages/web-panel
    # ... configuração
```

---

## 📊 Comparação

| Aspecto | Desenvolvimento (Híbrida) | Produção (Docker) |
|---------|---------------------------|-------------------|
| **Setup inicial** | `./scripts/dev-setup.sh` | `docker-compose up` |
| **Hot-reload** | ✅ Instantâneo | ❌ Precisa rebuild |
| **Debugging** | ✅ Nativo no IDE | ⚠️ Requer attach |
| **Logs** | ✅ Terminal direto | ⚠️ `docker logs` |
| **Consistência** | ⚠️ Depende do SO | ✅ Total |
| **Performance** | ✅ Mais rápido | ⚠️ Overhead de containers |
| **Isolamento** | ⚠️ Parcial | ✅ Completo |
| **Deploy** | ❌ Manual | ✅ Automatizado |
| **Recursos** | 🟢 Leve | 🟡 Moderado |

---

## 🎯 Como Escolher

### Use **Desenvolvimento Híbrido** quando:

- Está desenvolvendo features
- Precisa de hot-reload rápido
- Quer debugar código facilmente
- Está testando mudanças localmente
- Tem Node.js instalado localmente

### Use **Docker Completo** quando:

- Está testando deployment
- Precisa de ambiente idêntico à produção
- Vai fazer deploy em AWS/Cloud
- Está em CI/CD pipeline
- Quer isolamento total entre serviços

---

## 💡 Workflow Recomendado

```
1. Desenvolvimento:
   └─> Híbrido (npm run dev + Docker só para PostgreSQL)

2. Testes Locais de Deploy:
   └─> Docker Completo (docker-compose up)

3. Staging/Produção:
   └─> Docker Completo em AWS ECS/Kubernetes
```

---

## 🔧 Migrando Entre Abordagens

### De Híbrido → Docker

```bash
# Parar serviços locais (Ctrl+C nos terminais)
# Parar PostgreSQL
docker-compose -f docker-compose.dev.yml down

# Subir Docker completo
docker-compose up -d
```

### De Docker → Híbrido

```bash
# Parar Docker completo
docker-compose down

# Executar setup
./scripts/dev-setup.sh

# Executar apps localmente (3 terminais)
```

---

## 📝 Resumo

**Para desenvolvimento diário**: Use a abordagem híbrida (dev-setup.sh)
**Para produção/deploy**: Use Docker completo (docker-compose.yml)

A abordagem híbrida oferece a melhor experiência de desenvolvimento, enquanto Docker completo garante consistência em produção.
