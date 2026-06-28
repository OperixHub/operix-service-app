# Operix Service App

Frontend Vue/Vite do Operix Service. A aplicação consome a API, autentica com Keycloak/Google, executa onboarding de empresa e renderiza menus/páginas dinamicamente conforme permissões, plano, trial e modo de implantação.

## Visão Geral

Responsabilidades:

- iniciar login Google via Keycloak com Authorization Code + PKCE;
- armazenar sessão local mínima;
- conduzir onboarding quando o usuário autenticado ainda não tem tenant;
- carregar permissões em `/api/permissions/me`;
- renderizar navegação com base no navigation registry;
- ocultar páginas e menus sem permissão;
- expor telas operacionais, usuários e configurações;
- manter consistência visual com PrimeVue, PrimeFlex e layout atual.

O backend continua sendo a fonte de verdade para autorização. O frontend apenas melhora UX escondendo recursos indisponíveis.

## Arquitetura

```text
src/
  assets/                  Tema, layout e estilos SCSS
  config/                  Endpoints da API
  layout/                  Shell autenticado, topbar, sidebar e menu
  router/
    index.js               Rotas e guards
    navigation.registry.js Registro dinâmico de navegação
  service/
    Axios.js               Cliente HTTP com token e refresh
    AuthSession.js         Sessão, permissões e contexto de acesso
    Authorization.js       Snapshot de permissões
    pkce.js                Geração PKCE
  views/
    auth/                  Login, callback Keycloak e onboarding
    definitions/
      Users/               Gestão de usuários do tenant
      Settings/            Perfil, empresa e sistema
    operational/           Serviços, status e tipos de produto
    utils/                 Loading e mensagens
```

## Fluxo de Autenticação

1. usuário acessa `/login`;
2. clica em `Entrar com Google`;
3. app gera PKCE e chama `/api/auth/authorize`;
4. navegador redireciona para Keycloak/Google;
5. Keycloak retorna para `#/auth/callback`;
6. app chama `/api/auth/callback`;
7. app persiste tokens e usuário;
8. se `onboarding_required`, navega para `/onboarding`;
9. após onboarding, carrega permissões e acessa `/dashboard`.

Não existe mais tela pública de cadastro. Empresa é criada somente pelo onboarding pós-SSO. Usuários internos são criados em `Definições > Usuários`.

## Menus Dinâmicos

O registry fica em `src/router/navigation.registry.js`.

Cada item declara:

- `label`;
- `icon`;
- `to`;
- `permission`;
- `children`.

O menu usa `buildNavigation(getPermissions())`. Se a permissão não está no snapshot, o item não aparece. Os guards também bloqueiam navegação direta para páginas registradas sem permissão.

## Profile e Configurações

Tela: `/definicoes/configuracoes`

Abas:

- Perfil: nome, email, avatar, cargo/papel e preferências;
- Empresa: nome, CNPJ, descrição e logo;
- Sistema: plano, trial, módulos habilitados, permissões efetivas e feature flags.

Endpoints usados:

- `GET/PATCH /api/profile/me`;
- `GET/PATCH /api/profile/company`;
- `GET /api/profile/system`;
- `GET /api/permissions/me`.

## Ambiente Local

Pré-requisitos:

- Node.js compatível com o projeto;
- npm;
- API local em execução;
- Keycloak configurado.

Setup:

```bash
cp .env.example .env
npm install
npm run dev
```

`.env`:

```env
VITE_BASE_URL_API=http://localhost:3333/api
```

URL local:

```text
http://127.0.0.1:5173/
```

Keycloak deve aceitar redirect:

```text
http://localhost:5173/*
http://127.0.0.1:5173/*
```

## Produção/SaaS

Recomendações:

- build estático servido por CDN, Nginx ou bucket;
- HTTPS obrigatório;
- `VITE_BASE_URL_API` apontando para domínio público da API;
- cache control para assets versionados;
- headers de segurança no proxy;
- CSP compatível com Keycloak;
- observabilidade de erros frontend;
- pipeline CI/CD com build e lint;
- variáveis sensíveis nunca embutidas além de URLs públicas.

## Scripts

- `npm run dev`: servidor Vite;
- `npm run build`: build de produção;
- `npm run preview`: preview do build;
- `npm run lint`: ESLint;
- `npm run start`: serve `dist`;
- `npm run test`: atualmente executa build/deploy legado do projeto original.

## Funcionalidades Atuais

- login Google via Keycloak;
- callback OIDC com PKCE;
- refresh token;
- onboarding de empresa;
- dashboard;
- serviços;
- status de serviço/pagamento;
- tipos de produto;
- usuários da empresa;
- permissões por módulos;
- configurações de perfil/empresa/sistema;
- menu dinâmico por permissão.

## Segurança

- tokens são enviados em `Authorization: Bearer`;
- sessão é limpa quando token expira;
- permissões são armazenadas como cache local de UX;
- backend continua validando permissões;
- usuário sem tenant só acessa onboarding;
- tela pública de cadastro foi removida para evitar bypass;
- rota direta sem permissão redireciona para dashboard.

## Desenvolvimento

Convenções:

- usar PrimeVue e PrimeFlex já existentes;
- preferir composables/services reutilizáveis;
- manter autorização centralizada em `AuthSession`, `Authorization` e router;
- novos menus devem entrar no `navigation.registry.js`;
- novas páginas devem ter permissão equivalente no backend;
- não duplicar endpoints de cadastro/autenticação.

Ao criar novo módulo:

1. adicionar permissão no backend;
2. incluir permissão no plano/role adequado;
3. criar rota Vue;
4. registrar menu no navigation registry;
5. validar com `/api/permissions/me`;
6. adicionar estado de loading/erro.

## Troubleshooting

- Login volta para erro: confira redirect URI no Keycloak.
- Menu vazio: confira `/api/permissions/me` e roles do usuário.
- Onboarding bloqueado: em modo `LOCAL`, já existe tenant.
- API 401: token expirado, issuer inválido ou Keycloak fora.
- API 403: permissão ausente ou plano sem módulo.
- Build com chunks grandes: avaliar code splitting/manual chunks futuramente.

## Roadmap

- billing e assinatura no app;
- tela de upgrade/downgrade;
- gestão avançada de roles;
- convites por email;
- auditoria visual;
- analytics por tenant;
- dashboards avançados;
- PWA;
- aplicativo mobile;
- white-label;
- marketplace de módulos;
- central de integrações;
- SSO corporativo enterprise;
- automações de atendimento;
- IA para resumo e triagem operacional;
- notificações push;
- relatórios exportáveis;
- monitoramento de uso e limites por plano.
