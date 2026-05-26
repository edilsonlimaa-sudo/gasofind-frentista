# 💰 Gasofind Frentista - Sistema de Controle de Vendas

Aplicativo mobile para frentistas de postos de combustível registrarem vendas e gerenciarem operações diárias.

## 🚀 Quick Start (Modo Mock - Sem Backend)

O app está configurado para funcionar **sem backend** usando dados mockados:

```bash
# 1. Instalar dependências
npm install

# 2. Iniciar o app
npm start

# 3. Login com qualquer email/senha:
# Email: joao@posto.com
# Senha: qualquer_coisa
```

📖 **Veja o guia completo**: [MOCK_MODE.md](MOCK_MODE.md)

## ✨ Funcionalidades

### 💰 Sistema de Vendas
- Registrar vendas de combustível
- Controle de turnos (início/fim)
- Histórico de vendas do dia
- Resumo de faturamento

### ⚙️ Controle do Posto
- Abrir/fechar posto
- Atualizar nível de fila
- Publicar avisos operacionais
- Atualizar preços de combustível

### 🔐 Autenticação
- Login de frentista
- Sessão persistente
- Auto-refresh de token

## 📱 Navegação

```
🏠 Tabs
├─ 💰 Vendas (principal)
│   └─ Registrar vendas + controle de turno
├─ 📋 Histórico
│   └─ Lista de vendas + resumo
└─ ⚙️ Posto
    └─ Status, fila, avisos, preços
```

## 🛠️ Stack Técnico

- **Framework**: Expo 56 + React Native
- **Navegação**: Expo Router (file-based)
- **Estilo**: NativeWind (Tailwind CSS)
- **Estado**: React Context API
- **Armazenamento**: Expo SecureStore
- **Linguagem**: TypeScript

## 📂 Estrutura do Projeto

```
src/
├── app/               # Telas (Expo Router)
│   ├── (tabs)/       # Navegação por tabs
│   │   ├── index.tsx       # Vendas
│   │   ├── history.tsx     # Histórico
│   │   └── station.tsx     # Posto
│   └── _layout.tsx   # Layout raiz
├── components/       # Componentes reutilizáveis
├── contexts/         # Contextos React (Auth, Shift)
├── services/         # Camada de API
├── types/            # Definições TypeScript
├── hooks/            # Custom hooks
└── constants/        # Tema e configurações
```

## 🔧 Desenvolvimento

### Comandos Disponíveis

```bash
# Iniciar dev server
npm start

# Iniciar com cache limpo
npm start -- -c

# Rodar linter
npm run lint

# Build para produção
npm run build
```

### Modos de Operação

#### 🧪 Modo Mock (Atual)
```typescript
// src/services/auth.service.ts
const USE_MOCK_AUTH = true;

// src/services/stations.service.ts
const USE_MOCK_STATIONS = true;
```

#### 🌐 Modo Real (Com Backend)
```typescript
const USE_MOCK_AUTH = false;
const USE_MOCK_STATIONS = false;
```

📖 Veja [MOCK_MODE.md](MOCK_MODE.md) para detalhes completos.

## 📋 Documentação

- **[CHANGELOG.md](CHANGELOG.md)** - Histórico de mudanças e arquitetura
- **[MOCK_MODE.md](MOCK_MODE.md)** - Guia do modo desenvolvimento
- **[TESTING.md](TESTING.md)** - Guia de testes

## 🔄 Integração com Backend

Quando o backend estiver pronto:

1. Configure a URL no `.env`:
   ```env
   EXPO_PUBLIC_API_URL=http://192.168.1.100:3000
   ```

2. Desative os mocks:
   ```typescript
   // auth.service.ts
   const USE_MOCK_AUTH = false;
   
   // stations.service.ts
   const USE_MOCK_STATIONS = false;
   ```

3. Implemente endpoints de vendas no backend:
   - `POST /sales`
   - `GET /sales`
   - `GET /sales/summary`
   - `POST /shifts/start`
   - `POST /shifts/:id/close`

## 📝 Notas de Desenvolvimento

### Dados Mockados

**Frentista padrão:**
- Nome: João Silva
- Email: joao@posto.com
- ID: frentista_mock_123
- Posto: station_mock_456

**Preços mockados:**
- Gasolina: R$ 5,89/L
- Etanol: R$ 3,99/L
- Diesel: R$ 5,79/L
- Diesel S-10: R$ 6,19/L

### Limitações Atuais

⚠️ **Modo Mock**:
- Dados não persistem ao recarregar
- Vendas são perdidas ao fechar o app
- Qualquer email/senha funciona no login

## 🐛 Troubleshooting

### App não inicia
```bash
# Limpar cache
npx expo start -c

# Reinstalar dependências
rm -rf node_modules
npm install
```

### "Session expired" no modo mock
- Verifique `USE_MOCK_AUTH = true` em `auth.service.ts`

### Vendas não aparecem
- Certifique-se de iniciar um turno antes de registrar vendas
- Dados mockados são perdidos ao recarregar (esperado)

## 📱 Testando

### Android
```bash
npm start
# Pressione 'a' para abrir no emulador
```

### iOS
```bash
npm start  
# Pressione 'i' para abrir no simulador
```

### Web
```bash
npm start
# Pressione 'w' para abrir no browser
```

## 🤝 Projeto Relacionado

- **Backend**: [gasofind-backend](../gasofind-backend)
- **App Motorista**: Em desenvolvimento

## 📄 Licença

Veja [LICENSE](LICENSE)

---

**Versão**: 2.0.0 (Sistema de Vendas)  
**Última Atualização**: 26 de maio de 2026

## Join the community

Join our community of developers creating universal apps.

- [Expo on GitHub](https://github.com/expo/expo): View our open source platform and contribute.
- [Discord community](https://chat.expo.dev): Chat with Expo users and ask questions.
