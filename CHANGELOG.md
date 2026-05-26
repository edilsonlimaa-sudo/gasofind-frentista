# Changelog - Gasofind Frentista

## [2.0.0] - Expansão para Sistema de Controle de Vendas

### 🎯 Visão Geral
Transformado de um app de controle de status do posto para um **sistema completo de controle de vendas** com foco em registro rápido de transações e controle de turnos.

### ✨ Novas Funcionalidades

#### 💰 Sistema de Vendas
- **Registro de Vendas**: Tela principal para lançamento rápido de vendas
  - Seleção de tipo de combustível
  - Entrada de volume (litros)
  - Escolha de forma de pagamento (Dinheiro, Débito, Crédito, PIX)
  - Cálculo automático do total
  - Validação de turno ativo antes de registrar

- **Histórico de Vendas**: Lista completa das vendas do dia
  - Cards detalhados de cada venda
  - Resumo diário (total de vendas + faturamento)
  - Pull-to-refresh para atualizar dados

#### ⏰ Controle de Turnos
- **Início/Encerramento de Turno**: Controle de expediente do frentista
  - Iniciar novo turno
  - Encerrar turno com resumo automático
  - Indicador visual de turno ativo
  - Tempo de duração do turno

### 🏗️ Arquitetura e Código

#### Novos Tipos/Modelos
- `Sale`: Registro de venda completo
- `Shift`: Turno/expediente do frentista
- `PaymentMethod`: Forma de pagamento
- `SalesSummary`: Resumo de vendas por período
- `ShiftSummary`: Resumo de turno com vendas

Arquivo: [src/types/sales.ts](src/types/sales.ts)

#### Novos Serviços
- `sales.service.ts`: Gerenciamento de vendas (atualmente com dados mockados)
  - `createSale()`: Registrar nova venda
  - `getSales()`: Listar vendas com filtros
  - `getSalesSummary()`: Obter resumo de vendas
  - `startShift()`: Iniciar turno
  - `closeShift()`: Encerrar turno
  - `getCurrentShift()`: Obter turno ativo

Arquivo: [src/services/sales.service.ts](src/services/sales.service.ts)

#### Novos Contextos
- `ShiftContext`: Gerenciamento global de turno ativo
  - Carrega turno atual ao iniciar app
  - Sincroniza estado de turno em todo o app
  - Hooks: `useShift()`

Arquivo: [src/contexts/shift-context.tsx](src/contexts/shift-context.tsx)

#### Novos Componentes

**Inputs**:
- `VolumeInput`: Campo numérico para litros com sufixo "L"
- `PaymentMethodSelector`: Seletor de forma de pagamento em grid

**Display**:
- `SaleCard`: Card para exibir detalhes de uma venda no histórico
- `ShiftControl`: Widget de controle de turno (iniciar/encerrar)

Arquivos:
- [src/components/volume-input.tsx](src/components/volume-input.tsx)
- [src/components/payment-method-selector.tsx](src/components/payment-method-selector.tsx)
- [src/components/sale-card.tsx](src/components/sale-card.tsx)
- [src/components/shift-control.tsx](src/components/shift-control.tsx)

#### Nova Estrutura de Navegação

**Navegação por Tabs** (3 abas):

1. **💰 Vendas** (Tab principal)
   - Tela de registro de vendas
   - Controle de turno integrado
   - Arquivo: [src/app/(tabs)/index.tsx](src/app/(tabs)/index.tsx)

2. **📋 Histórico**
   - Lista de vendas do dia
   - Resumo de vendas
   - Arquivo: [src/app/(tabs)/history.tsx](src/app/(tabs)/history.tsx)

3. **⚙️ Posto**
   - Funcionalidades antigas (abrir/fechar posto, fila, preços)
   - Movidas para segunda prioridade
   - Arquivo: [src/app/(tabs)/station.tsx](src/app/(tabs)/station.tsx)

Layout de tabs: [src/app/(tabs)/_layout.tsx](src/app/(tabs)/_layout.tsx)

### 🔄 Mudanças na Arquitetura

#### Antes:
```
App → LoginScreen | HomeScreen (controle do posto)
```

#### Agora:
```
App → LoginScreen | Tabs
                     ├─ Vendas (principal)
                     ├─ Histórico
                     └─ Posto (funcionalidades antigas)
```

### 📦 Dados Mockados (Temporário)

Por enquanto, o sistema de vendas funciona com **dados mockados em memória** no `sales.service.ts`:
- Vendas são armazenadas em array local
- Turnos são gerenciados em memória
- Dados se perdem ao recarregar o app

**TODO Backend**: Os endpoints da API precisam ser implementados:
- `POST /sales` - Registrar venda
- `GET /sales` - Listar vendas
- `GET /sales/summary` - Obter resumo
- `POST /shifts/start` - Iniciar turno
- `POST /shifts/:id/close` - Encerrar turno
- `GET /shifts/current` - Turno ativo

### 🎨 Design

- Mantém a identidade visual existente (Colors, Fonts, Spacing)
- Cards consistentes com o design system
- Indicadores visuais de estado (turno ativo, totais)
- Feedback imediato com toasts

### 🚀 Próximos Passos

1. **Backend**: Implementar endpoints de vendas no gasofind-backend
2. **Integração**: Substituir dados mockados por chamadas reais à API
3. **Funcionalidades Extras**:
   - Editar/excluir vendas
   - Filtros avançados no histórico
   - Relatórios detalhados
   - Exportação de dados
4. **Melhorias UX**:
   - Ícones próprios nos tabs (atualmente usando emojis)
   - Animações de transição
   - Offline-first com sincronização

### 📝 Notas Técnicas

- Expo SDK 56
- React Native com NativeWind
- TypeScript strict mode
- Estrutura de pastas escalável
- Separação clara de responsabilidades (services, contexts, components)

---

**Data da Expansão**: 26 de maio de 2026  
**Versão Anterior**: 1.0.0 (Controle de Status do Posto)  
**Versão Atual**: 2.0.0 (Sistema de Controle de Vendas)
