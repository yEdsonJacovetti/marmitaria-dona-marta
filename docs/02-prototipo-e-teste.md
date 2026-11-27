# 2. Esboços de tela e teste do protótipo

## Princípios de design (para uso na cozinha, sob pressão)

- **Botões grandes** (mínimo 48px de altura) — dá para tocar com a mão apressada.
- **Poucos cliques**: um pedido comum sai em ~5 toques (cliente → tamanho → personalização → pagamento → salvar).
- **Nada de digitar no pico**: personalizações comuns ("sem feijão", "troca salada por farofa") viram botões.
- **Cliente salvo**: "o endereço de sempre" é preenchido automaticamente.
- **Cores por status** e letra grande na fila da cozinha, para ler de longe.

## Esboços (wireframes)

### Tela 1 — Novo pedido
```
┌──────────────────────────────────┐
│ [Pedido] [Cozinha] [Entregas] [Caixa]
├──────────────────────────────────┤
│ Cliente: [ João - 9999-1234   ▼ ]│
│ Endereço: Rua das Flores, 10     │  ← preenchido sozinho
│                                  │
│ Tamanho:  [ P ] [ M ] [ G ]      │
│ Tirar:    [sem feijão] [sem arroz]│
│ Trocar:   [salada → farofa]      │
│ Adicional:[+ ovo] [+ carne]      │
│ Qtd: [-] 1 [+]   [ ADICIONAR ]   │
│                                  │
│ ( ) Entrega  ( ) Retirada        │
│ [ Pix ] [ Dinheiro ]  [x] Já pago│
│                                  │
│ TOTAL: R$ 25,00                  │
│ [        SALVAR PEDIDO         ] │
└──────────────────────────────────┘
```

### Tela 2 — Cozinha (fila)
```
┌─ NOVOS ───────────┐ ┌─ PREPARANDO (2/4) ┐
│ #12 João  11:42   │ │ #10 Ana   11:35   │
│ 1x M              │ │ 2x P              │
│  SEM FEIJÃO       │ │  TROCA salada →   │
│ [ COMEÇAR ]       │ │  farofa           │
└───────────────────┘ │ [ PRONTO ]        │
                      └───────────────────┘
```

### Tela 3 — Entregas
```
#10 Ana — Rua B, 45 — Pix PENDENTE
[ SAIU PARA ENTREGA ]   [ RECEBI ]
```

### Tela 4 — Caixa
```
Pedidos hoje: 23     Total: R$ 540,00
Recebido: R$ 495,00  Pendente: R$ 45,00
Pix: R$ 380,00       Dinheiro: R$ 115,00
Quem está devendo: Ana (#10) R$ 45,00
```

> O protótipo navegável é o próprio app (`index.html`), aberto no navegador do celular.

---

## Relato do teste do protótipo (preencher após o teste real)

> ⚠️ Esta seção deve ser preenchida com o teste **real**, feito com pelo menos 2 pessoas.

**Roteiro do teste (sugerido):**
1. Uma pessoa faz o papel de cliente e manda pedidos "bagunçados" (por mensagem ou falando), em sequência rápida, simulando o pico:
   - "1 marmita M sem feijão, endereço de sempre, pago no Pix"
   - "2 P, uma troca salada por farofa, vou pagar em dinheiro na entrega"
   - "1 G com ovo, vou buscar aí"
2. A outra pessoa faz o papel da Dona Marta e registra tudo no app, cronometrando.
3. Depois, as duas seguem o pedido até a entrega e fecham o caixa.
4. Observe: onde a pessoa hesitou? Errou algum toque? Precisou digitar algo?

| | Participante 1 | Participante 2 |
|---|---|---|
| Nome / papel | _______ | _______ |
| Pedidos registrados | ___ | ___ |
| Tempo médio por pedido | ___ s | ___ s |
| Erros cometidos | _______ | _______ |
| Onde hesitou | _______ | _______ |
| Comentário principal | "_______" | "_______" |

**O que mudamos depois do teste:**
- _______
- _______
