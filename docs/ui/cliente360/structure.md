# Cliente 360° — Estrutura da tela

Foco: leitura clara, ações óbvias, densidade controlada.

## Hierarquia
- Top bar: nome + ID, estado KYC, risco (badge), score numérico, RM e data do último toque.
- CTA rail (direita, sticky): “Next best action” primário; secundários discretos (agendar follow-up, enviar proposta, abrir ticket).
- Coluna principal: cards de saldo/patrimônio, portfólio de produtos, exposições e limites, timeline multicanal.
- Sidebar: contatos e times, checklists/KYC, documentos faltantes, notas rápidas, SLA do case atual.

## Blueprint HTML (vibecoding-ready)
```html
<main class="page shell max-w-screen-2xl mx-auto p-6 gap-4">
  <header class="hero glass flex items-center justify-between rounded-2xl p-5 shadow-soft">
    <div class="id flex items-center gap-3">
      <div class="avatar lg"></div>
      <div>
        <div class="title">Ana R. Monteiro</div>
        <div class="meta">Cliente #48219 • PF • RM: Joana Prado</div>
      </div>
    </div>
    <div class="kpis grid grid-cols-3 gap-3">
      <div class="pill risk high">Risco Alto</div>
      <div class="pill score">Score 712</div>
      <div class="pill status">KYC pendente • 2 docs</div>
    </div>
    <div class="actions flex gap-2">
      <button class="btn primary">Next Best Action</button>
      <button class="btn ghost">Agendar follow-up</button>
    </div>
  </header>

  <section class="grid lg:grid-cols-[2fr_1fr] gap-4">
    <div class="stack flex flex-col gap-4">
      <div class="card metrics">Patrimônio, saldo, renda</div>
      <div class="card products table">Produtos ativos e limites</div>
      <div class="card exposures">Exposições e concentrações</div>
      <div class="card timeline">Timeline multicanal</div>
    </div>
    <aside class="rail flex flex-col gap-3 sticky top-4">
      <div class="card nudge">Sugestão de oferta + racional</div>
      <div class="card tasks">Tasks & checklists</div>
      <div class="card docs">Documentos pendentes</div>
      <div class="card notes">Notas rápidas</div>
    </aside>
  </section>
</main>
```

## Layout e densidade
- Grid 12 col; gutters 20–24 px; cards com 16–20 px internos; radius 16–18 px.
- Tipos: títulos 18–20 semibold; body 14–15 regular; números com tabular lining.
- Contraste: superfície #0F172A/80 + blur leve; linhas divisórias 1 px @ 8–12% branco.
- Movimentos: hover +2 px shadow e leve translateY(-1px); focus ring 2 px visível.

