// Sprint 2 — Mudança de status, pagamento e fechamento de caixa
// Escritos ANTES da implementação (TDD: Red → Green → Refactor)
const { test, describe } = require('node:test');
const assert = require('node:assert/strict');
const R = require('../js/regras.js');

function novoPedido(extra = {}) {
  return R.criarPedido({
    id: 1,
    cliente: { nome: 'João', endereco: 'Rua das Flores, 10' },
    itens: [R.criarItem('M')],
    tipoEntrega: 'entrega',
    formaPagamento: 'pix',
    ...extra,
  });
}

describe('Mudança de status', () => {
  test('entrega segue: novo → preparando → pronto → saiu → entregue', () => {
    let p = novoPedido();
    const caminho = [];
    while (R.proximoStatus(p)) {
      p = R.avancarStatus(p);
      caminho.push(p.status);
    }
    assert.deepEqual(caminho, ['preparando', 'pronto', 'saiu', 'entregue']);
  });

  test('retirada pula "saiu": pronto → entregue', () => {
    let p = novoPedido({ tipoEntrega: 'retirada', cliente: { nome: 'Ana' } });
    p = R.avancarStatus(R.avancarStatus(p)); // pronto
    assert.equal(p.status, 'pronto');
    assert.equal(R.proximoStatus(p), 'entregue');
  });

  test('não altera o pedido original', () => {
    const p = novoPedido();
    R.avancarStatus(p);
    assert.equal(p.status, 'novo');
  });

  test('pedido entregue não avança mais', () => {
    let p = novoPedido();
    while (R.proximoStatus(p)) p = R.avancarStatus(p);
    assert.equal(R.proximoStatus(p), null);
    assert.throws(() => R.avancarStatus(p), /não pode/i);
  });

  test('pode cancelar enquanto ainda não ficou pronto', () => {
    const cancelado = R.cancelarPedido(R.avancarStatus(novoPedido())); // preparando
    assert.equal(cancelado.status, 'cancelado');
  });

  test('não pode cancelar depois de pronto', () => {
    const pronto = R.avancarStatus(R.avancarStatus(novoPedido()));
    assert.throws(() => R.cancelarPedido(pronto), /cancelar/i);
  });

  test('pedido cancelado não avança', () => {
    const cancelado = R.cancelarPedido(novoPedido());
    assert.throws(() => R.avancarStatus(cancelado), /não pode/i);
  });
});

describe('Pagamento', () => {
  test('marca o pedido como pago sem alterar o original', () => {
    const p = novoPedido();
    const pago = R.marcarPago(p);
    assert.equal(pago.pago, true);
    assert.equal(p.pago, false);
  });

  test('não marca pagamento de pedido cancelado', () => {
    assert.throws(() => R.marcarPago(R.cancelarPedido(novoPedido())), /cancelado/i);
  });
});

describe('Fechamento de caixa', () => {
  // M entrega = 2200 + 300 = 2500 | P retirada = 1800 | G entrega = 2600 + 300 = 2900
  const pedidos = [
    novoPedido({ id: 1, pago: true }), // pix, pago, 2500
    novoPedido({ id: 2, itens: [R.criarItem('P')], tipoEntrega: 'retirada', formaPagamento: 'dinheiro', pago: true }), // 1800
    novoPedido({ id: 3, itens: [R.criarItem('G')], formaPagamento: 'dinheiro' }), // pendente, 2900
    R.cancelarPedido(novoPedido({ id: 4, pago: true })), // cancelado: não entra
  ];

  test('soma o total vendido sem os cancelados', () => {
    assert.equal(R.fecharCaixa(pedidos).total, 2500 + 1800 + 2900);
  });

  test('separa recebido e pendente', () => {
    const caixa = R.fecharCaixa(pedidos);
    assert.equal(caixa.recebido, 2500 + 1800);
    assert.equal(caixa.pendente, 2900);
  });

  test('separa o recebido por forma de pagamento', () => {
    assert.deepEqual(R.fecharCaixa(pedidos).porForma, { pix: 2500, dinheiro: 1800 });
  });

  test('conta pedidos válidos e cancelados', () => {
    const caixa = R.fecharCaixa(pedidos);
    assert.equal(caixa.qtdPedidos, 3);
    assert.equal(caixa.qtdCancelados, 1);
  });

  test('lista quem está devendo', () => {
    const devedores = R.fecharCaixa(pedidos).devedores;
    assert.deepEqual(devedores.map((p) => p.id), [3]);
  });

  test('caixa vazio dá tudo zero', () => {
    assert.deepEqual(R.fecharCaixa([]), {
      qtdPedidos: 0,
      qtdCancelados: 0,
      total: 0,
      recebido: 0,
      pendente: 0,
      porForma: { pix: 0, dinheiro: 0 },
      devedores: [],
    });
  });

  test('soma em centavos não tem erro de arredondamento', () => {
    const muitos = Array.from({ length: 100 }, (_, i) => novoPedido({ id: i, pago: true }));
    assert.equal(R.fecharCaixa(muitos).recebido, 100 * 2500);
  });
});
