// Regras de negócio da marmitaria (sem dependência de tela).
// Funciona no navegador (window.Regras) e no Node (require) para os testes.
// Todos os valores são guardados em CENTAVOS para evitar erro de arredondamento.
(function (raiz) {
  const CARDAPIO = {
    tamanhos: {
      P: { nome: 'Marmita P', preco: 1800 },
      M: { nome: 'Marmita M', preco: 2200 },
      G: { nome: 'Marmita G', preco: 2600 },
    },
    ingredientes: ['arroz', 'feijão', 'salada', 'macarrão', 'carne'],
    trocas: [
      { de: 'salada', para: 'farofa' },
      { de: 'arroz', para: 'macarrão' },
      { de: 'feijão', para: 'farofa' },
    ],
    adicionais: {
      ovo: 300,
      'carne extra': 600,
      refrigerante: 600,
    },
    taxaEntrega: 300,
  };

  function criarItem(tamanho, quantidade = 1) {
    if (!CARDAPIO.tamanhos[tamanho]) throw new Error(`Tamanho inválido: ${tamanho}`);
    if (!Number.isInteger(quantidade) || quantidade < 1) throw new Error('A quantidade deve ser 1 ou mais');
    return { tamanho, quantidade, personalizacoes: [] };
  }

  // Ingrediente que a personalização "mexe" (sem → ingrediente, troca → de)
  const ingredienteAfetado = (p) => (p.tipo === 'sem' ? p.ingrediente : p.tipo === 'troca' ? p.de : null);

  // Cada tipo valida só o que é dele; regras comuns ficam em aplicarPersonalizacao
  const VALIDADORES = {
    sem: (p) => {
      if (!CARDAPIO.ingredientes.includes(p.ingrediente)) throw new Error(`Ingrediente não existe na marmita: ${p.ingrediente}`);
    },
    troca: (p) => {
      if (!CARDAPIO.trocas.some((t) => t.de === p.de && t.para === p.para)) throw new Error(`Troca não prevista: ${p.de} por ${p.para}`);
    },
    adicional: (p) => {
      if (!(p.nome in CARDAPIO.adicionais)) throw new Error(`Adicional não existe: ${p.nome}`);
    },
  };

  const mesmaPersonalizacao = (a, b) =>
    a.tipo === b.tipo && (a.tipo === 'adicional' ? a.nome === b.nome : ingredienteAfetado(a) === ingredienteAfetado(b));

  function aplicarPersonalizacao(item, p) {
    const validar = VALIDADORES[p.tipo];
    if (!validar) throw new Error(`Tipo de personalização inválido: ${p.tipo}`);
    validar(p);

    const lista = item.personalizacoes;
    if (lista.some((x) => mesmaPersonalizacao(x, p))) throw new Error('Essa personalização já foi aplicada');

    const afetado = ingredienteAfetado(p);
    if (afetado && lista.some((x) => ingredienteAfetado(x) === afetado)) {
      throw new Error(`Conflito: ${afetado} já foi retirado ou trocado`);
    }

    return { ...item, personalizacoes: [...lista, { ...p }] };
  }

  function precoItem(item) {
    const base = CARDAPIO.tamanhos[item.tamanho].preco;
    const adicionais = item.personalizacoes
      .filter((p) => p.tipo === 'adicional')
      .reduce((soma, p) => soma + CARDAPIO.adicionais[p.nome], 0);
    return (base + adicionais) * item.quantidade;
  }

  function descreverPersonalizacoes(item) {
    return item.personalizacoes.map((p) => {
      if (p.tipo === 'sem') return `SEM ${p.ingrediente.toUpperCase()}`;
      if (p.tipo === 'troca') return `TROCA ${p.de.toUpperCase()} → ${p.para.toUpperCase()}`;
      return `+ ${p.nome.toUpperCase()}`;
    });
  }

  function criarPedido({ id, cliente, itens, tipoEntrega, formaPagamento, pago = false, criadoEm }) {
    if (!itens || itens.length === 0) throw new Error('O pedido precisa ter pelo menos 1 item');
    if (tipoEntrega === 'entrega' && !(cliente && cliente.endereco)) throw new Error('Pedido para entrega precisa de endereço');
    if (!['pix', 'dinheiro'].includes(formaPagamento)) throw new Error('Forma de pagamento deve ser pix ou dinheiro');

    const subtotal = itens.reduce((soma, item) => soma + precoItem(item), 0);
    const taxa = tipoEntrega === 'entrega' ? CARDAPIO.taxaEntrega : 0;

    return {
      id,
      cliente,
      itens,
      tipoEntrega,
      formaPagamento,
      pago,
      status: 'novo',
      total: subtotal + taxa,
      criadoEm: criadoEm || new Date().toISOString(),
    };
  }

  function situacaoWip(pedidos, limite) {
    const emPreparo = pedidos.filter((p) => p.status === 'preparando').length;
    return { emPreparo, limite, excedido: emPreparo > limite };
  }

  // ---------- Sprint 2: status, pagamento e caixa ----------
  const FLUXO = {
    entrega: ['novo', 'preparando', 'pronto', 'saiu', 'entregue'],
    retirada: ['novo', 'preparando', 'pronto', 'entregue'],
  };
  const PODE_CANCELAR = ['novo', 'preparando'];

  function proximoStatus(pedido) {
    const fluxo = FLUXO[pedido.tipoEntrega];
    const i = fluxo.indexOf(pedido.status);
    if (i === -1 || i === fluxo.length - 1) return null; // cancelado ou já entregue
    return fluxo[i + 1];
  }

  function avancarStatus(pedido) {
    const proximo = proximoStatus(pedido);
    if (!proximo) throw new Error(`Pedido ${pedido.status} não pode avançar`);
    return { ...pedido, status: proximo };
  }

  function cancelarPedido(pedido) {
    if (!PODE_CANCELAR.includes(pedido.status)) throw new Error(`Não dá para cancelar um pedido ${pedido.status}`);
    return { ...pedido, status: 'cancelado' };
  }

  function marcarPago(pedido) {
    if (pedido.status === 'cancelado') throw new Error('Pedido cancelado não recebe pagamento');
    return { ...pedido, pago: true };
  }

  function fecharCaixa(pedidos) {
    const validos = pedidos.filter((p) => p.status !== 'cancelado');
    const pagos = validos.filter((p) => p.pago);
    const soma = (lista) => lista.reduce((s, p) => s + p.total, 0);

    return {
      qtdPedidos: validos.length,
      qtdCancelados: pedidos.length - validos.length,
      total: soma(validos),
      recebido: soma(pagos),
      pendente: soma(validos.filter((p) => !p.pago)),
      porForma: {
        pix: soma(pagos.filter((p) => p.formaPagamento === 'pix')),
        dinheiro: soma(pagos.filter((p) => p.formaPagamento === 'dinheiro')),
      },
      devedores: validos.filter((p) => !p.pago),
    };
  }

  function formatarReais(centavos) {
    const reais = Math.floor(centavos / 100)
      .toString()
      .replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    const cents = String(centavos % 100).padStart(2, '0');
    return `R$ ${reais},${cents}`;
  }

  const Regras = {
    CARDAPIO,
    criarItem,
    aplicarPersonalizacao,
    precoItem,
    descreverPersonalizacoes,
    criarPedido,
    situacaoWip,
    proximoStatus,
    avancarStatus,
    cancelarPedido,
    marcarPago,
    fecharCaixa,
    formatarReais,
  };

  if (typeof module !== 'undefined' && module.exports) module.exports = Regras;
  else raiz.Regras = Regras;
})(this);
