# Operix Service App

Aplicação web moderna para gerenciamento operacional, estoque e notificações do ecossistema Operix.

## 📋 Visão Geral

- **Runtime:** Bun
- **Framework Frontend:** Vue 3
- **Build Tool:** Vite
- **UI Components:** PrimeVue 3
- **Gerenciamento de Estado:** Vue Router + Custom Store
- **Autenticação:** JWT via Keycloak
- **Comunicação:** Axios + Socket.IO (tempo real)
- **Relatórios:** PDF com pdfmake

## 🚀 Pré-requisitos

### Local (sem Docker)
- [Bun](https://bun.sh/) >= 1.3.9
- Node.js >= 18 (opcional, para compatibilidade)

### Com Docker
- [Docker](https://www.docker.com/)
- [Docker Compose](https://docs.docker.com/compose/)

## 📦 Instalação Local

### 1. Clonar o repositório
```bash
git clone <repository-url>
cd operix-service-app
```

### 2. Instalar dependências
```bash
bun install
```

### 3. Configurar variáveis de ambiente
```bash
cp .env.example .env
```

Edite o arquivo `.env` com as URLs da sua API:
```env
VITE_BASE_URL_API=http://localhost:3333
```

## 🏃‍♂️ Como Rodar

### Desenvolvimento (sem Docker)

```bash
bun run dev
```

A aplicação estará disponível em `http://localhost:3000`

### Desenvolvimento (com Docker)

```bash
docker compose up -d
```

- App: `http://localhost:3000`
- API: `http://localhost:3333` (precisa estar rodando)

Para parar:
```bash
docker compose down
```

### Produção (sem Docker)

```bash
bun run build
bun run start
```

### Produção (com Docker)

```bash
docker compose -f compose.prod.yaml up -d
```

Para parar:
```bash
docker compose -f compose.prod.yaml down
```

## 📜 Scripts Disponíveis

```bash
bun run dev          # Inicia servidor de desenvolvimento Vite
bun run build        # Build para produção
bun run start        # Serve aplicação buildada
bun run preview      # Preview do build de produção
bun run homolog      # Build e deploy para GitHub Pages
bun run lint         # Executar linter ESLint
```

## 🔐 Variáveis de Ambiente

| Variável | Descrição | Padrão |
|----------|-----------|--------|
| `VITE_BASE_URL_API` | URL base da API Operix | `http://localhost:3333` |

**Nota:** Variáveis com prefixo `VITE_` são expostas ao cliente e injetadas durante build.

## 📁 Estrutura do Projeto

```
src/
├── App.vue                 # Componente raiz
├── main.js                 # Entry point
├── assets/
│   ├── styles.scss         # Estilos globais
│   └── layout/             # Variáveis e mixins SCSS
├── components/
│   └── PageHeader.vue      # Componentes reutilizáveis
├── config/
│   └── api.config.js       # Configuração de URLs da API
├── core/
│   ├── auth/
│   │   └── session.js      # Gerenciamento de sessão
│   ├── permissions/
│   │   ├── permissions.store.js
│   │   └── sidebar.catalog.js
│   └── ui/
│       └── flash.js        # Notificações toast
├── layout/
│   ├── AppLayout.vue       # Layout principal
│   ├── AppTopbar.vue       # Barra superior
│   ├── AppSidebar.vue      # Menu lateral
│   └── ...
├── router/
│   └── index.js            # Configuração de rotas
├── service/
│   ├── api-utils.js        # Utilitários API
│   ├── Axios.js            # Instância Axios configurada
│   └── PdfGenerator.js     # Gerador de PDFs
└── views/
    ├── Dashboard.vue       # Página inicial
    ├── auth/               # Autenticação (Login, Register)
    ├── definitions/        # Páginas de CRUD
    ├── inventory/          # Módulo de estoque
    ├── operational/        # Módulo operacional
    └── utils/              # Páginas auxiliares
```

## 🔗 Integração com API

A aplicação se conecta à API Operix Service API através de:

1. **URL Base:** Configurada em `VITE_BASE_URL_API`
2. **Autenticação:** JWT via Keycloak
3. **Headers HTTP:** Token Bearer automaticamente adicionado via Axios interceptor
4. **WebSockets:** Socket.IO para atualizações em tempo real

### Configurar Endpoint da API

Edite [src/config/api.config.js](src/config/api.config.js):

```javascript
const API_BASE_URL = import.meta.env.VITE_BASE_URL_API || 'http://localhost:3333';
```

## 🎨 Temas e Customização

### Temas Disponíveis
- `lara-light-blue` (padrão)
- `lara-dark-blue`

Temas CSS em: [public/themes/](public/themes/)

### Customizar Estilos

Edite variáveis SCSS em [src/assets/layout/_variables.scss](src/assets/layout/_variables.scss)

## 🐳 Docker

### Desenvolvimento

```bash
docker compose up -d --build
```

- Monta volumes para hot-reload
- Porta 3000 exposta
- Conecta à rede `operix-network`

### Produção

```bash
docker compose -f compose.prod.yaml up -d --build
```

- Build otimizado com multi-stage
- Sem volumes (imagem imutável)
- Pronto para ambientes de produção

## 🧪 Testes

A aplicação não possui testes automatizados configurados. Para adicionar:

```bash
# Instalar vitest (ou jest)
bun add -d vitest
```

## 📝 Commits e Versionamento

- Utilize commits semânticos (feat:, fix:, docs:, etc.)
- Versione alterações em [package.json](package.json)
- Mantenha [CHANGELOG](CHANGELOG.md) atualizado

## 🔒 Segurança

- Tokens JWT armazenados seguramente
- CORS configurado via API
- Sanitização de dados sensíveis
- Validação de formulários com vee-validate

## 📚 Dependências Principais

| Pacote | Versão | Uso |
|--------|--------|-----|
| Vue | ^3.2.41 | Framework frontend |
| Vite | - | Build tool |
| PrimeVue | 3.30.2 | Componentes UI |
| Axios | ^1.5.0 | HTTP client |
| Socket.IO Client | ^4.7.2 | WebSockets |
| vee-validate | ^4.11.8 | Validação de forms |
| jwt-decode | ^4.0.0 | Decodificar JWT |
| pdfmake | ^0.2.7 | Geração de PDFs |

## 🤝 Contribuindo

1. Crie uma branch para sua feature (`git checkout -b feature/MinhaFeature`)
2. Commit suas mudanças (`git commit -m 'feat: Adicionar MinhaFeature'`)
3. Push para a branch (`git push origin feature/MinhaFeature`)
4. Abra um Pull Request

## 📄 Licença

MIT © 2024-2026

## 👥 Autores

- João Pedro Pereira Lima

## 📞 Suporte

Para dúvidas ou problemas, abra uma issue no repositório.

## 🔄 Relacionados

- [Operix Service API](../operix-service-api) - Backend API
- [Keycloak](https://www.keycloak.org/) - Gerenciamento de identidade
- [PrimeVue Documentation](https://primevue.org/)
