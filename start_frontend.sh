#!/bin/bash

# Script de inicialização do frontend Oráculo
# Autor: Manus Agent
# Data: 05/06/2025

# Cores para output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}==================================================${NC}"
echo -e "${BLUE}      INICIALIZAÇÃO DO FRONTEND ORÁCULO           ${NC}"
echo -e "${BLUE}==================================================${NC}"

# Verificar se o Node.js está instalado
if ! command -v node &> /dev/null; then
    echo -e "${RED}[ERRO] Node.js não encontrado. Por favor, instale o Node.js.${NC}"
    exit 1
fi

# Verificar se o pnpm está instalado
if ! command -v pnpm &> /dev/null; then
    echo -e "${YELLOW}[AVISO] pnpm não encontrado. Tentando instalar...${NC}"
    npm install -g pnpm
    if [ $? -ne 0 ]; then
        echo -e "${RED}[ERRO] Falha ao instalar pnpm. Por favor, instale manualmente.${NC}"
        exit 1
    fi
    echo -e "${GREEN}[OK] pnpm instalado com sucesso.${NC}"
fi

# Verificar se o arquivo .env existe
if [ ! -f .env ]; then
    echo -e "${YELLOW}[AVISO] Arquivo .env não encontrado. Criando a partir do exemplo...${NC}"
    if [ -f .env.example ]; then
        cp .env.example .env
        echo -e "${GREEN}[OK] Arquivo .env criado com sucesso.${NC}"
    else
        echo -e "${YELLOW}[AVISO] Arquivo .env.example não encontrado. Criando .env padrão...${NC}"
        cat > .env << EOF
# OUDS - Configurações do Frontend
# =================================

# Configurações do servidor de desenvolvimento
OUDS_FRONTEND_HOST=0.0.0.0
OUDS_FRONTEND_PORT=3000
OUDS_FRONTEND_OPEN=false

# Hosts permitidos (separados por vírgula)
VITE_ALLOWED_HOSTS=localhost,127.0.0.1

# Configurações de HMR (Hot Module Replacement)
VITE_HMR_PORT=3000
VITE_HMR_HOST=localhost

# Versão do OUDS
OUDS_VERSION=1.0.25
EOF
        echo -e "${GREEN}[OK] Arquivo .env padrão criado com sucesso.${NC}"
    fi
fi

# Instalar dependências
echo -e "${BLUE}[INFO] Instalando dependências...${NC}"
pnpm install
if [ $? -ne 0 ]; then
    echo -e "${RED}[ERRO] Falha ao instalar dependências.${NC}"
    exit 1
fi
echo -e "${GREEN}[OK] Dependências instaladas com sucesso.${NC}"

# Verificar modo de execução
if [ "$1" == "build" ]; then
    # Modo de produção (build)
    echo -e "${BLUE}[INFO] Gerando build de produção...${NC}"
    pnpm build
    if [ $? -ne 0 ]; then
        echo -e "${RED}[ERRO] Falha ao gerar build de produção.${NC}"
        exit 1
    fi
    echo -e "${GREEN}[OK] Build de produção gerado com sucesso.${NC}"
    
    # Iniciar servidor de preview
    echo -e "${BLUE}[INFO] Iniciando servidor de preview...${NC}"
    echo -e "${GREEN}[OK] Acesse a aplicação em: http://localhost:3000${NC}"
    pnpm preview -- --host 0.0.0.0 --port 3000
else
    # Modo de desenvolvimento
    echo -e "${BLUE}[INFO] Iniciando servidor de desenvolvimento...${NC}"
    echo -e "${GREEN}[OK] Acesse a aplicação em: http://localhost:3000${NC}"
    pnpm dev -- --host 0.0.0.0 --port 3000
fi

