# stouro-offers

Gestão de pedidos e financeiro de um **ateliê de costura** (B2B, por cliente).
A aplicação organiza o catálogo de cada cliente, transforma romaneios em
pedidos, acompanha o status de cada pedido e mantém um **livro-razão (ledger)
imutável** que é a fonte da verdade de todo o financeiro.

> Stack: Next.js (App Router) + React 19 · Prisma + PostgreSQL · React Query ·
> React Hook Form + Zod · Biome · pnpm

---

## Índice

1. [Fluxo completo](#fluxo-completo)
2. [Arquitetura](#arquitetura)
3. [Módulo de Pedidos](#modulo-de-pedidos)
4. [Módulo Financeiro](#modulo-financeiro)
5. [Modelo de dados](#modelo-de-dados)
6. [Erros e validação](#erros-e-validacao)
7. [Configuração e ambiente](#configuracao-e-ambiente)
8. [Padrões de frontend](#padroes-de-frontend)
9. [Rodando o projeto](#rodando-o-projeto)
10. [Roadmap e débitos técnicos](#roadmap)

---

## Fluxo completo

```
 CLIENTE                              PEDIDO                                  FINANCEIRO
────────                             ──────                                  ──────────
┌──────────────┐   catálogo   ┌───────────────────┐  concluir      ┌──────────────────────────┐
│ Product      │──────────────▶│ DRAFT             │───────────────▶│ CHARGE  (ledger)         │
│ (por cliente)│              │ itens (snapshot)  │                │ Cobrança do pedido #X    │
│ Preço em     │              │ amountTotal       │                └────────────┬─────────────┘
│ centavos     │              └────────┬──────────┘                             │
└──────────────┘                       │ romaneio (imagem → IA)                 ▼
        ▲                              │ adiciona itens                ┌──────────────────────────┐
        │                              ▼                               │  RECONCILIAÇÃO (FIFO)     │
        │                       ┌───────────────┐                      │ créditos ≥ pedido?       │
        │                       │ COMPLETED     │─────────────────────▶│ marca COMPLETED → PAID   │
        │                       │ (faturado)    │                      └────────────┬─────────────┘
        │                       └──────┬────────┘                                   │
        │        cancelar              │                                            ▼
        │   ┌──────────────────────────┴──────────────┐                   ┌──────────────────────────┐
        │   ▼                                         ▼                   │  PAYMENT (manual)        │
        │  CANCELLED                          REVERSAL −CHARGE              │  registrar pagamento    │
        │  (não fatura)                       + ADJUSTMENT (reembolso)      │  → vira crédito         │
        │                                     ou crédito (sem refund)      │  → reconcilia de novo   │
        └───────────────────────────────────────────────────────────────────┴──────────────────────────┘
```

**Resumo da jornada:** a costureira cadastra um **cliente** e seus **produtos**
(preço por unidade). Um pedido começa como **rascunho**, pode ser montado à mão
ou a partir de um **romaneio** (foto → IA extrai itens → casa com o catálogo).
Ao **concluir**, o sistema emite a cobrança no ledger (fatura). Quando o
cliente **paga** (registro manual de pagamento), a **reconciliação** aplica o
crédito às cobranças abertas na ordem da fila e marca os pedidos como **pagos**.
**Cancelar** um pedido nunca apaga histórico: um estorno (`REVERSAL`) desfaz a
cobrança, e o dinheiro devolvido/crédito vira transação própria.

---

## Arquitetura

```
┌───────────────────────────────────────────────────────────────────────────────┐
│  src/app            páginas (client) e rotas REST finas                      │
│  ├─ _components / create / orders / financial / api/…                       │
│                                                                              │
│  src/components     UI kit (drawer, item, field, currency…) + forms +        │
│                     layouts (AppLayout/FormLayout) + providers               │
│                                                                              │
│  src/lib/clients    api (módulos por domínio: customers/orders/transactions/ │
│                     financial), http, db (Prisma), query provider            │
│                                                                              │
│  src/lib/services   REGRA DE NEGÓCIO — nunca chamam HTTP                     │
│  │  order | financial | transaction | reconciliation | manifest | s3        │
│  │  payment-gateway | customer | transaction-resolver/…                     │
│  │                                                                           │
│  src/lib/utils      enums, error (AppError), validations (zod), labels,      │
│                     math, order (ordenação), query (cache)                   │
│                                                                              │
│  prisma/schema      modelo de dados (PostgreSQL)                             │
└───────────────────────────────────────────────────────────────────────────────┘
```

**Convenções de arquitetura (não-negociáveis):**

- **Rota fina → service**: handlers de API só fazem `parse` (zod) e delegam a um
  método em `src/lib/services/*`. Regra de negócio nunca mora na rota.
- **Erro estruturado**: serviços lançam `AppError` (`code`, `category`,
  `details`). Rotas devolvem `error.toJSON()` com status adequado.
- **Transação é fonte da verdade**: o ledger (`Transaction`) é **imutável** —
  nunca se edita nem deleta uma transação. Correções entram como novas
  transações (estorno/ajuste). Todo cálculo financeiro é um **reduce** sobre as
  linhas do ledger.
- **Valores em centavos**: `amount`, `price` e `amountTotal` são `Int` em
  centavos. UI converte com `formatCurrency(value, divide=100)`; inputs
  monetários (`CurrencyInput`) entregam texto em reais parseado por schema.
- **Resolver por target**: toda transação passa por um *transaction input
  resolver* (`getTransactionInputResolver("CUSTOMER")`) que valida o alvo e
  aplica o **sinal contábil** — a regra de sinal mora num lugar só.
- **Cache**: telas usam `useQuery` com chaves por prefixo
  (`["orders"]`, `["financial"]`, `["customers", id, "ledger"]`) e invalidam via
  `invalidateQueries([...])` — invalidar `"orders"` também atualiza
  `["orders", id]`.
- **Fuso**: meses financeiros usam `America/Sao_Paulo` (UTC−3, sem DST).

---

## Módulo de Pedidos

### Estados do pedido

```
        criar itens          concluir (emite cobrança)          pagamento (reconciliação)
   ┌───────────┐   editar   ┌──────────────┐   ┌──────────────┐   ┌──────────────┐
   │   DRAFT   │───────────▶│  COMPLETED   │──▶│     PAID     │
   └─────┬─────┘            └──────┬───────┘   └──────────────┘
         │                        │
         │        cancelar        │   cancelar
         └────────────────────────┴──────────────┐
                          ┌──────────────────────▼───────┐
                          │        CANCELLED             │
                          └──────────────────────────────┘
```

**Regras de transição:**

| De | Para | Como | Efeitos |
|---|---|---|---|
| `DRAFT` | `COMPLETED` | botão "Concluir Pedido" | cria `CHARGE` no ledger (valor dos itens) e roda a reconciliação (crédito prévio pode já pagar) |
| `DRAFT` | `CANCELLED` | "Cancelar" | nada é lançado (pedido nunca cobrou) |
| `COMPLETED` | `CANCELLED` | "Cancelar" | cria `REVERSAL` (− cobrança) — o faturamento deixa de contar o pedido |
| `PAID` | `CANCELLED` | drawer configurável | `REVERSAL` + **ou** reembolso (`ADJUSTMENT` +, com gateway) **ou** crédito ao cliente (pagamento permanece) |
| `CANCELLED` | `DRAFT` | "Restaurar" (UI só para cancelado) | volta ao rascunho para edição; histórico do ledger permanece |

**Regras de negócio de pedido:**

- **Só rascunho edita**: itens (nome/quantidade/preço) só mudam com
  `status = DRAFT`. Editar/remover item recalcula `amountTotal` no mesmo
  `$transaction`.
- **Snapshot**: `OrderItem` guarda `name`/`price` copiados do produto — mudar o
  catálogo depois não altera pedidos antigos. Editar um produto pelo drawer do
  pedido **sincroniza** opcionalmente o item do rascunho correspondente.
- **Ordem estável dos itens**: `createdAt` + `id` como desempate
  (`ORDER_ITEM_ORDER_BY`) — a ordem dos itens nunca muda ao editar.
- **Merge**: itens duplicados podem ser mesclados somando quantidades.
- **Numeração**: `orderNumber` = ano + sequencial anual zero-padded
  (ex.: `202600001`); `position` é um contador global que ordena a fila de
  pagamento.
- **Pagamento de pedido não existe por botão**: `PAID` é **derivado** — só a
  reconciliação automática promove `COMPLETED → PAID`. Não há regressão de
  status (pago nunca volta sozinho).

### Catálogo (produtos)

```
Product ── belongsTo ── Customer        Product.status: ACTIVE | INACTIVE
```

- Produtos são **por cliente** (catálogo próprio de cada comprador).
- **Arquivar** (`ACTIVE → INACTIVE`) esconde do fluxo de novos pedidos — a ação
  mora no drawer de edição do produto. **Desarquivar** restaura.
- Aba "Ativos/Arquivados" na criação de pedido (badges com contagem).
- Preço em **centavos**; valor unitário mostrado como `R$ x,xx /un`.

### Romaneio (manifesto)

```
 foto/imagem do romaneio (≤ 5MB)
        │  s3.upload + manifest.generateManifest (OpenAI, extração estruturada)
        ▼
 itens extraídos (descrição, qtd, preço)
        │  manifest.resolveProducts(customerId, items)
        ▼
 ┌─ existe produto com nome parecido? (normalizado)
 │     sim → reusa produto; preço do romaneio se vier, senão o do catálogo
 │     não → cria Product novo (auto)
 ▼
 cria OrderItems + registro de Manifest (payload completo, arquivo no S3)
 recalcula amountTotal
```

- Documento classificado em `HANDWRITTEN` (folha de caderno) ou `PRINTED`.
- O manifesto fica vinculado ao pedido e ao cliente (payload JSON + URL do
  arquivo), e serve de histórico auditável.
- O `create-order` também permite adicionar produto novo e editar direto.

### Arquivos do módulo

| Camada | Arquivos |
|---|---|
| Telas | `src/app/orders/[orderId]/…`, `src/app/orders/[orderId]/page.tsx`, `src/app/_components/{list-orders,order-card}.tsx` |
| Fluxo de criação | `src/app/create/page.tsx` → `src/app/create/[customerId]/page.tsx` → `src/components/forms/create-order` |
| Ações | `order-more-options` (Concluir/Cancelar/Restaurar), `cancel-order-drawer`, `edit-order-item-drawer`, `edit-product-drawer`, `add-manifest-drawer`, `download-order-pdf-button` |
| API | `src/app/api/orders/**`, `src/app/api/products/**`, `src/app/api/customers/[customerId]/{products,beneficiaries}` |
| Regra | `src/lib/services/order.ts`, `manifest.ts`, `src/lib/utils/order.ts` |

---

## Módulo Financeiro

### O ledger

```
Transaction  (imutável — fonte da verdade)
─────────────────────────────────────────
  targetType/targetId  → dono da linha (hoje: CUSTOMER)
  type                 → CHARGE | PAYMENT | ADJUSTMENT | REVERSAL
  amount               → centavos, COM SINAL (convenção abaixo)
  description          → legível (ex.: "Cobrança do pedido #202600001")
  metadata             → JSONB (referência/origem)
```

**Convenção contábil de sinal** (aplicada pelo resolver do CUSTOMER):

```
 Tipo          Payload (UI)    Gravado no banco    Efeito no saldo (Σ amounts)
───────────    ────────────    ─────────────────   ───────────────────────────
 CHARGE        módulo (+)      + (positivo)        cliente deve MAIS
 PAYMENT       módulo (+)      − (negativo)        cliente deve MENOS
 ADJUSTMENT    ± livre         ± (preservado)      desconto − / taxa + / etc.
 REVERSAL      módulo (+)      − (negativo)        estorno: desfaz o CHARGE
```

> `saldo do cliente = Σ amount` → positivo = **a receber**, negativo = o
> cliente tem **crédito** (saldo credor/a pagar por nós).

**Regras de ouro do ledger:**

1. **Nunca editar/deletar transação.** Cancelamento de pedido com cobrança não
   apaga o `CHARGE`: cria um **`REVERSAL` espelhando o valor exato da linha**
   (par `CHARGE +100 / REVERSAL −100` soma zero e o histórico fica íntegro).
2. `REVERSAL` **não é dinheiro**: entra no saldo, mas **não** entra no pool de
   créditos da reconciliação nem em métricas de pagamento.
3. Reembolso (dinheiro devolvido) é um `ADJUSTMENT` **positivo** com
   `metadata.orderId` — ele reduz o crédito disponível do cliente.

**Metadados por tipo:**

```
 CHARGE      { reference?, orderId? }               (emitida por markAsCompleted)
 PAYMENT     { source: "ORDER", orderId }  |        (manual hoje; ORDER = futuro)
             { source: "MANUAL", method: PIX|CASH|TRANSFER }
 ADJUSTMENT  { reason, orderId? }
 REVERSAL    { orderId }                             (espelho do CHARGE cancelado)
```

### Reconciliação automática (COMPLETED → PAID)

```
 créditos do cliente = −Σ (PAYMENT + ADJUSTMENT)      ← REVERSAL não entra aqui
 fila de cobranças   = orders COMPLETED + PAID, ordenados por position
                        FIFO (asc) | LIFO (desc)      ← APP_CONFIG.reconciliation.strategy

 para cada pedido na fila:
     créditos >= amountTotal ?  → consome e marca PAID (se ainda COMPLETED)
                               :  → para (não cobre o próximo)
```

- Roda **no mesmo `$transaction`** da criação de pagamento e da conclusão de
  pedido — nunca regride status.
- Pedidos já `PAID` entram na fila para "consumir" crédito na ordem certa
  (sem isso, um pagamento já alocado pagaria duas vezes).

### Cancelamento configurável de pedido pago

```
 GET /orders/:id/cancel-options     (status, elegibilidade do cliente, gateway,
                                     valor reembolsável — async)
 POST /orders/:id/cancel            body: { refund?: { amount } }

 cancelar pedido pago:
   ├─ reembolsar  → gateway.refund() primeiro (fora da tx) e, dentro da $tx:
   │                REVERSAL do CHARGE + ADJUSTMENT +amount (reembolso)
   └─ virar crédito → REVERSAL do CHARGE; o PAYMENT permanece ⇒ crédito do cliente
```

- Gateway ativo: `APP_CONFIG.payments.gateway`. `MANUAL` é o único implementado;
  `ASAAS`/`MERCADO_PAGO` são contratos stub (`AppError NOT_IMPLEMENTED`).
- Elegibilidade hoje: cliente `ACTIVE` (`isCustomerEligibleForCancellation`,
  async — preparado para regras do gateway).

### Telas e métricas

**`/financial` (visão geral — valores desde sempre):**

```
 [ Receita Líquida ]   = paid − refunds          (o que realmente ficou com a gente)
  A Receber            = Σ saldos > 0 por cliente (nunca negativo; 0 se ninguém deve)
  Créditos             = Σ |saldos < 0| por cliente (crédito em circulação)
  Total cobrado        = Σ CHARGE + Σ REVERSAL    (faturamento de pedidos válidos —
                                                   cancelado não fatura)
  Reembolsos           = Σ ADJUSTMENT c/ orderId  (dinheiro devolvido)
```

```
 paid      = −Σ PAYMENT            (recebido, inverte o sinal gravado)
 refunds   = Σ ADJUSTMENT(orderId) (reembolsos)
 balance   = Σ amounts             (posição real, inclui créditos)
```

- Lista de clientes com saldo real individual (`a receber`/`crédito`/`em dia`,
  com atalho **Pagar**).
- **Registrar Pagamento**: `/financial/pay` (escolhe cliente) →
  `/financial/pay/[customerId]` (cards A receber/Crédito, valor, método
  PIX/Dinheiro/Transferência). Lança `PAYMENT source: MANUAL` e reconcilia.

**`/financial/activity` (extrato mensal):**

```
 MonthPicker (yyyy-MM, trava no futuro)  →  GET /api/financial/activity?month=
 Resultado do Mês (destaque)  = pagamentos − reembolsos do mês
 Total Recebido               = pagamentos que entraram no mês
 Reembolsos                   = estornos/devoluções do mês
 Saldos mensais: mês selecionado + 3 anteriores (abertura/fechamento)
 Extrato agrupado por dia, mais recente primeiro — cada linha é uma transação:
   ícone + descrição + data · cliente + badge do tipo (Estorno mostra sinal −)
```

> O extrato é **movimentação financeira** (entradas/reembolsos). Cobrança
> (faturamento) fica fora daqui — está no overview da home.

- Janelas de mês calculadas em **America/Sao_Paulo** (UTC−3, sem DST).

### Arquivos do módulo

| Camada | Arquivos |
|---|---|
| Regra | `src/lib/services/financial.ts`, `transaction.ts`, `reconciliation.ts`, `payment-gateway.ts`, `customer.ts`, `transaction-resolver/*` |
| Validação | `src/lib/utils/validations/transaction.ts` (discriminated union por `type`) |
| API | `src/app/api/transactions/route.ts`, `src/app/api/financial/{route,activity}/route.ts`, `src/app/api/customers/[customerId]/ledger/route.ts`, `src/app/api/orders/[orderId]/{cancel,cancel-options,complete}/route.ts` |
| Telas | `src/app/financial/**` (`page`, `activity`, `pay`), `src/components/forms/register-payment`, `cancel-order-drawer` |
| UI de apoio | `activity-money-header`, `month-picker`, `tile-money`, `customer-line`, `activity-line`, `month-balances` |

---

## Modelo de dados

```
Customer ─┬─< Order ──< OrderItem >── Product ──< Beneficiary
          │        │                   │
          │        └──< Manifest       └─< Customer (dono do catálogo)
          ├─< Product
          ├─< Beneficiary
          ├─< Payment        (legado/morto — sem consumidores)
          └─< Manifest

Transaction (ledger)  ── genericão: targetType + targetId (CUSTOMER)
  @@index([targetType, targetId, createdAt])

Link      (sem consumidores hoje)
```

| Modelo | Campos principais | Notas |
|---|---|---|
| `Customer` | name, color, status (`ACTIVE`/`INACTIVE`), note | dono do catálogo e do ledger |
| `Order` | amountTotal (centavos), orderNumber, status (`DRAFT`/`COMPLETED`/`PAID`/`CANCELLED`), position | `PAID` é derivado da reconciliação |
| `OrderItem` | name/price (snapshot), quantity | `onDelete: Cascade` com Order; `Restrict` com Product |
| `Product` | name, price (centavos), icon, status | por cliente; arquivável |
| `Beneficiary` | name | vinculado a produtos |
| `Transaction` | amount, type, targetType, targetId, description, metadata (JsonB) | **imutável** |
| `Manifest` | documentType, payload (JsonB), fileUrl | romaneio processado por IA |
| `Payment` | amount, paymentMethod, metadata | sem consumidores hoje — substituído pelo ledger `Transaction` |

---

## Erros e validação

```
AppError { code, category, message, details?, cause? }
  code:     INVALID_INPUT | NOT_IMPLEMENTED
  category: VALIDATION | INTERNAL
```

- Serviços lançam `AppError`; helpers `isAppError(error, code?)`.
- Inputs públicos validados com **zod** (`z.treeifyError` → `400`); o schema de
  transação é um `discriminatedUnion("type")` — cada tipo exige seus metadados.
- Rotas respondem `{ error }` com o JSON do `AppError`; erros inesperados viram
  `500`.

---

## Configuração e ambiente

`src/app.config.ts` centraliza constantes de negócio:

```
APP_CONFIG
 ├─ name/description           ("Aura" — Gestão para Ateliê de Costura)
 ├─ company                    (nome/e-mail/telefone p/ PDFs)
 ├─ pdf.filenamePrefix
 ├─ reconciliation.strategy    "FIFO" | "LIFO"   (hoje FIFO)
 └─ payments.gateway           "MANUAL" | "ASAAS" | "MERCADO_PAGO"
```

Variáveis de ambiente (`.env`):

```
DATABASE_URL         # PostgreSQL (Prisma adapter-pg)
OPENAI_API_KEY       # extração de romaneios (manifest)
S3_REGION / S3_ENDPOINT / S3_ACCESS_KEY_ID / S3_SECRET_ACCESS_KEY / S3_BUCKET_NAME
```

---

## Padrões de frontend

- **Componentização**: telas em `src/app/<rota>/_components/`; formulários
  reutilizáveis em `src/components/forms/<nome>/index.tsx`; UI kit em
  `src/components/ui/` (drawer, field, item, currency-input, tabs…).
- **Páginas client + React Query**: `useQuery` com chave por prefixo; mutações
  via `useMutationAPI` (toast loading/success/error) + `invalidateQueries`.
- **Fluxo em páginas**: escolher entidade → rota parametrizada
  (`/create` → `/create/[customerId]`, `/financial/pay` →
  `/financial/pay/[customerId]`) com query de detalhes na página alvo.
- **Forms**: React Hook Form + `zodResolver` + `Controller`; **`useWatch`** para
  reagir a valores; inputs monetários = `CurrencyInput` (entrega texto;
  converter com `Number(s.split(",").join("."))` → centavos no submit).
- **Drawers**: ações destrutivas/configuráveis em drawers com `useDisclosure` +
  `useOverlayedActive` (ex.: `cancel-order-drawer`, `edit-product-drawer`).
- **Labels/cores centralizados**: `use-labels` e `use-label-colors` (por status
  de pedido/produto e tipo de transação).

---

## Rodando o projeto

```bash
pnpm install            # dependências
# (opcional) ajustar .env — ver "Configuração e ambiente"
npx prisma generate     # gera client em src/generated/prisma
npx prisma db push      # aplica o schema no banco (rota do dado)
pnpm dev                # http://localhost:3000
```

Scripts:

```bash
pnpm dev        # next dev --turbo
pnpm build      # next build
pnpm start      # next start
pnpm lint       # biome check
pnpm format     # biome format --write
pnpm db         # prisma db
```

> ⚠️ Não rode `pnpm build` com o dev server ativo (compartilham `.next/`).

---

## Roadmap

- **Gateways reais**: implementar `refund` de ASAAS e Mercado Pago (hoje
  stubs `NOT_IMPLEMENTED`) e a origem `PAYMENT { source: "ORDER" }`.
- **Extrato por cliente**: tela própria usando `GET /customers/:id/ledger`
  (rota pronta, sem UI).
- **Limpeza**: remover `Payment`/`Link` (modelos mortos) e o
  `create-customer-button.tsx` sem uso.
- **Rota de restore** aceita qualquer status ≠ DRAFT (a UI só expõe para
  `CANCELLED`) — avaliar trava de COMPLETED/PAID para evitar estado
  inconsistente com o ledger.
