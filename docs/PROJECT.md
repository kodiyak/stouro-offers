<!--
Artigo de apresentação — Aura (stouro-offers)
Público: devs entusiastas a contratantes de tecnologia.
Tom: simples, direto, poucos termos técnicos (só os estabelecidos), pouco jargão de negócio.
Antes de publicar:
  - Substitua o nome "Aura" caso a marca final seja outra.
  - Adicione o link do repositório público / demo no trecho "Experimente".
  - O título é uma sugestão; variações no final do arquivo.
-->

# Aura: o sistema de pedidos e faturamento que nasceu da foto de um papel

*Artigo de apresentação do projeto. A história de um ateliê de costura real, o
desenho da solução e o que a construção ensinou sobre escopo e trabalho com IA.*

---

## O problema

O público deste projeto é simples de descrever: **ateliês de costura que
trabalham sob demanda para confecções e marcas**. Traduzindo: a costureira não
vende roupa pronta para o consumidor final — ela costura para outras empresas.

Nesse modelo, cada confecção é um cliente com características próprias:

- tem o **seu catálogo** de peças e o preço de mão de obra combinado por peça
  (costurar uma camiseta custa um valor, uma calça outro);
- envia **lotes periódicos** de peças para costurar;
- paga em **dias e formas diferentes** (PIX, dinheiro, transferência).

Cada lote chega acompanhado de um **romaneio**: o papel que lista o que veio —
a descrição das peças e as quantidades. É com base nele que o pedido é
conferido e, depois, cobrado.

O dia a dia, antes do sistema, era o de qualquer negócio de serviço que começa
num caderno:

1. chega o lote, a dona confere peça por peça com o romaneio na mão;
2. anota o pedido à mão e vai costurando ao longo dos dias;
3. quando entrega, soma na calculadora para saber o valor a cobrar;
4. quando o cliente paga, anota — e no fim do mês tenta reconstruir quem deve
   o quê garimpando páginas.

Os problemas concretos disso:

- **soma manual de dezenas de itens** — um erro para menos é dinheiro perdido;
  um erro para mais é cliente perdido;
- **"quanto cada cliente deve?"** vira uma auditoria braçal de fim de mês;
- **conferir pagamento é manual** — "esse PIX cobre o pedido tal?";
- **cancelamento e devolução quebram a conta mental**: se um pedido volta, a
  anotação do caderno não conta a história direito.

> Se você atende clientes recorrentes com catálogo, preço combinado e
> pagamento parcelado no tempo, esse é o seu problema também — costura,
> gráfica, mecânica, marmitaria, manutenção. É o clássico "caderno que não
> fecha", e uma planilha soma as colunas, mas não resolve o fluxo.

## A idealização

A ideia que deu origem ao projeto era sedutora e simples: **tirar uma foto do
romaneio e deixar a IA transformar o papel em um pedido**. Nada de digitar 30
linhas — a foto vira itens, quantidades e preços.

Mas foi ao desenhar a solução que o projeto encontrou o próprio eixo. Por trás
da "feature brilhante", o negócio é outra coisa: um **sistema de pedidos e
faturamento**.

- registrar o pedido com o valor certo;
- **concluir** o pedido = emitir a cobrança;
- **registrar o pagamento** do cliente;
- saber, a qualquer momento, o **saldo** de cada um.

O romaneio é apenas um dos caminhos de *entrada* de um pedido — um detalhe de
negócio, uma extensão (ótima, diga-se) e não o núcleo. Colocar a IA no centro
teria resultado num brinquedo de leitura de papel; colocá-la na borda resultou
num sistema que se sustenta mesmo sem ela.

Essa percepção guiou duas decisões de produto:

### Duas abas, e só duas

O aplicativo navega com uma barra inferior com **dois destinos**: **Pedidos** e
**Financeiro**. Não é economia de tela — é leitura do negócio. O dia a dia do
ateliê inteiro cabe em duas perguntas:

- **o que está em andamento?** (Pedidos — rascunho, concluído, pago, cancelado)
- **quanto está em aberto?** (Financeiro — saldo por cliente, pagamento,
  extrato)

Duas perguntas, duas abas. Qualquer aba extra seria a interface refletindo a
organização interna do software, e não o jeito como a dona do ateliê pensa.

### Web app, sem loja, sem login

- **SPA + Next.js**: o app é uma página única que conversa com uma API própria.
  Decisão tomada por um motivo pragmático: **go-live rápido e distribuição
  simples**. Um deploy só, abre no navegador do celular e — como é web — toda
  vez que abre já está na versão nova. Nada de publicar em loja de aplicativos.
- **Sem login, de propósito**: a expectativa de uso é a **auto-hospedagem** — o
  app roda onde você controla (um computador, um servidor, um Docker), com o
  seu banco de dados. Quem hospeda já controla o acesso; login entraria como
  atrito sem ganho real. Se um dia for abrir para uso público, autenticação
  entra como uma camada — sem tocar no núcleo.
- **Instalável como app (PWA)**: ganha ícone na tela inicial do celular e abre
  em tela cheia, com cara de aplicativo.
- **Dados por cliente**: cada confecção tem seu catálogo e seus preços. E cada
  pedido guarda um *retrato* do que foi vendido — se o catálogo mudar depois,
  pedidos antigos não mudam junto.

Foi nesse desenho que o projeto virou um **sistema útil**: número sequencial
por ano (o cliente pergunta "cadê o pedido tal?" e existe), PDF do pedido para
enviar ao cliente, saldo individual por cliente, extrato mensal para o
fechamento. Nenhuma peça é revolucionária; juntas, elas aposentam o caderno.

## A construção

A forma de construir foi tão importante quanto o que foi construído: **a
arquitetura e a modelagem funcionaram como um trilho (um harness) para a IA.**

Em vez de pedir "faça um app de pedidos", o trabalho começou pelas fronteiras:

- **regra de negócio não mora na rota**: a camada de regras é separada; as
  rotas de API só validam a entrada e delegam;
- **regras não negociáveis por escrito**: dinheiro é inteiro em centavos (nada
  de ponto flutuante); transação financeira nunca se apaga; erros são
  estruturados; validação de entrada em um só lugar.

Dentro desse trilho, **a IA codificou quase todo o código**. E aqui vem a
observação mais honesta do projeto: a **idealização e a modelagem foram a maior
parte do trabalho humano**. Quando o trilho está bem desenhado, a IA produz
código consistente em escala — o difícil é saber o que entra no trilho.

### A modelagem que sustenta tudo: um livro-razão

Todo o financeiro do sistema vive num **livro-razão (ledger) imutável**. Em vez
de "salvar o saldo do cliente" num campo, cada movimento de dinheiro é uma
**linha** — cobrança, pagamento, ajuste ou estorno. E linha de livro caixa não
se edita nem se apaga: **correção é uma linha nova**.

Isso resolve na raiz os casos que quebram caderno e planilha:

- **cancelar um pedido pago** não "desfaz" a cobrança antiga: lança um estorno
  espelhado — e, se devolveu dinheiro, um ajuste. O histórico fica íntegro e
  auditável;
- **"pago" é consequência, não clique**: ao registrar um pagamento, o sistema
  reconcilia sozinho — aplica o crédito aos pedidos concluídos, em ordem, e os
  marca como pagos. Ninguém marca pedido como pago na mão;
- **saldo é soma**: a qualquer instante, o saldo de um cliente é a soma das
  linhas dele. Não existe "sincronizar" nada.

O fluxo inteiro cabe numa linha:

```
foto do romaneio → pedido rascunho → concluir (vira cobrança)
→ cliente paga → registro do pagamento → reconciliação → pago
→ cancelou? → estorno no histórico (nada some)
```

E a IA de verdade ficou onde devia: na extração do romaneio — a foto vira
itens estruturados e o sistema casa cada item com o catálogo do cliente,
criando produto novo quando não acha. Detalhe revelador: **a parte mais
"fancy" do projeto foi a mais simples de construir**; a complexidade real
estava nas regras de faturamento. Mais um sinal de que o núcleo estava certo.

### Stack, sem alarde

Ferramentas maduras e bem estabelecidas: **Next.js + React** no front,
**PostgreSQL + Prisma** no banco, **React Query** para os dados em tela,
**Zod** para validar entrada — tudo rodando local com pnpm e Docker. Sem
reinventar roda: isso encurtou o trabalho da IA e encurtará o de quem der
manutenção amanhã.

## Experimente

Rodar o projeto leva minutos (detalhes no README):

```bash
pnpm install
docker compose up -d        # sobe o PostgreSQL
npx prisma db push          # cria as tabelas
pnpm dev                    # http://localhost:3000
```

Há um *seed* de demonstração com clientes, catálogos e produtos para você
brincar com o fluxo completo: montar pedido, concluir, registrar pagamento e
ver a reconciliação acontecer sozinha. **[adicione aqui o link do repositório
público e/ou demo quando disponível]**

E fica a provocação final — não sobre costura, mas sobre o seu dia a dia:
**qual processo seu — ou de alguém próximo — ainda vive num caderno ou numa
planilha que não fecha?** Talvez ele caiba em duas abas.

---

*Títulos alternativos sugeridos:*

- *Caderno que não fecha: um sistema de pedidos e faturamento para ateliê de costura*
- *A foto de um papel virou um sistema: escopo, modelagem e IA num projeto real*
- *Duas abas: como um ateliê de costura virou um sistema de pedidos e faturamento*
