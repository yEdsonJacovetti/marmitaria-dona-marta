# 3. Gestão Ágil — Product Backlog, WIP e Sprints

## Product Backlog (Histórias de Usuário, em ordem de prioridade)

| ID | História de Usuário | Critérios de aceite | Pontos | Sprint |
|---|---|---|---|---|
| US01 | Como **Dona Marta**, quero **registrar um pedido em poucos toques** para **não perder pedidos no pico**. | Escolher tamanho e quantidade por botões; total calculado na hora; pedido salvo vai para a fila. | 5 | 1 |
| US02 | Como **Dona Marta**, quero **aplicar personalizações por botões** ("sem feijão", "troca salada por farofa", "+ ovo") para **não errar a montagem**. | Remoção e troca não alteram o preço; adicional soma ao preço; não permite personalização repetida ou conflitante. | 5 | 1 |
| US03 | Como **Dona Marta**, quero **salvar clientes com endereço** para **atender o "manda no endereço de sempre"**. | Ao escolher o cliente, o endereço é preenchido automaticamente; dados ficam salvos no navegador. | 3 | 1 |
| US04 | Como **cozinheira**, quero **ver a fila de pedidos por ordem de chegada com as personalizações em destaque** para **montar na ordem certa**. | Colunas Novo / Preparando; personalizações em letra grande; botão Começar / Pronto. | 5 | 1 |
| US05 | Como **cozinheira**, quero **ser avisada quando houver pedidos demais em preparo** para **não me perder**. | Coluna Preparando mostra "x/4" e fica em alerta acima do limite. | 2 | 1 |
| US06 | Como **Dona Marta**, quero **mudar o status do pedido até a entrega** para **saber o que já saiu**. | Fluxo Novo → Preparando → Pronto → Saiu → Entregue; retirada pula "Saiu"; não pode pular etapas. | 3 | 2 |
| US07 | Como **entregador**, quero **ver o endereço e se o pedido já está pago** para **cobrar só quem deve**. | Tela de entregas mostra endereço, forma de pagamento e "PENDENTE"/"PAGO". | 2 | 2 |
| US08 | Como **Dona Marta**, quero **marcar um pedido como pago** para **saber quem ainda está devendo**. | Botão "Recebi"; pedido pendente aparece na lista de devedores. | 2 | 2 |
| US09 | Como **Dona Marta**, quero **fechar o caixa do dia** para **saber quanto faturei**. | Total, recebido, pendente, separado por Pix/Dinheiro; cancelados não entram. | 5 | 2 |
| US10 | Como **Dona Marta**, quero **cancelar um pedido** que o cliente desistiu para **não somar no caixa errado**. | Só pode cancelar antes de ficar pronto. | 2 | 2 |
| US11 | *(futuro)* Como **Dona Marta**, quero **editar o cardápio do dia** pelo app. | — | 5 | Backlog |
| US12 | *(futuro)* Como **Dona Marta**, quero **ver o histórico de dias anteriores**. | — | 3 | Backlog |

## Quadro Kanban (GitHub Projects ou Trello)

Colunas e **limites de WIP**:

| Coluna | Limite de WIP | Política |
|---|---|---|
| Product Backlog | — | Histórias priorizadas pelo PO |
| Sprint Backlog | — | Itens escolhidos na Sprint Planning |
| Em desenvolvimento | **2** | Só puxa um novo item quando um sair daqui |
| Em teste / revisão | **1** | Item só passa se os testes automatizados estiverem verdes |
| Pronto (Done) | — | Atende a Definition of Done |

**Definition of Done (DoD):**
- Regra de negócio coberta por teste automatizado (escrito antes do código — TDD).
- Todos os testes passando (`node --test`).
- Funciona no navegador do celular.
- Commit feito com mensagem descritiva.

## Sprints

### Sprint 1 — Registro rápido de pedidos e fila da cozinha
**Objetivo da Sprint:** a Dona Marta consegue registrar qualquer pedido do pico e a cozinha vê a fila na ordem certa.
**Itens:** US01, US02, US03, US04, US05 (20 pontos)

### Sprint 2 — Controle de entrega e fechamento de caixa
**Objetivo da Sprint:** a Dona Marta acompanha cada pedido até a entrega e fecha o dia sabendo quem pagou e quanto faturou.
**Itens:** US06, US07, US08, US09, US10 (14 pontos)

## Prints do quadro

> Colocar aqui os prints do quadro (GitHub Projects/Trello) ou o link público.

- Link do quadro: _______
- `docs/prints/quadro-sprint1.png`
- `docs/prints/quadro-sprint2.png`
