<!--
Post de apresentação — Aura (stouro-offers). Público: devs a contratantes tech.
Formato enxuto p/ feed (ex.: LinkedIn). Antes de publicar:
  - Troque "Aura" pela marca final, se preciso.
  - Adicione o link do repositório público/demo no bloco final.
Títulos alternativos:
  - "A costureira não precisava de um app. Precisava que o caderno fechasse."
  - "A IA leu o papel. O sistema fez o resto."
  - "2 abas. 1 caderno aposentado."
-->

# A IA leu o papel. O caderno foi aposentado.

Um sistema de pedidos e faturamento para um ateliê de costura real 
que trabalha para confecções (B2B).

---

## O problema

O dia a dia era o de qualquer negócio de serviço com clientes recorrentes:

- chega um lote de peças com um **romaneio** — o papel que lista o que veio;
- cada cliente tem seu **catálogo** e preço de costura por peça;
- pedido anotado à mão, pagamento em dias diferentes, fechamento do mês
  na calculadora.

As dores:

- soma manual de dezenas de itens — errar pra menos perde dinheiro, pra mais
  perde cliente;
- "quanto fulano deve?" vira auditoria braçal de fim de mês;
- cancelou ou devolveu um pedido? a conta mental quebra na hora.

Planilha soma coluna. Não resolve fluxo. Era um caderno que não fechava.

## A idealização

A ideia inicial era sedutora: **tirar foto do romaneio e deixar a IA
transformar o papel em pedido**. Mas, ao desenhar, veio a percepção central:

> isso é um sistema de **pedido e faturamento** — registrar, cobrar, receber,
> saber o saldo. 
> 
> O romaneio é só uma forma de *entrada*, uma extensão.

IA na borda, não no centro. 

Decisões que saíram daí:

- **Duas abas, e só duas**: Pedidos | Financeiro. O negócio inteiro responde
  a duas perguntas — "o que está em andamento?" e "quanto está em aberto?".
- **SPA com Next.js**: um deploy, abre no navegador do celular, toda abertura
  já é a versão nova. Go-live rápido, distribuição simples, nada de loja.
- **Sem login, de propósito**: o uso é auto-hospedado — quem hospeda já
  controla o acesso. Autenticação, se um dia precisar, entra como camada.
- **PWA**: instala como app na tela inicial do celular.
- Catálogo por cliente, preço congelado no pedido (mudou catálogo, pedido
  antigo não muda), número sequencial por ano, PDF, extrato mensal.

Nada disso é revolucionário. Juntos, aposentam o caderno.

## A construção

Arquitetura e modelagem funcionaram como um **trilho para a IA**:

- regra de negócio separada das rotas (rota só valida e delega);
- dinheiro como inteiro em centavos — sem ponto flutuante;
- **ledger imutável**: nenhuma transação se apaga; correção é linha nova;
- "pago" é consequência, não clique: pagamento entra → sistema reconcilia →
  marca os pedidos como pagos, em ordem;
- cancelar pedido pago vira estorno no histórico — nada some.

```
foto do romaneio → rascunho → concluir (cobra) → pagamento → pago
cancelou? → estorno (histórico íntegro)
```

Dentro desse trilho, **a IA codificou quase todo o código**. 

A maior parte do trabalho humano foi idealizar e modelar: decidir o que entra no trilho.

**Stack**: Next.js + React, PostgreSQL + Prisma,
React Query, Zod. Roda local com pnpm + Docker.

## Experimente

```bash
pnpm install
docker compose up -d    # PostgreSQL
npx prisma db push
pnpm dev                 # localhost:3000
```

Há seed de demonstração pra testar o fluxo completo: montar pedido, concluir,
registrar pagamento e ver a reconciliação sozinha.

**[link do repositório público / demo]**

Qual processo seu ainda vive num caderno que não fecha? Talvez caiba em duas
abas.
