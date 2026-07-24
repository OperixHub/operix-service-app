# Opeflow App

Painel administrativo e interface de usuário do Opeflow. Desenvolvido em Vue 3 com Vite e estilizado com PrimeVue e PrimeFlex.

---

## 🚀 Como Iniciar (Setup Rápido)

### Pré-requisitos
- **Node.js** (`>=16.17.0`)
- **NPM** ou **Yarn**
- **API (Backend)** rodando localmente (veja instruções no README da API)

### Passo a Passo
```bash
# 1. Clone o repositório e acesse a pasta
cd opeflow-app

# 2. Configure a URL da API no arquivo .env
cp .env.example .env

# 3. Instale as dependências
npm install

# 4. Inicie o servidor de desenvolvimento
npm run dev
```

- **URL do Painel:** `http://localhost:5173`

---

## 🔐 Fluxo de Autenticação & Onboarding

A interface interage dinamicamente com a API para guiar o usuário com base no status da conta:

```
       [ Usuário digita E-mail ]
                  │
        (Verifica na API)
         /             \
  [ Novo E-mail ]     [ E-mail Cadastrado ]
        │                       │
 (Criar Senha)            (Digitar Senha)
        │                       │
 (Registro na API)        (Login Direto)
        │                       │
 (Abre Onboarding)        (Abre o App)
```

- **Google OAuth / Social:** O login com o Google gera um fluxo PKCE seguro. Novos cadastros são identificados pelo campo `is_new_user: true` retornado pela API e redirecionados para a configuração de Onboarding.
- **Onboarding Opcional:** Coleta dados complementares da empresa e usuário. Todos os campos são opcionais e podem ser preenchidos depois, ou simplesmente pulados.

---

## 🛠️ Scripts Úteis

- `npm run dev` - Executa o servidor de desenvolvimento Vite.
- `npm run build` - Compila e otimiza a aplicação para produção (saída na pasta `dist/`).
- `npm run preview` - Executa localmente o build gerado na pasta `dist/` para testes de produção.
- `npm run lint` - Analisa o código em busca de erros de padrão/estilo com o ESLint.

---

## 🐞 Depuração no VS Code

Você pode depurar o frontend diretamente de seu editor VS Code colocando breakpoints nos arquivos `.vue` ou `.js`.

### Como Usar:
1. Certifique-se de que o servidor do frontend está rodando (`npm run dev`).
2. Abra o projeto no VS Code.
3. Vá para a aba **Run and Debug (Ctrl+Shift+D)**, selecione a configuração **Debug App (Chrome)** e clique no botão Play.
4. O VS Code abrirá uma janela do Chrome integrada. Qualquer breakpoint ativado no editor pausará a execução no navegador correspondente.

---

## 📂 Estrutura de Pastas

```text
src/
  assets/                  Estilos SCSS globais, temas e imagens
  config/                  Definição dos endpoints da API (/src/config/api.config.js)
  layout/                  Estrutura e casca do painel (Topbar, Sidebar, Menus)
  router/
    index.js               Gerenciamento de rotas e guards de navegação
    navigation.registry.js Registro central dos menus dinâmicos e permissões
  service/
    Axios.js               Cliente HTTP configurado com interceptador de tokens
    AuthSession.js         Gerenciamento de sessão, cache de permissões e perfil
  views/
    auth/                  Login, onboarding e retorno de autenticação social
    definitions/           Configurações de usuários e do sistema (perfil/empresa)
    operational/           Gestão operacional (serviços, status, produtos)
```

---

## ⚙️ Variáveis de Ambiente (.env)

O frontend precisa apenas saber onde a API está sendo executada:

```env
VITE_BASE_URL_API=http://localhost:3333/api
```

---

## 🛡️ Segurança no Frontend

- **Armazenamento de Sessão:** O token de acesso JWT é gerenciado na memória e no contexto da sessão de navegação.
- **Menu Dinâmico por Permissão:** A árvore de menus e opções em `navigation.registry.js` é gerada conforme as permissões recebidas da rota `/api/autenticacao/eu`.
- **Proteção de Rotas:** O router (`router/index.js`) impede o acesso direto a páginas restritas baseando-se no snapshot do usuário.
