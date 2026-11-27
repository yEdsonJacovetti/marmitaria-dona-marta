# 1. Descoberta — Mapa da jornada atual da Dona Marta

**Persona:** Dona Marta, 52 anos, dona de uma marmitaria de bairro. Recebe os pedidos só pelo WhatsApp (não usa apps de delivery por causa das taxas). Trabalha na cozinha e no celular ao mesmo tempo.

**Desafio do Sprint (pergunta-guia):**
> Como a Dona Marta pode registrar, montar, entregar e cobrar todos os pedidos do horário de pico (11h–13h) sem perder nenhum e sabendo, no fim do dia, quem pagou e quanto faturou?

## Jornada atual (como é hoje)

| Etapa | O que ela faz hoje | Onde | Sentimento | Gargalo / dor |
|---|---|---|---|---|
| 1. Recebe o pedido | Lê mensagens soltas: "sem feijão", "troca salada por farofa", "manda no endereço de sempre" | WhatsApp | 😰 Sobrecarregada | **G1** Mensagens se misturam; pedidos ficam perdidos no meio da conversa |
| 2. Entende o pedido | Rola a conversa para lembrar o tamanho, as trocas e o endereço "de sempre" | WhatsApp + memória | 😕 Confusa | **G2** Endereço e preferências dependem da memória dela |
| 3. Monta a marmita | Volta ao celular com a mão suja para conferir o que tirar/trocar | Cozinha | 😤 Estressada | **G3** Erro na montagem (esquece o "sem feijão") |
| 4. Organiza a ordem | Decide de cabeça qual sai primeiro | Cabeça | 😵 Perdida | **G4** Sem fila visível: pedido antigo fica para trás e atrasa |
| 5. Entrega | Passa endereços ao entregador por mensagem/de boca | WhatsApp / fala | 😟 Ansiosa | **G5** Entregador atrasa ou vai ao endereço errado |
| 6. Recebe o pagamento | "Pago no Pix" chega na conversa; dinheiro vai para a gaveta | WhatsApp / gaveta | 🤷 Insegura | **G6** Não sabe quem já pagou e quem está devendo |
| 7. Fecha o dia | Tenta somar comprovantes e dinheiro | Caderno / nada | 😞 Frustrada | **G7** Não sabe quanto faturou no dia |

## Gargalos priorizados (votação por impacto no pico)

1. **G1 + G2 — Registro do pedido** → registrar em poucos toques, com cliente e endereço salvos.
2. **G3 + G4 — Cozinha** → fila visível com as personalizações em destaque (letra grande).
3. **G6 + G7 — Dinheiro** → marcar pago/pendente e fechar o caixa automaticamente.
4. **G5 — Entrega** → status "saiu para entrega" com endereço visível.

## Mapa resumido (fluxo alvo com o app)

```
WhatsApp ──► [Novo pedido: cliente salvo + botões de personalização + Pix/Dinheiro]
                 │
                 ▼
         [Cozinha: Novo ► Preparando ► Pronto]   (limite de WIP: até 4 em preparo)
                 │
                 ▼
         [Entregas: Pronto ► Saiu ► Entregue]     (retirada: Pronto ► Entregue)
                 │
                 ▼
         [Caixa: total do dia, recebido, pendente, Pix x Dinheiro]
```
