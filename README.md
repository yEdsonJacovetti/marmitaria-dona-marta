Link do web app: https://marmitaria-dona-marta.vercel.app/

# 

# Documentação

Ele resolve o caos dos pedidos soltos no WhatsApp e roda direto no navegador , **sem instalar nada e sem internet**. Os dados ficam salvos no próprio navegador (LocalStorage).



1. **Pedido:** busque o cliente (o endereço "de sempre" é preenchido sozinho), escolha o tamanho, toque nas personalizações e salve.
2. **Cozinha:** a fila aparece em ordem de chegada, com as personalizações em vermelho. Use **Começar → Pronto**. A coluna *Preparando* avisa quando passa de 4 pedidos.
3. **Entregas:** mostra endereço e se o pedido está pago. Use **Saiu → Entregue** (ou **Cliente retirou**) e **Recebi**.
4. **Caixa:** mostra o faturado, o recebido e o pendente do dia, separados por Pix e dinheiro, e a lista de quem está devendo.

Estrutura
index.html                 telas do app
css/style.css              visual (botões grandes, pensados para a cozinha)
js/regras.js               regras de negócio puras (testadas)
js/app.js                  interface + LocalStorage
tests/                     testes automatizados (node:test)
docs/01-jornada.md         Design Sprint: mapa da jornada e gargalos
docs/02-prototipo-e-teste.md  esboços de tela + relato do teste com usuários
docs/03-backlog-e-sprints.md  Product Backlog, WIP, DoD e Sprints

**FEITO COM IA (CLAUDE)**

```

## Transparência no uso de IA

Usei o \\\*\\\*Claude\\\*\\\* como copiloto de desenvolvimento. Todos os commits gerados com ajuda da IA trazem a marcação do Claude no histórico do git.

\\\* fez o rascunho do mapa da jornada, dos esboços de tela e do backlog em Histórias de Usuário a partir do enunciado;
\\\* escreveu os testes antes do código (TDD) e depois a implementação das regras e das telas;

### Decisões de produto que foram minhas

\\\* Quais tamanhos, preços, ingredientes e adicionais o cardápio tem;
\\\* O que entrou na Sprint 1 e o que entrou na Sprint 2, e porque;
\\\* Não tenho pessoas para o teste então eu mesmo fiz;

Link do jira usado nas sprints: https://edsonjacovetti2002.atlassian.net/jira/software/projects/MDM/boards/34/backlog?atlOrigin=eyJpIjoiMTczMmJhYzQ2ZmRkNDIxMzhlZDRlZTNkZDBmNjgxOWEiLCJwIjoiaiJ9


Link do GitHub: https://github.com/yEdsonJacovetti/marmitaria-dona-marta




