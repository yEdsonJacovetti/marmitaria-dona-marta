// Sprint 1 — Regras críticas do registro de pedidos
// Escritos ANTES da implementação (TDD: Red → Green → Refactor)
const { test, describe } = require('node:test');
const assert = require('node:assert/strict');
const R = require('../js/regras.js');

describe('Cálculo de valores', () => {
  test('marmita M custa R$ 22,00 (2200 centavos)', () => {
    const item = R.criarItem('M');
    assert.equal(R.precoItem(item), 2200);
  });

  test('quantidade multiplica o preço', () => {
    const item = R.criarItem('P', 3);
    assert.equal(R.precoItem(item), 3 * 1800);
  });

  test('adicional soma ao preço da marmita', () => {
    let item = R.criarItem('G');
    item = R.aplicarPersonalizacao(item, { tipo: 'adicional', nome: 'ovo' });
    assert.equal(R.precoItem(item), 2600 + 300);
  });

  test('adicional é multiplicado pela quantidade', () => {
    let item = R.criarItem('M', 2);
    item = R.aplicarPersonalizacao(item, { tipo: 'adicional', nome: 'ovo' });
    assert.equal(R.precoItem(item), 2 * (2200 + 300));
  });

  test('remoção e troca NÃO alteram o preço', () => {
    let item = R.criarItem('M');
    item = R.aplicarPersonalizacao(item, { tipo: 'sem', ingrediente: 'feijão' });
    item = R.aplicarPersonalizacao(item, { tipo: 'troca', de: 'salada', para: 'farofa' });
    assert.equal(R.precoItem(item), 2200);
  });

  test('pedido para entrega soma a taxa de entrega', () => {
    const pedido = R.criarPedido({
      cliente: { nome: 'João', endereco: 'Rua das Flores, 10' },
      itens: [R.criarItem('M'), R.criarItem('P')],
      tipoEntrega: 'entrega',
      formaPagamento: 'pix',
    });
    assert.equal(pedido.total, 2200 + 1800 + R.CARDAPIO.taxaEntrega);
  });

  test('pedido para retirada não cobra taxa', () => {
    const pedido = R.criarPedido({
      cliente: { nome: 'Ana' },
      itens: [R.criarItem('G')],
      tipoEntrega: 'retirada',
      formaPagamento: 'dinheiro',
    });
    assert.equal(pedido.total, 2600);
  });

  test('não aceita tamanho inexistente', () => {
    assert.throws(() => R.criarItem('XG'), /tamanho/i);
  });

  test('não aceita quantidade zero ou negativa', () => {
    assert.throws(() => R.criarItem('M', 0), /quantidade/i);
    assert.throws(() => R.criarItem('M', -1), /quantidade/i);
  });

  test('formata centavos em reais', () => {
    assert.equal(R.formatarReais(2200), 'R$ 22,00');
    assert.equal(R.formatarReais(105), 'R$ 1,05');
    assert.equal(R.formatarReais(123456), 'R$ 1.234,56');
  });
});

describe('Personalizações do pedido', () => {
  test('"sem feijão" é registrado no item', () => {
    const item = R.aplicarPersonalizacao(R.criarItem('M'), { tipo: 'sem', ingrediente: 'feijão' });
    assert.deepEqual(item.personalizacoes, [{ tipo: 'sem', ingrediente: 'feijão' }]);
  });

  test('não altera o item original (imutável)', () => {
    const original = R.criarItem('M');
    R.aplicarPersonalizacao(original, { tipo: 'sem', ingrediente: 'feijão' });
    assert.equal(original.personalizacoes.length, 0);
  });

  test('não permite a mesma personalização duas vezes', () => {
    const item = R.aplicarPersonalizacao(R.criarItem('M'), { tipo: 'sem', ingrediente: 'feijão' });
    assert.throws(() => R.aplicarPersonalizacao(item, { tipo: 'sem', ingrediente: 'feijão' }), /já/i);
  });

  test('não permite tirar e trocar o mesmo ingrediente', () => {
    const item = R.aplicarPersonalizacao(R.criarItem('M'), { tipo: 'troca', de: 'salada', para: 'farofa' });
    assert.throws(() => R.aplicarPersonalizacao(item, { tipo: 'sem', ingrediente: 'salada' }), /conflito/i);
  });

  test('não permite tirar ingrediente que não está na marmita', () => {
    assert.throws(
      () => R.aplicarPersonalizacao(R.criarItem('M'), { tipo: 'sem', ingrediente: 'camarão' }),
      /ingrediente/i
    );
  });

  test('só aceita trocas previstas no cardápio', () => {
    assert.throws(
      () => R.aplicarPersonalizacao(R.criarItem('M'), { tipo: 'troca', de: 'carne', para: 'picanha' }),
      /troca/i
    );
  });

  test('não aceita adicional fora do cardápio', () => {
    assert.throws(
      () => R.aplicarPersonalizacao(R.criarItem('M'), { tipo: 'adicional', nome: 'lagosta' }),
      /adicional/i
    );
  });

  test('descreve as personalizações para a cozinha em letra de destaque', () => {
    let item = R.criarItem('M');
    item = R.aplicarPersonalizacao(item, { tipo: 'sem', ingrediente: 'feijão' });
    item = R.aplicarPersonalizacao(item, { tipo: 'troca', de: 'salada', para: 'farofa' });
    item = R.aplicarPersonalizacao(item, { tipo: 'adicional', nome: 'ovo' });
    assert.deepEqual(R.descreverPersonalizacoes(item), [
      'SEM FEIJÃO',
      'TROCA SALADA → FAROFA',
      '+ OVO',
    ]);
  });
});

describe('Criação do pedido', () => {
  const base = {
    cliente: { nome: 'João', endereco: 'Rua das Flores, 10' },
    itens: [R.criarItem('M')],
    tipoEntrega: 'entrega',
    formaPagamento: 'pix',
  };

  test('pedido novo começa com status "novo" e não pago', () => {
    const pedido = R.criarPedido(base);
    assert.equal(pedido.status, 'novo');
    assert.equal(pedido.pago, false);
  });

  test('pode ser criado já pago ("pago no Pix")', () => {
    const pedido = R.criarPedido({ ...base, pago: true });
    assert.equal(pedido.pago, true);
  });

  test('não aceita pedido sem itens', () => {
    assert.throws(() => R.criarPedido({ ...base, itens: [] }), /item/i);
  });

  test('entrega exige endereço', () => {
    assert.throws(() => R.criarPedido({ ...base, cliente: { nome: 'João' } }), /endereço/i);
  });

  test('forma de pagamento precisa ser pix ou dinheiro', () => {
    assert.throws(() => R.criarPedido({ ...base, formaPagamento: 'cheque' }), /pagamento/i);
  });
});

describe('Limite de WIP da cozinha', () => {
  const pedidoCom = (status) => ({ status });

  test('conta quantos pedidos estão em preparo', () => {
    const pedidos = ['novo', 'preparando', 'preparando', 'pronto'].map(pedidoCom);
    assert.deepEqual(R.situacaoWip(pedidos, 4), { emPreparo: 2, limite: 4, excedido: false });
  });

  test('avisa quando passa do limite', () => {
    const pedidos = Array(5).fill('preparando').map(pedidoCom);
    assert.equal(R.situacaoWip(pedidos, 4).excedido, true);
  });
});
