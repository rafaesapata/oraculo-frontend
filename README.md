# Oráculo Frontend

Frontend da aplicação Oráculo, baseado no projeto OUDS.

## Requisitos

- Node.js (v20+)
- pnpm (v10+)

## Instalação

```bash
# Instalar dependências
pnpm install
```

## Desenvolvimento

```bash
# Iniciar servidor de desenvolvimento
pnpm dev
```

## Build

```bash
# Gerar build de produção
pnpm build

# Visualizar build
pnpm preview
```

## Script de Inicialização

O projeto inclui um script de inicialização que facilita o processo de configuração e execução:

```bash
# Para iniciar em modo de desenvolvimento
./start_frontend.sh

# Para gerar build e iniciar em modo de produção
./start_frontend.sh build
```

## Configuração

Copie o arquivo `.env.example` para `.env` e ajuste as configurações conforme necessário:

```bash
cp .env.example .env
```

## Estrutura do Projeto

- `src/` - Código fonte da aplicação
  - `components/` - Componentes React
  - `hooks/` - React hooks personalizados
  - `lib/` - Bibliotecas e utilitários
  - `assets/` - Recursos estáticos (imagens, etc.)
- `public/` - Arquivos públicos
- `dist/` - Build de produção (gerado)

