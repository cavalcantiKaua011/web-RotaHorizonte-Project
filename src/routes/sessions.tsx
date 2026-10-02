import { getTypeLabel, getDifficultyLabel, getStatusLabel } from '../lib/db'

interface SessionsProps {
  sessions: any[]
  tipo: string
  nivel: string
}

export function sessionsPage({ sessions, tipo, nivel }: SessionsProps): string {
  if (!sessions || sessions.length === 0) {
    sessions = [
      { id: 1, name: 'Trilha do Mirante das Águias', type: 'trilha', difficulty: 'iniciante', date: '2026-04-05', time: '07:00', location: 'Serra da Canastra - MG', duration: '6 horas', max_spots: 15, price: 180, status: 'aberta' },
      { id: 2, name: 'Rapel das Cachoeiras', type: 'rapel', difficulty: 'intermediario', date: '2026-04-12', time: '08:00', location: 'Chapada dos Veadeiros - GO', duration: '5 horas', max_spots: 10, price: 250, status: 'quase_lotada' },
      { id: 3, name: 'Expedição Combo', type: 'combo', difficulty: 'intermediario', date: '2026-04-19', time: '06:30', location: 'Ibitipoca - MG', duration: '8 horas', max_spots: 8, price: 380, status: 'aberta' },
    ]
  }

  const sessionsHtml = sessions.length === 0
    ? `<div style="text-align:center;padding:60px 20px;color:var(--grafite)"><i class="fas fa-search" style="font-size:3rem;margin-bottom:16px;opacity:0.4"></i><h3>Nenhuma sessão encontrada</h3><p>Tente outros filtros ou <a href="/sessoes" style="color:var(--azul)">veja todas as sessões</a>.</p></div>`
    : sessions.map(s => {
        const dateObj = new Date(s.date + 'T12:00:00')
        const dayNum = dateObj.getDate()
        const monthStr = dateObj.toLocaleDateString('pt-BR', { month: 'short' }).replace('.', '').toUpperCase()
        const weekday = dateObj.toLocaleDateString('pt-BR', { weekday: 'long' })
        return `
      <div class="session-list-item">
        <div class="session-date-box">
          <div class="session-date-day">${dayNum}</div>
          <div class="session-date-month">${monthStr}</div>
        </div>
        <div style="flex:1">
          <div style="display:flex;gap:10px;align-items:center;margin-bottom:8px;flex-wrap:wrap">
            <span class="card-tag tag-${s.type}">${getTypeLabel(s.type)}</span>
            <span class="difficulty difficulty-${s.difficulty}"><span class="diff-dot"></span>${getDifficultyLabel(s.difficulty)}</span>
            <span class="status-badge status-${s.status}">${getStatusLabel(s.status)}</span>
          </div>
          <h3 style="font-size:1.1rem;margin-bottom:8px;color:var(--azul-escuro)">${s.name}</h3>
          <div style="display:flex;gap:16px;flex-wrap:wrap;font-size:0.82rem;color:var(--grafite)">
            <span><i class="fas fa-map-marker-alt" style="color:var(--verde)"></i> ${s.location}</span>
            <span><i class="fas fa-calendar-day" style="color:var(--verde)"></i> ${weekday}</span>
            <span><i class="fas fa-clock" style="color:var(--verde)"></i> ${s.time}</span>
            <span><i class="fas fa-hourglass-half" style="color:var(--verde)"></i> ${s.duration}</span>
            <span><i class="fas fa-users" style="color:var(--verde)"></i> Até ${s.max_spots} pessoas</span>
          </div>
        </div>
        <div style="text-align:right;min-width:160px">
          <div class="card-price" style="margin-bottom:4px">R$ ${Number(s.price).toFixed(2).replace('.', ',')}<span>/pessoa</span></div>
          <div style="display:flex;flex-direction:column;gap:8px;margin-top:10px">
            <a href="/sessao/${s.id}" class="btn btn-secondary btn-sm"><i class="fas fa-info-circle"></i> Detalhes</a>
            ${s.status !== 'lotada' && s.status !== 'cancelada'
              ? `<a href="/inscrever/${s.id}" class="btn btn-primary btn-sm"><i class="fas fa-bolt"></i> Reservar</a>`
              : `<a href="https://wa.me/5511999999999" target="_blank" class="btn btn-outline btn-sm" style="color:var(--grafite);border-color:var(--areia-light)"><i class="fas fa-list"></i> Lista de Espera</a>`}
          </div>
        </div>
      </div>`
      }).join('')

  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>Sessões — Rota Horizonte</title>
  <link rel="stylesheet" href="/static/style.css">
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
</head>
<body>
  <nav class="navbar solid">
    <a href="/" class="nav-logo"><div class="logo-icon"><i class="fas fa-mountain"></i></div><div class="logo-text">Rota<span> Horizonte</span></div></a>
    <ul class="nav-links" id="navLinks">
      <li><a href="/">Início</a></li><li><a href="/sessoes" style="color:var(--amarelo)">Sessões</a></li>
      <li><a href="/#instrutores">Instrutores</a></li><li><a href="/#contato">Contato</a></li>
    </ul>
    <a href="https://wa.me/5511999999999" target="_blank" class="btn btn-whatsapp btn-sm nav-cta"><i class="fab fa-whatsapp"></i> WhatsApp</a>
    <div class="hamburger" onclick="toggleNav()"><span></span><span></span><span></span></div>
  </nav>

  <div style="padding-top:72px;background:linear-gradient(135deg,var(--azul-escuro),var(--verde-escuro));padding-bottom:0">
    <div class="container" style="padding:60px 5% 48px">
      <div class="section-badge gold" style="margin-bottom:16px"><i class="fas fa-calendar-alt"></i> Agenda de Experiências</div>
      <h1 style="color:white;font-size:clamp(1.8rem,4vw,3rem);margin-bottom:12px">Calendário de Sessões 2026</h1>
      <p style="color:rgba(255,255,255,0.7);max-width:540px">Escolha sua experiência, reserve sua vaga e prepare-se para uma aventura inesquecível.</p>
    </div>
  </div>

  <section class="section">
    <div class="container">
      <!-- Filters -->
      <div style="background:var(--branco);border-radius:var(--radius-lg);padding:20px 24px;margin-bottom:28px;box-shadow:var(--shadow-sm);display:flex;gap:12px;flex-wrap:wrap;align-items:center">
        <span style="font-size:0.82rem;font-weight:700;color:var(--grafite);text-transform:uppercase;letter-spacing:0.08em">Filtrar:</span>
        <div class="calendar-filters" style="margin-bottom:0">
          <a href="/sessoes" class="filter-btn ${!tipo ? 'active' : ''}">Todas</a>
          <a href="/sessoes?tipo=trilha${nivel ? '&nivel='+nivel : ''}" class="filter-btn ${tipo==='trilha' ? 'active' : ''}"><i class="fas fa-hiking"></i> Trilha</a>
          <a href="/sessoes?tipo=rapel${nivel ? '&nivel='+nivel : ''}" class="filter-btn ${tipo==='rapel' ? 'active' : ''}"><i class="fas fa-anchor"></i> Rapel</a>
          <a href="/sessoes?tipo=combo${nivel ? '&nivel='+nivel : ''}" class="filter-btn ${tipo==='combo' ? 'active' : ''}"><i class="fas fa-route"></i> Combo</a>
        </div>
        <div style="height:24px;width:1px;background:var(--areia-light)"></div>
        <div class="calendar-filters" style="margin-bottom:0">
          <a href="/sessoes${tipo ? '?tipo='+tipo : ''}" class="filter-btn ${!nivel ? 'active' : ''}">Todos níveis</a>
          <a href="/sessoes?${tipo ? 'tipo='+tipo+'&' : ''}nivel=iniciante" class="filter-btn ${nivel==='iniciante' ? 'active' : ''}">Iniciante</a>
          <a href="/sessoes?${tipo ? 'tipo='+tipo+'&' : ''}nivel=intermediario" class="filter-btn ${nivel==='intermediario' ? 'active' : ''}">Intermediário</a>
          <a href="/sessoes?${tipo ? 'tipo='+tipo+'&' : ''}nivel=avancado" class="filter-btn ${nivel==='avancado' ? 'active' : ''}">Avançado</a>
        </div>
        <div style="margin-left:auto;font-size:0.82rem;color:var(--cinza-medio)">${sessions.length} sessão(ões) encontrada(s)</div>
      </div>

      <!-- Status Legend -->
      <div style="display:flex;gap:16px;flex-wrap:wrap;margin-bottom:24px;font-size:0.8rem">
        <span class="status-badge status-aberta">Aberta</span>
        <span class="status-badge status-quase_lotada">Quase Lotada</span>
        <span class="status-badge status-lotada">Lotada</span>
        <span class="status-badge status-lista_espera">Lista de Espera</span>
      </div>

      ${sessionsHtml}

      <!-- Bottom CTA -->
      <div style="margin-top:40px;text-align:center;padding:40px;background:linear-gradient(135deg,var(--azul-escuro),var(--verde-escuro));border-radius:var(--radius-xl);color:white">
        <i class="fas fa-question-circle" style="font-size:2rem;margin-bottom:12px;color:var(--amarelo)"></i>
        <h3 style="color:white;margin-bottom:8px">Não encontrou o que procurava?</h3>
        <p style="color:rgba(255,255,255,0.7);margin-bottom:20px;font-size:0.9rem">Fale com a gente pelo WhatsApp e informe a data e modalidade que deseja. Temos sessões personalizadas!</p>
        <a href="https://wa.me/5511999999999?text=Olá!%20Não%20encontrei%20uma%20sessão%20disponível%20e%20gostaria%20de%20mais%20informações." target="_blank" class="btn btn-whatsapp btn-lg">
          <i class="fab fa-whatsapp"></i> Consultar via WhatsApp
        </a>
      </div>
    </div>
  </section>

  <a href="https://wa.me/5511999999999" target="_blank" class="whatsapp-float"><i class="fab fa-whatsapp"></i></a>
  <script src="/static/app.js"></script>
</body>
</html>`
}
