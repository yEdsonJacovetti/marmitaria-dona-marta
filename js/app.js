// Interface do app. As regras de negócio ficam em regras.js (testadas).
(function () {
  const R = window.Regras;
  const LIMITE_WIP = 4; // máximo de pedidos em preparo ao mesmo tempo

  // ---------- Armazenamento (LocalStorage) ----------
  const CHAVES = { pedidos: 'dm_pedidos', clientes: 'dm_clientes', seq: 'dm_seq' };

  function carregar(chave, padrao) {
    try {
      const valor = JSON.parse(localStorage.getItem(chave));
      return valor ?? padrao;
    } catch (e) {
      return padrao;
    }
  }
  function salvar(chave, valor) {
    try {
      localStorage.setItem(chave, JSON.stringify(valor));
    } catch (e) {
      avisar('Não foi possível salvar no navegador', true);
    }
  }

  let pedidos = carregar(CHAVES.pedidos, []);
  let clientes = carregar(CHAVES.clientes, []);

  function salvarTudo() {
    salvar(CHAVES.pedidos, pedidos);
    salvar(CHAVES.clientes, clientes);
  }
  function proximoId() {
    const seq = carregar(CHAVES.seq, 0) + 1;
    salvar(CHAVES.seq, seq);
    return seq;
  }

  // ---------- Utilidades ----------
  const $ = (id) => document.getElementById(id);
  const esc = (txt) =>
    String(txt ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const hora = (iso) => new Date(iso).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

  let timerAviso;
  function avisar(msg, erro = false) {
    const el = $('aviso');
    el.textContent = msg;
    el.className = 'aviso visivel' + (erro ? ' erro' : '');
    clearTimeout(timerAviso);
    timerAviso = setTimeout(() => (el.className = 'aviso'), 2500);
  }

  // ---------- Navegação entre telas ----------
  const renderizadores = {};
  function mostrarTela(nome) {
    document.querySelectorAll('.aba').forEach((b) => b.classList.toggle('ativa', b.dataset.tela === nome));
    document.querySelectorAll('.tela').forEach((s) => s.classList.toggle('ativa', s.id === 'tela-' + nome));
    if (renderizadores[nome]) renderizadores[nome]();
  }
  document.querySelectorAll('.aba').forEach((b) => b.addEventListener('click', () => mostrarTela(b.dataset.tela)));

  // =====================================================
  // TELA: NOVO PEDIDO
  // =====================================================
  const rascunhoVazio = () => ({
    clienteId: null,
    tamanho: 'M',
    quantidade: 1,
    selecionadas: [], // personalizações escolhidas para a marmita atual
    itens: [],
    tipoEntrega: 'entrega',
    formaPagamento: 'pix',
    pago: false,
  });
  let rascunho = rascunhoVazio();

  // Opções de personalização montadas a partir do cardápio
  const OPCOES = {
    sem: R.CARDAPIO.ingredientes.map((i) => ({ tipo: 'sem', ingrediente: i, rotulo: 'sem ' + i })),
    troca: R.CARDAPIO.trocas.map((t) => ({ tipo: 'troca', de: t.de, para: t.para, rotulo: `${t.de} → ${t.para}` })),
    adicional: Object.entries(R.CARDAPIO.adicionais).map(([nome, preco]) => ({
      tipo: 'adicional',
      nome,
      rotulo: `+ ${nome} (${R.formatarReais(preco)})`,
    })),
  };
  const chaveOpcao = (o) => o.tipo + ':' + (o.ingrediente || o.de || o.nome);
  const semRotulo = ({ rotulo, ...p }) => p;

  // Monta a marmita atual aplicando as personalizações selecionadas (usa as regras testadas)
  function montarItemAtual() {
    let item = R.criarItem(rascunho.tamanho, rascunho.quantidade);
    for (const p of rascunho.selecionadas) item = R.aplicarPersonalizacao(item, p);
    return item;
  }

  function renderTamanhos() {
    $('tamanhos').innerHTML = Object.entries(R.CARDAPIO.tamanhos)
      .map(
        ([t, info]) =>
          `<button class="tamanho ${rascunho.tamanho === t ? 'selecionado' : ''}" data-tamanho="${t}">
            ${t}<small>${R.formatarReais(info.preco)}</small></button>`
      )
      .join('');
  }

  function renderChips() {
    const itemAtual = montarItemAtual();
    for (const grupo of ['sem', 'troca', 'adicional']) {
      $('chips-' + grupo).innerHTML = OPCOES[grupo]
        .map((o) => {
          const chave = chaveOpcao(o);
          const selecionado = rascunho.selecionadas.some((s) => chaveOpcao(s) === chave);
          // Desabilita opções que conflitam com o que já foi escolhido (a própria regra decide)
          let conflita = false;
          if (!selecionado) {
            try {
              R.aplicarPersonalizacao(itemAtual, semRotulo(o));
            } catch (e) {
              conflita = true;
            }
          }
          return `<button class="chip ${selecionado ? 'selecionado' : ''}" data-chave="${chave}" ${conflita ? 'disabled' : ''}>${esc(o.rotulo)}</button>`;
        })
        .join('');
    }
    $('qtd').textContent = rascunho.quantidade;
  }

  function renderItens() {
    const lista = $('lista-itens');
    if (rascunho.itens.length === 0) {
      lista.innerHTML = '<li class="vazio">Nenhuma marmita ainda</li>';
    } else {
      lista.innerHTML = rascunho.itens
        .map((item, i) => {
          const pers = R.descreverPersonalizacoes(item);
          return `<li>
            <div class="desc"><strong>${item.quantidade}x ${item.tamanho}</strong> — ${R.formatarReais(R.precoItem(item))}
              ${pers.length ? `<span class="personalizacoes">${pers.map(esc).join(' · ')}</span>` : ''}</div>
            <button class="btn-remover" data-remover="${i}" aria-label="Remover">✕</button>
          </li>`;
        })
        .join('');
    }
    renderTotal();
  }

  function renderOpcoesPedido() {
    document.querySelectorAll('[data-entrega]').forEach((b) => b.classList.toggle('selecionada', b.dataset.entrega === rascunho.tipoEntrega));
    document.querySelectorAll('[data-pagamento]').forEach((b) => b.classList.toggle('selecionada', b.dataset.pagamento === rascunho.formaPagamento));
    $('btn-pago').classList.toggle('selecionada', rascunho.pago);
    $('btn-pago').textContent = rascunho.pago ? '✓ Já pago' : 'Já pago?';
    renderTotal();
  }

  function renderTotal() {
    const subtotal = rascunho.itens.reduce((s, item) => s + R.precoItem(item), 0);
    const taxa = rascunho.itens.length && rascunho.tipoEntrega === 'entrega' ? R.CARDAPIO.taxaEntrega : 0;
    $('total').textContent = R.formatarReais(subtotal + taxa);
  }

  function renderPedido() {
    renderTamanhos();
    renderChips();
    renderItens();
    renderOpcoesPedido();
  }
  renderizadores.pedido = renderPedido;

  // --- Clientes ---
  function preencherCliente(c) {
    rascunho.clienteId = c ? c.id : null;
    $('cli-nome').value = c ? c.nome : '';
    $('cli-telefone').value = c ? c.telefone || '' : '';
    $('cli-endereco').value = c ? c.endereco || '' : '';
  }

  $('busca-cliente').addEventListener('input', (e) => {
    const termo = e.target.value.trim().toLowerCase();
    const achados = termo
      ? clientes.filter((c) => c.nome.toLowerCase().includes(termo) || (c.telefone || '').includes(termo)).slice(0, 5)
      : [];
    $('sugestoes-cliente').innerHTML = achados
      .map((c) => `<button class="chip cliente" data-cliente="${c.id}">${esc(c.nome)} <small>${esc(c.endereco || 'sem endereço')}</small></button>`)
      .join('');
  });

  $('sugestoes-cliente').addEventListener('click', (e) => {
    const btn = e.target.closest('[data-cliente]');
    if (!btn) return;
    preencherCliente(clientes.find((c) => String(c.id) === btn.dataset.cliente));
    $('busca-cliente').value = '';
    $('sugestoes-cliente').innerHTML = '';
  });

  // Se a pessoa editar o nome à mão, deixa de ser o cliente selecionado
  $('cli-nome').addEventListener('input', () => {
    const c = clientes.find((x) => x.id === rascunho.clienteId);
    if (c && c.nome !== $('cli-nome').value) rascunho.clienteId = null;
  });

  // Cria ou atualiza o cliente com o que está nos campos
  function salvarCliente() {
    const nome = $('cli-nome').value.trim();
    const telefone = $('cli-telefone').value.trim();
    const endereco = $('cli-endereco').value.trim();
    if (!nome) return null;
    let c = clientes.find((x) => x.id === rascunho.clienteId) || clientes.find((x) => telefone && x.telefone === telefone);
    if (c) {
      Object.assign(c, { nome, telefone, endereco });
    } else {
      c = { id: Date.now(), nome, telefone, endereco };
      clientes.push(c);
    }
    return c;
  }

  // --- Montagem da marmita ---
  $('tamanhos').addEventListener('click', (e) => {
    const btn = e.target.closest('[data-tamanho]');
    if (!btn) return;
    rascunho.tamanho = btn.dataset.tamanho;
    renderTamanhos();
  });

  ['sem', 'troca', 'adicional'].forEach((grupo) => {
    $('chips-' + grupo).addEventListener('click', (e) => {
      const btn = e.target.closest('[data-chave]');
      if (!btn || btn.disabled) return;
      const chave = btn.dataset.chave;
      const ja = rascunho.selecionadas.findIndex((s) => chaveOpcao(s) === chave);
      if (ja >= 0) {
        rascunho.selecionadas.splice(ja, 1);
      } else {
        const opcao = Object.values(OPCOES).flat().find((o) => chaveOpcao(o) === chave);
        rascunho.selecionadas.push(semRotulo(opcao));
      }
      renderChips();
    });
  });

  $('qtd-menos').addEventListener('click', () => {
    rascunho.quantidade = Math.max(1, rascunho.quantidade - 1);
    renderChips();
  });
  $('qtd-mais').addEventListener('click', () => {
    rascunho.quantidade += 1;
    renderChips();
  });

  $('btn-adicionar').addEventListener('click', () => {
    try {
      rascunho.itens.push(montarItemAtual());
      rascunho.selecionadas = [];
      rascunho.quantidade = 1;
      renderChips();
      renderItens();
    } catch (e) {
      avisar(e.message, true);
    }
  });

  $('lista-itens').addEventListener('click', (e) => {
    const btn = e.target.closest('[data-remover]');
    if (!btn) return;
    rascunho.itens.splice(Number(btn.dataset.remover), 1);
    renderItens();
  });

  // --- Entrega e pagamento ---
  $('opcoes-entrega').addEventListener('click', (e) => {
    const btn = e.target.closest('[data-entrega]');
    if (!btn) return;
    rascunho.tipoEntrega = btn.dataset.entrega;
    renderOpcoesPedido();
  });
  $('opcoes-pagamento').addEventListener('click', (e) => {
    const btn = e.target.closest('button');
    if (!btn) return;
    if (btn.id === 'btn-pago') rascunho.pago = !rascunho.pago;
    else rascunho.formaPagamento = btn.dataset.pagamento;
    renderOpcoesPedido();
  });

  // --- Salvar ---
  $('btn-salvar').addEventListener('click', () => {
    try {
      const nome = $('cli-nome').value.trim();
      const endereco = $('cli-endereco').value.trim();
      if (!nome) throw new Error('Informe o nome do cliente');

      const pedido = R.criarPedido({
        id: 0,
        cliente: { nome, telefone: $('cli-telefone').value.trim(), endereco },
        itens: rascunho.itens,
        tipoEntrega: rascunho.tipoEntrega,
        formaPagamento: rascunho.formaPagamento,
        pago: rascunho.pago,
      });
      pedido.id = proximoId();

      const cliente = salvarCliente();
      pedido.cliente.id = cliente && cliente.id;
      pedidos.push(pedido);
      salvarTudo();

      avisar(`Pedido #${pedido.id} salvo — ${R.formatarReais(pedido.total)}`);
      rascunho = rascunhoVazio();
      preencherCliente(null);
      renderPedido();
      atualizarContadores();
    } catch (e) {
      avisar(e.message, true);
    }
  });

  // =====================================================
  // TELA: COZINHA
  // =====================================================
  function cartaoItens(p) {
    return `<ul>${p.itens
      .map((item) => {
        const pers = R.descreverPersonalizacoes(item);
        return `<li><strong>${item.quantidade}x ${item.tamanho}</strong>
          ${pers.map((t) => `<span class="personalizacoes">${esc(t)}</span>`).join('')}</li>`;
      })
      .join('')}</ul>`;
  }

  // Texto do botão para cada próximo status
  const ROTULO_AVANCAR = {
    preparando: ['Começar', 'alerta'],
    pronto: ['Pronto', 'sucesso'],
    saiu: ['Saiu para entrega', 'primario'],
    entregue: ['Entregue', 'sucesso'],
  };

  function botaoAvancar(p) {
    const proximo = R.proximoStatus(p);
    if (!proximo) return '';
    const [texto, cor] = ROTULO_AVANCAR[proximo];
    const rotulo = proximo === 'entregue' && p.tipoEntrega === 'retirada' ? 'Cliente retirou' : texto;
    return `<button class="btn ${cor}" data-avancar="${p.id}">${rotulo}</button>`;
  }

  const etiquetaPagamento = (p) =>
    `<span class="etiqueta ${p.pago ? 'pago' : 'pendente'}">${p.formaPagamento} · ${p.pago ? 'pago' : 'pendente'}</span>`;

  function cartaoCozinha(p) {
    const podeCancelar = p.status === 'novo' || p.status === 'preparando';
    return `<div class="cartao ${p.status}">
      <div class="cartao-topo"><span>#${p.id} ${esc(p.cliente.nome)}</span><span class="hora">${hora(p.criadoEm)}</span></div>
      ${p.tipoEntrega === 'retirada' ? '<span class="etiqueta retirada">Retirada</span>' : ''}
      ${cartaoItens(p)}
      <div class="acoes">
        ${p.status === 'pronto' ? '' : botaoAvancar(p)}
        ${podeCancelar ? `<button class="btn perigo" data-cancelar="${p.id}">Cancelar</button>` : ''}
      </div>
    </div>`;
  }

  function preencherColuna(id, lista, montar) {
    $(id).innerHTML = lista.length ? lista.map(montar).join('') : '<div class="vazio-coluna">—</div>';
  }

  function renderCozinha() {
    const por = (status) => pedidos.filter((p) => p.status === status);
    preencherColuna('col-novo', por('novo'), cartaoCozinha);
    preencherColuna('col-preparando', por('preparando'), cartaoCozinha);
    preencherColuna('col-pronto', por('pronto').slice(-5), cartaoCozinha);

    const wip = R.situacaoWip(pedidos, LIMITE_WIP);
    $('wip').textContent = `(${wip.emPreparo}/${wip.limite})`;
    $('coluna-preparando').classList.toggle('excedido', wip.excedido);
  }
  renderizadores.cozinha = renderCozinha;

  // =====================================================
  // TELA: ENTREGAS
  // =====================================================
  function cartaoEntrega(p) {
    const destino = p.tipoEntrega === 'retirada'
      ? '<span class="etiqueta retirada">Retirada no balcão</span>'
      : `<div class="endereco">📍 ${esc(p.cliente.endereco)}</div>`;
    return `<div class="cartao ${p.status}">
      <div class="cartao-topo"><span>#${p.id} ${esc(p.cliente.nome)}</span><span>${R.formatarReais(p.total)}</span></div>
      ${destino}
      ${p.cliente.telefone ? `<div class="endereco">📞 ${esc(p.cliente.telefone)}</div>` : ''}
      ${etiquetaPagamento(p)}
      <div class="acoes">
        ${botaoAvancar(p)}
        ${p.pago ? '' : `<button class="btn alerta" data-pagar="${p.id}">Recebi</button>`}
      </div>
    </div>`;
  }

  function renderEntregas() {
    preencherColuna('col-ent-pronto', pedidos.filter((p) => p.status === 'pronto'), cartaoEntrega);
    preencherColuna('col-ent-saiu', pedidos.filter((p) => p.status === 'saiu'), cartaoEntrega);
  }
  renderizadores.entregas = renderEntregas;

  // =====================================================
  // TELA: CAIXA
  // =====================================================
  const mesmoDia = (iso, ref) => new Date(iso).toDateString() === ref.toDateString();

  function renderCaixa() {
    const hoje = new Date();
    const doDia = pedidos.filter((p) => mesmoDia(p.criadoEm, hoje));
    const c = R.fecharCaixa(doDia);
    const f = R.formatarReais;

    $('data-caixa').textContent = hoje.toLocaleDateString('pt-BR');
    $('resumo-caixa').innerHTML = `
      <div class="indicador destaque"><span>Faturado</span><strong>${f(c.total)}</strong></div>
      <div class="indicador ok"><span>Recebido</span><strong>${f(c.recebido)}</strong></div>
      <div class="indicador ${c.pendente ? 'ruim' : ''}"><span>Pendente</span><strong>${f(c.pendente)}</strong></div>
      <div class="indicador"><span>Pix</span><strong>${f(c.porForma.pix)}</strong></div>
      <div class="indicador"><span>Dinheiro</span><strong>${f(c.porForma.dinheiro)}</strong></div>
      <div class="indicador"><span>Pedidos</span><strong>${c.qtdPedidos}</strong>${c.qtdCancelados ? ` <small>(${c.qtdCancelados} cancelado${c.qtdCancelados > 1 ? 's' : ''})</small>` : ''}</div>`;

    $('lista-devedores').innerHTML = c.devedores.length
      ? c.devedores
          .map(
            (p) => `<div class="cartao ${p.status}">
              <div class="cartao-topo"><span>#${p.id} ${esc(p.cliente.nome)}</span><span>${f(p.total)}</span></div>
              ${etiquetaPagamento(p)}
              <div class="acoes"><button class="btn alerta" data-pagar="${p.id}">Recebi</button></div>
            </div>`
          )
          .join('')
      : '<div class="vazio-coluna">Ninguém devendo 🎉</div>';

    $('lista-dia').innerHTML = doDia.length
      ? doDia
          .slice()
          .reverse()
          .map(
            (p) => `<li><div class="desc"><strong>#${p.id} ${esc(p.cliente.nome)}</strong> — ${hora(p.criadoEm)}
              <br><small>${p.status}</small></div>
              <span>${p.status === 'cancelado' ? '<s>' + f(p.total) + '</s>' : f(p.total)}</span></li>`
          )
          .join('')
      : '<li class="vazio">Nenhum pedido hoje</li>';
  }
  renderizadores.caixa = renderCaixa;

  // ---------- Ações nos cartões (cozinha, entregas e caixa) ----------
  function alterarPedido(id, regra) {
    const i = pedidos.findIndex((p) => String(p.id) === String(id));
    pedidos[i] = regra(pedidos[i]); // as regras devolvem um pedido novo (imutável)
    salvarTudo();
    atualizarContadores();
    const telaAtiva = document.querySelector('.aba.ativa').dataset.tela;
    renderizadores[telaAtiva]();
  }

  document.querySelector('main').addEventListener('click', (e) => {
    const btn = e.target.closest('[data-avancar], [data-cancelar], [data-pagar]');
    if (!btn) return;
    try {
      if (btn.dataset.avancar) {
        alterarPedido(btn.dataset.avancar, R.avancarStatus);
        const p = pedidos.find((x) => String(x.id) === btn.dataset.avancar);
        if (p.status === 'entregue' && !p.pago) avisar(`Pedido #${p.id} entregue SEM pagamento — ficou no Caixa como pendente`, true);
        else if (R.situacaoWip(pedidos, LIMITE_WIP).excedido) avisar('Atenção: pedidos demais em preparo!', true);
      } else if (btn.dataset.cancelar) {
        if (!confirm(`Cancelar o pedido #${btn.dataset.cancelar}?`)) return;
        alterarPedido(btn.dataset.cancelar, R.cancelarPedido);
        avisar(`Pedido #${btn.dataset.cancelar} cancelado`);
      } else if (btn.dataset.pagar) {
        alterarPedido(btn.dataset.pagar, R.marcarPago);
        avisar(`Pagamento do pedido #${btn.dataset.pagar} registrado`);
      }
    } catch (err) {
      avisar(err.message, true);
    }
  });

  // ---------- Contadores nas abas ----------
  function atualizarContadores() {
    const conta = (...status) => pedidos.filter((p) => status.includes(p.status)).length;
    $('cont-cozinha').textContent = conta('novo', 'preparando') || '';
    $('cont-entregas').textContent = conta('pronto', 'saiu') || '';
  }

  // Início
  renderPedido();
  atualizarContadores();
})();
