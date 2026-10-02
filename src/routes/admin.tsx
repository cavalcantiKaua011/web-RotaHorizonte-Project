import { Hono } from 'hono'
import { getStatusLabel, getTypeLabel, getDifficultyLabel } from '../lib/db'

type Bindings = { DB: D1Database }
export const adminPages = new Hono<{ Bindings: Bindings }>()

function adminLayout(title: string, activeNav: string, content: string): string {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: 'fa-chart-line', href: '/admin' },
    { id: 'sessions', label: 'Sessões', icon: 'fa-calendar-alt', href: '/admin/sessoes' },
    { id: 'registrations', label: 'Inscritos', icon: 'fa-users', href: '/admin/inscritos' },
    { id: 'checklist', label: 'Checklist', icon: 'fa-list-check', href: '/admin/checklist' },
    { id: 'instructors', label: 'Instrutores', icon: 'fa-user-shield', href: '/admin/instrutores' },
    { id: 'messages', label: 'WhatsApp', icon: 'fa-comment-dots', href: '/admin/whatsapp' },
  ]
  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
  <title>${title} — Admin Rota Horizonte</title>
  <link rel="stylesheet" href="/static/style.css">
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
</head>
<body>
  <div class="admin-layout">
    <aside class="sidebar" id="sidebar">
      <div class="sidebar-logo">
        <div class="logo-mark"><i class="fas fa-mountain"></i></div>
        <div><span>Rota Horizonte</span><small>Painel Administrativo</small></div>
      </div>
      <nav class="sidebar-nav">
        <div class="sidebar-section">
          <div class="sidebar-section-label">Operacional</div>
          ${navItems.map(n => `
          <a href="${n.href}" class="sidebar-link ${activeNav === n.id ? 'active' : ''}">
            <i class="fas ${n.icon}"></i> ${n.label}
          </a>`).join('')}
        </div>
        <div class="sidebar-section" style="margin-top:20px">
          <div class="sidebar-section-label">Sistema</div>
          <a href="/" class="sidebar-link" target="_blank"><i class="fas fa-external-link-alt"></i> Ver Site</a>
          <a href="/sessoes" class="sidebar-link" target="_blank"><i class="fas fa-eye"></i> Ver Sessões</a>
        </div>
      </nav>
      <div style="padding:20px;border-top:1px solid rgba(255,255,255,0.08)">
        <div style="display:flex;align-items:center;gap:10px">
          <div style="width:36px;height:36px;background:var(--amarelo);border-radius:50%;display:flex;align-items:center;justify-content:center;color:var(--azul-escuro);font-weight:700">A</div>
          <div><div style="font-size:0.85rem;font-weight:600;color:white">Administrador</div><div style="font-size:0.72rem;color:rgba(255,255,255,0.4)">admin@rotahorizonte.com</div></div>
        </div>
      </div>
    </aside>

    <div class="main-content">
      <div class="topbar">
        <div>
          <div class="topbar-title">${title}</div>
          <div class="topbar-subtitle">${new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long' })}</div>
        </div>
        <div class="topbar-actions">
          <a href="/sessoes" target="_blank" class="btn btn-outline btn-sm" style="color:var(--grafite);border-color:var(--areia-light)"><i class="fas fa-eye"></i> Ver Site</a>
          <a href="https://wa.me/5511999999999" target="_blank" class="btn btn-whatsapp btn-sm"><i class="fab fa-whatsapp"></i></a>
          <button onclick="document.getElementById('sidebar').classList.toggle('open')" class="btn btn-outline btn-sm" style="color:var(--grafite);border-color:var(--areia-light);display:none" id="sidebarToggle"><i class="fas fa-bars"></i></button>
        </div>
      </div>
      <div class="admin-main">${content}</div>
    </div>
  </div>
  <script src="/static/app.js"></script>
  <script>
    function showTab(id) {
      document.querySelectorAll('.tab-content').forEach(t=>t.classList.remove('active'));
      document.querySelectorAll('.tab-btn').forEach(b=>b.classList.remove('active'));
      document.getElementById('tab-'+id).classList.add('active');
      event.target.classList.add('active');
    }
    // Mobile sidebar
    if(window.innerWidth < 768) document.getElementById('sidebarToggle').style.display='flex';
  </script>
</body>
</html>`
}

// DASHBOARD
adminPages.get('/', async (c) => {
  let stats = { total_sessions: 0, total_registrations: 0, upcoming_sessions: 0, total_revenue: 0 }
  let recentRegs: any[] = []
  let upcomingSessions: any[] = []
  try {
    if (c.env?.DB) {
      const [s, r, u, rev] = await Promise.all([
        c.env.DB.prepare('SELECT COUNT(*) as c FROM sessions').first<{ c: number }>(),
        c.env.DB.prepare("SELECT COUNT(*) as c FROM registrations WHERE status NOT IN ('cancelado')").first<{ c: number }>(),
        c.env.DB.prepare("SELECT COUNT(*) as c FROM sessions WHERE date >= date('now') AND status != 'cancelada'").first<{ c: number }>(),
        c.env.DB.prepare("SELECT COALESCE(SUM(price),0) as total FROM sessions WHERE status != 'cancelada'").first<{ total: number }>(),
      ])
      stats = { total_sessions: s?.c || 0, total_registrations: r?.c || 0, upcoming_sessions: u?.c || 0, total_revenue: rev?.total || 0 }
      recentRegs = (await c.env.DB.prepare("SELECT r.*, s.name as session_name FROM registrations r LEFT JOIN sessions s ON r.session_id=s.id ORDER BY r.created_at DESC LIMIT 8").all()).results || []
      upcomingSessions = (await c.env.DB.prepare("SELECT s.*, (SELECT COUNT(*) FROM registrations WHERE session_id=s.id AND status NOT IN('cancelado')) as reg_count FROM sessions s WHERE s.date >= date('now') ORDER BY s.date ASC LIMIT 5").all()).results || []
    }
  } catch (e) {}

  const content = `
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-icon blue"><i class="fas fa-calendar-alt"></i></div>
        <div><div class="stat-number">${stats.total_sessions}</div><div class="stat-label">Total de Sessões</div></div>
      </div>
      <div class="stat-card">
        <div class="stat-icon green"><i class="fas fa-users"></i></div>
        <div><div class="stat-number">${stats.total_registrations}</div><div class="stat-label">Inscrições Ativas</div></div>
      </div>
      <div class="stat-card">
        <div class="stat-icon yellow"><i class="fas fa-clock"></i></div>
        <div><div class="stat-number">${stats.upcoming_sessions}</div><div class="stat-label">Sessões Próximas</div></div>
      </div>
      <div class="stat-card">
        <div class="stat-icon green"><i class="fas fa-dollar-sign"></i></div>
        <div><div class="stat-number">R$ ${Number(stats.total_revenue).toLocaleString('pt-BR', { minimumFractionDigits: 0 })}</div><div class="stat-label">Receita Potencial</div></div>
      </div>
    </div>

    <div style="display:grid;grid-template-columns:1fr 1fr;gap:24px">
      <div class="table-container">
        <div class="table-header">
          <div class="table-title"><i class="fas fa-bolt" style="color:var(--amarelo)"></i> Últimas Inscrições</div>
          <a href="/admin/inscritos" class="btn btn-sm btn-secondary">Ver todas</a>
        </div>
        <table class="data-table">
          <thead><tr><th>Nome</th><th>Sessão</th><th>Status</th><th>Data</th></tr></thead>
          <tbody>
            ${recentRegs.length > 0 ? recentRegs.map(r => `<tr>
              <td><strong>${r.full_name?.split(' ').slice(0,2).join(' ')}</strong></td>
              <td style="font-size:0.82rem;color:var(--grafite)">${r.session_name || 'N/A'}</td>
              <td><span class="status-badge status-${r.status}">${getStatusLabel(r.status)}</span></td>
              <td style="font-size:0.8rem;color:var(--cinza-medio)">${new Date(r.created_at).toLocaleDateString('pt-BR')}</td>
            </tr>`).join('') : '<tr><td colspan="4" style="text-align:center;padding:24px;color:var(--cinza-medio)">Nenhuma inscrição ainda</td></tr>'}
          </tbody>
        </table>
      </div>

      <div class="table-container">
        <div class="table-header">
          <div class="table-title"><i class="fas fa-calendar-check" style="color:var(--verde)"></i> Próximas Sessões</div>
          <a href="/admin/sessoes" class="btn btn-sm btn-secondary">Gerenciar</a>
        </div>
        <table class="data-table">
          <thead><tr><th>Sessão</th><th>Data</th><th>Vagas</th><th>Status</th></tr></thead>
          <tbody>
            ${upcomingSessions.length > 0 ? upcomingSessions.map((s: any) => `<tr>
              <td><strong style="font-size:0.9rem">${s.name}</strong><br><span style="font-size:0.78rem;color:var(--grafite)">${s.location}</span></td>
              <td style="font-size:0.85rem">${new Date(s.date+'T12:00:00').toLocaleDateString('pt-BR',{day:'2-digit',month:'short'})}</td>
              <td><span style="font-weight:700">${s.reg_count}</span><span style="color:var(--cinza-medio)">/${s.max_spots}</span></td>
              <td><span class="status-badge status-${s.status}">${getStatusLabel(s.status)}</span></td>
            </tr>`).join('') : '<tr><td colspan="4" style="text-align:center;padding:24px;color:var(--cinza-medio)">Nenhuma sessão próxima</td></tr>'}
          </tbody>
        </table>
      </div>
    </div>

    <!-- Quick Actions -->
    <div style="background:var(--branco);border-radius:var(--radius-lg);padding:24px;box-shadow:var(--shadow-sm);margin-top:24px">
      <h3 style="font-size:1rem;color:var(--azul-escuro);margin-bottom:16px"><i class="fas fa-zap"></i> Ações Rápidas</h3>
      <div style="display:flex;gap:12px;flex-wrap:wrap">
        <a href="/admin/sessoes/nova" class="btn btn-primary"><i class="fas fa-plus"></i> Nova Sessão</a>
        <a href="/admin/inscritos" class="btn btn-secondary"><i class="fas fa-users"></i> Ver Inscritos</a>
        <a href="/admin/checklist" class="btn btn-verde"><i class="fas fa-list-check"></i> Checklists</a>
        <a href="/admin/whatsapp" class="btn btn-whatsapp"><i class="fab fa-whatsapp"></i> WhatsApp</a>
      </div>
    </div>`

  return c.html(adminLayout('Dashboard', 'dashboard', content))
})

// SESSIONS LIST
adminPages.get('/sessoes', async (c) => {
  let sessions: any[] = []
  try {
    if (c.env?.DB) {
      sessions = (await c.env.DB.prepare(`
        SELECT s.*, (SELECT COUNT(*) FROM registrations WHERE session_id=s.id AND status NOT IN('cancelado')) as reg_count
        FROM sessions s ORDER BY s.date ASC
      `).all()).results || []
    }
  } catch (e) {}

  const content = `
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:24px;flex-wrap:wrap;gap:12px">
      <div>
        <h2 style="font-size:1.3rem;color:var(--azul-escuro);margin-bottom:4px">Gestão de Sessões</h2>
        <p style="font-size:0.85rem;color:var(--cinza-medio)">${sessions.length} sessão(ões) cadastradas</p>
      </div>
      <a href="/admin/sessoes/nova" class="btn btn-primary"><i class="fas fa-plus"></i> Nova Sessão</a>
    </div>

    <div class="table-container">
      <table class="data-table">
        <thead><tr><th>Sessão</th><th>Data/Hora</th><th>Local</th><th>Vagas</th><th>Preço</th><th>Status</th><th>Ações</th></tr></thead>
        <tbody>
          ${sessions.length > 0 ? sessions.map((s: any) => {
            const dateStr = new Date(s.date+'T12:00:00').toLocaleDateString('pt-BR',{day:'2-digit',month:'short',year:'numeric'})
            const pct = Math.round((s.reg_count/s.max_spots)*100)
            return `<tr>
            <td>
              <div style="font-weight:600">${s.name}</div>
              <div style="display:flex;gap:8px;margin-top:4px">
                <span class="card-tag tag-${s.type}" style="margin:0">${getTypeLabel(s.type)}</span>
                <span class="difficulty difficulty-${s.difficulty}"><span class="diff-dot"></span>${getDifficultyLabel(s.difficulty)}</span>
              </div>
            </td>
            <td><div style="font-weight:600">${dateStr}</div><div style="font-size:0.8rem;color:var(--cinza-medio)">${s.time}</div></td>
            <td style="font-size:0.85rem">${s.location}</td>
            <td>
              <div style="font-weight:700">${s.reg_count}/${s.max_spots}</div>
              <div class="vagas-bar vagas-${pct>=100?'full':pct>=70?'warn':'ok'}" style="width:80px;margin:4px 0">
                <div class="vagas-bar-fill" style="width:${Math.min(pct,100)}%"></div>
              </div>
            </td>
            <td style="font-weight:700">R$ ${Number(s.price).toFixed(2).replace('.',',')}</td>
            <td><span class="status-badge status-${s.status}">${getStatusLabel(s.status)}</span></td>
            <td>
              <div style="display:flex;gap:6px">
                <a href="/admin/inscritos?sessao=${s.id}" class="btn btn-sm btn-secondary" title="Ver inscritos"><i class="fas fa-users"></i></a>
                <a href="/admin/checklist?sessao=${s.id}" class="btn btn-sm btn-verde" title="Checklist"><i class="fas fa-list-check"></i></a>
                <a href="/sessao/${s.id}" target="_blank" class="btn btn-sm" style="background:var(--cinza-claro);color:var(--grafite)" title="Ver página pública"><i class="fas fa-eye"></i></a>
              </div>
            </td>
          </tr>`}).join('') : '<tr><td colspan="7" style="text-align:center;padding:40px;color:var(--cinza-medio)"><i class="fas fa-calendar-plus" style="font-size:2rem;margin-bottom:12px;display:block"></i>Nenhuma sessão criada. <a href="/admin/sessoes/nova" style="color:var(--azul)">Criar primeira sessão</a></td></tr>'}
        </tbody>
      </table>
    </div>`

  return c.html(adminLayout('Sessões', 'sessions', content))
})

// NEW SESSION FORM
adminPages.get('/sessoes/nova', async (c) => {
  let instructors: any[] = []
  try {
    if (c.env?.DB) instructors = (await c.env.DB.prepare('SELECT * FROM instructors WHERE active=1').all()).results || []
  } catch (e) {}

  const content = `
    <div style="max-width:800px">
      <a href="/admin/sessoes" style="color:var(--grafite);font-size:0.88rem;margin-bottom:20px;display:inline-block"><i class="fas fa-arrow-left"></i> Voltar às sessões</a>
      <h2 style="font-size:1.3rem;color:var(--azul-escuro);margin-bottom:24px">Criar Nova Sessão</h2>
      
      <form action="/admin/sessoes/nova" method="POST">
        <div style="background:var(--branco);border-radius:var(--radius-lg);padding:28px;box-shadow:var(--shadow-sm);margin-bottom:20px">
          <h3 style="font-size:0.95rem;color:var(--azul-escuro);margin-bottom:20px">Informações Básicas</h3>
          <div class="form-group">
            <label class="form-label">Nome da sessão <span class="required">*</span></label>
            <input type="text" name="name" class="form-input" placeholder="Ex: Trilha do Mirante das Águias" required>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label class="form-label">Tipo <span class="required">*</span></label>
              <select name="type" class="form-select" required>
                <option value="trilha">Trilha</option>
                <option value="rapel">Rapel</option>
                <option value="combo">Combo (Trilha + Rapel)</option>
              </select>
            </div>
            <div class="form-group">
              <label class="form-label">Nível de dificuldade <span class="required">*</span></label>
              <select name="difficulty" class="form-select" required>
                <option value="iniciante">Iniciante</option>
                <option value="intermediario">Intermediário</option>
                <option value="avancado">Avançado</option>
              </select>
            </div>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label class="form-label">Data <span class="required">*</span></label>
              <input type="date" name="date" class="form-input" required>
            </div>
            <div class="form-group">
              <label class="form-label">Horário <span class="required">*</span></label>
              <input type="time" name="time" class="form-input" value="07:00" required>
            </div>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label class="form-label">Local <span class="required">*</span></label>
              <input type="text" name="location" class="form-input" placeholder="Ex: Serra da Canastra - MG" required>
            </div>
            <div class="form-group">
              <label class="form-label">Duração estimada <span class="required">*</span></label>
              <input type="text" name="duration" class="form-input" placeholder="Ex: 6 horas" required>
            </div>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label class="form-label">Vagas disponíveis <span class="required">*</span></label>
              <input type="number" name="max_spots" class="form-input" value="15" min="1" max="50" required>
            </div>
            <div class="form-group">
              <label class="form-label">Preço por pessoa (R$) <span class="required">*</span></label>
              <input type="number" name="price" class="form-input" value="0" min="0" step="0.01" required>
            </div>
          </div>
        </div>

        <div style="background:var(--branco);border-radius:var(--radius-lg);padding:28px;box-shadow:var(--shadow-sm);margin-bottom:20px">
          <h3 style="font-size:0.95rem;color:var(--azul-escuro);margin-bottom:20px">Descrição e Logística</h3>
          <div class="form-group">
            <label class="form-label">Descrição da experiência</label>
            <textarea name="description" class="form-textarea" placeholder="Descreva a experiência para os participantes..." rows="4"></textarea>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label class="form-label">O que está incluso</label>
              <textarea name="included" class="form-textarea" placeholder="Guia, equipamentos, seguro, lanche..." style="min-height:80px"></textarea>
            </div>
            <div class="form-group">
              <label class="form-label">O que levar</label>
              <textarea name="what_to_bring" class="form-textarea" placeholder="Tênis, mochila, água, protetor solar..." style="min-height:80px"></textarea>
            </div>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label class="form-label">Plano A (condições ideais)</label>
              <textarea name="plan_a" class="form-textarea" placeholder="Descreva o roteiro padrão..." style="min-height:80px"></textarea>
            </div>
            <div class="form-group">
              <label class="form-label">Plano B (contingência)</label>
              <textarea name="plan_b" class="form-textarea" placeholder="Descreva a alternativa para chuva ou imprevistos..." style="min-height:80px"></textarea>
            </div>
          </div>
        </div>

        <div style="background:var(--branco);border-radius:var(--radius-lg);padding:28px;box-shadow:var(--shadow-sm);margin-bottom:24px">
          <h3 style="font-size:0.95rem;color:var(--azul-escuro);margin-bottom:20px">Instrutores e Status</h3>
          ${instructors.length > 0 ? `<div class="form-group">
            <label class="form-label">Instrutores responsáveis</label>
            <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:10px">
              ${instructors.map((i: any) => `<label class="form-check" style="cursor:pointer">
                <input type="checkbox" name="instructor_ids" value="${i.id}">
                <div class="check-label"><strong>${i.name}</strong><br><span style="font-size:0.8rem;color:var(--grafite)">${i.specialties || ''}</span></div>
              </label>`).join('')}
            </div>
          </div>` : '<div class="alert alert-info"><i class="fas fa-info-circle alert-icon"></i><span>Nenhum instrutor cadastrado. <a href="/admin/instrutores" style="color:var(--azul)">Cadastre instrutores</a> primeiro.</span></div>'}
          <div class="form-group" style="margin-top:16px">
            <label class="form-label">Status inicial</label>
            <select name="status" class="form-select">
              <option value="aberta">Aberta</option>
              <option value="quase_lotada">Quase Lotada</option>
              <option value="lotada">Lotada</option>
            </select>
          </div>
        </div>

        <div style="display:flex;gap:12px">
          <button type="submit" class="btn btn-primary btn-lg"><i class="fas fa-check"></i> Criar Sessão</button>
          <a href="/admin/sessoes" class="btn btn-secondary btn-lg"><i class="fas fa-times"></i> Cancelar</a>
        </div>
      </form>
    </div>`

  return c.html(adminLayout('Nova Sessão', 'sessions', content))
})

adminPages.post('/sessoes/nova', async (c) => {
  try {
    const body = await c.req.parseBody()
    const instrIds = Array.isArray(body['instructor_ids']) ? body['instructor_ids'] : (body['instructor_ids'] ? [body['instructor_ids']] : [])
    await c.env.DB.prepare(`
      INSERT INTO sessions (name, type, difficulty, date, time, location, duration, max_spots, price, description, included, what_to_bring, plan_a, plan_b, status, instructor_ids)
      VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
    `).bind(
      body['name'], body['type'], body['difficulty'], body['date'], body['time'],
      body['location'], body['duration'], Number(body['max_spots']), Number(body['price']),
      body['description'] || '', body['included'] || '', body['what_to_bring'] || '',
      body['plan_a'] || '', body['plan_b'] || '', body['status'] || 'aberta',
      JSON.stringify(instrIds)
    ).run()
    return c.redirect('/admin/sessoes')
  } catch (e: any) {
    return c.html(adminLayout('Erro', 'sessions', `<div class="alert alert-error"><i class="fas fa-exclamation-circle alert-icon"></i>${e.message}</div><a href="/admin/sessoes/nova" class="btn btn-primary">Voltar</a>`))
  }
})

// REGISTRATIONS
adminPages.get('/inscritos', async (c) => {
  const sessionId = c.req.query('sessao')
  let regs: any[] = []
  let sessions: any[] = []
  let selectedSession: any = null
  try {
    if (c.env?.DB) {
      sessions = (await c.env.DB.prepare("SELECT * FROM sessions ORDER BY date DESC").all()).results || []
      let q = "SELECT r.*, s.name as session_name, s.date as session_date FROM registrations r LEFT JOIN sessions s ON r.session_id=s.id"
      if (sessionId) q += ` WHERE r.session_id=${Number(sessionId)}`
      q += " ORDER BY r.created_at DESC"
      regs = (await c.env.DB.prepare(q).all()).results || []
      if (sessionId) selectedSession = sessions.find((s: any) => s.id == Number(sessionId))
    }
  } catch (e) {}

  const content = `
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:24px;flex-wrap:wrap;gap:12px">
      <div>
        <h2 style="font-size:1.3rem;color:var(--azul-escuro);margin-bottom:4px">
          ${selectedSession ? `Inscritos — ${selectedSession.name}` : 'Todos os Inscritos'}
        </h2>
        <p style="font-size:0.85rem;color:var(--cinza-medio)">${regs.length} inscrição(ões)</p>
      </div>
      <div style="display:flex;gap:10px;flex-wrap:wrap">
        <select onchange="if(this.value)window.location='/admin/inscritos?sessao='+this.value;else window.location='/admin/inscritos'" class="form-select" style="width:auto">
          <option value="">Todas as sessões</option>
          ${sessions.map((s: any) => `<option value="${s.id}" ${sessionId == s.id ? 'selected' : ''}>${s.name} (${new Date(s.date+'T12:00:00').toLocaleDateString('pt-BR',{day:'2-digit',month:'short'})})</option>`).join('')}
        </select>
      </div>
    </div>

    <!-- Summary stats -->
    ${selectedSession ? `
    <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:16px;margin-bottom:24px">
      ${[
        { label: 'Confirmados', status: 'confirmado', color: 'green' },
        { label: 'Ag. Pagamento', status: 'aguardando_pagamento', color: 'yellow' },
        { label: 'Pendentes', status: 'pendente', color: 'yellow' },
        { label: 'Cancelados', status: 'cancelado', color: 'red' },
      ].map(item => {
        const count = regs.filter((r: any) => r.status === item.status).length
        return `<div class="stat-card"><div class="stat-icon ${item.color}"><i class="fas fa-user"></i></div>
          <div><div class="stat-number">${count}</div><div class="stat-label">${item.label}</div></div></div>`
      }).join('')}
    </div>` : ''}

    <div class="table-container">
      <table class="data-table">
        <thead><tr><th>Nome</th><th>Contato</th>${!sessionId ? '<th>Sessão</th>' : ''}<th>Status</th><th>Pagamento</th><th>Presença</th><th>Inscrito em</th><th>Ações</th></tr></thead>
        <tbody>
          ${regs.length > 0 ? regs.map((r: any) => `<tr>
            <td>
              <div style="font-weight:600">${r.full_name}</div>
              <div style="font-size:0.78rem;color:var(--cinza-medio)">${r.cpf}</div>
            </td>
            <td>
              <div style="font-size:0.85rem">${r.email}</div>
              <div style="font-size:0.8rem;color:var(--grafite)">${r.phone}</div>
            </td>
            ${!sessionId ? `<td style="font-size:0.85rem">${r.session_name || 'N/A'}</td>` : ''}
            <td>
              <select onchange="updateStatus(${r.id},this.value)" class="form-select" style="width:auto;padding:4px 8px;font-size:0.8rem">
                ${['pendente','confirmado','aguardando_pagamento','cancelado','lista_espera','presente','ausente'].map(s => `<option value="${s}" ${r.status===s?'selected':''}>${getStatusLabel(s)}</option>`).join('')}
              </select>
            </td>
            <td><span class="status-badge status-${r.payment_status||'pendente'}">${r.payment_status==='pago'?'Pago':'Pendente'}</span></td>
            <td>
              ${r.status==='confirmado'||r.status==='presente'||r.status==='ausente' ? `
                <select onchange="updateStatus(${r.id},this.value)" class="form-select" style="width:auto;padding:4px 8px;font-size:0.8rem">
                  <option value="confirmado" ${r.status==='confirmado'?'selected':''}>Confirmado</option>
                  <option value="presente" ${r.status==='presente'?'selected':''}>✅ Presente</option>
                  <option value="ausente" ${r.status==='ausente'?'selected':''}>❌ Ausente</option>
                </select>` : '—'}
            </td>
            <td style="font-size:0.8rem;color:var(--cinza-medio)">${new Date(r.created_at).toLocaleDateString('pt-BR')}</td>
            <td>
              <div style="display:flex;gap:4px">
                <a href="https://wa.me/55${r.phone.replace(/\D/g,'')}" target="_blank" class="btn btn-whatsapp btn-sm" title="WhatsApp"><i class="fab fa-whatsapp"></i></a>
                <a href="/minha-area/${r.token}" target="_blank" class="btn btn-sm" style="background:var(--cinza-claro);color:var(--grafite)" title="Área do cliente"><i class="fas fa-user"></i></a>
              </div>
            </td>
          </tr>`).join('') : '<tr><td colspan="8" style="text-align:center;padding:40px;color:var(--cinza-medio)">Nenhuma inscrição encontrada</td></tr>'}
        </tbody>
      </table>
    </div>

    <script>
      async function updateStatus(id, status) {
        try {
          await fetch('/api/registrations/'+id+'/status', {
            method: 'PUT', headers: {'Content-Type':'application/json'},
            body: JSON.stringify({status})
          });
        } catch(e) { alert('Erro ao atualizar status'); }
      }
    </script>`

  return c.html(adminLayout('Inscritos', 'registrations', content))
})

// CHECKLIST
adminPages.get('/checklist', async (c) => {
  const sessionId = c.req.query('sessao')
  let sessions: any[] = []
  let checklist: any[] = []
  let selectedSession: any = null
  try {
    if (c.env?.DB) {
      sessions = (await c.env.DB.prepare("SELECT * FROM sessions WHERE date >= date('now') ORDER BY date ASC").all()).results || []
      if (sessionId) {
        selectedSession = await c.env.DB.prepare('SELECT * FROM sessions WHERE id=?').bind(sessionId).first()
        checklist = (await c.env.DB.prepare('SELECT * FROM checklists WHERE session_id=? ORDER BY phase,order_index').bind(sessionId).all()).results || []
        if (checklist.length === 0 && selectedSession) {
          await fetch(`/api/checklist/init/${sessionId}`, { method: 'POST' }).catch(() => {})
        }
      }
    }
  } catch (e) {}

  const phases = [
    { id: 'antes', label: 'Antes', icon: '📋', color: '#1B3A5C' },
    { id: 'recepcao', label: 'Recepção', icon: '👋', color: '#396644' },
    { id: 'execucao', label: 'Execução', icon: '🏃', color: '#D97706' },
    { id: 'encerramento', label: 'Encerramento', icon: '✅', color: '#7C3AED' },
    { id: 'pos', label: 'Pós-Evento', icon: '📱', color: '#0F2540' },
  ]

  const checklistByPhase = phases.reduce((acc: any, p) => {
    acc[p.id] = checklist.filter((i: any) => i.phase === p.id)
    return acc
  }, {})

  const totalItems = checklist.length
  const doneItems = checklist.filter((i: any) => i.completed).length
  const pct = totalItems > 0 ? Math.round((doneItems / totalItems) * 100) : 0

  const content = `
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:24px;flex-wrap:wrap;gap:12px">
      <h2 style="font-size:1.3rem;color:var(--azul-escuro)">Checklist Operacional</h2>
      <select onchange="if(this.value)window.location='/admin/checklist?sessao='+this.value;else window.location='/admin/checklist'" class="form-select" style="width:auto">
        <option value="">Selecione uma sessão...</option>
        ${sessions.map((s: any) => `<option value="${s.id}" ${sessionId==s.id?'selected':''}>${s.name} — ${new Date(s.date+'T12:00:00').toLocaleDateString('pt-BR',{day:'2-digit',month:'short'})}</option>`).join('')}
      </select>
    </div>

    ${!sessionId ? `
    <div style="text-align:center;padding:80px 20px;background:var(--branco);border-radius:var(--radius-lg);box-shadow:var(--shadow-sm)">
      <i class="fas fa-list-check" style="font-size:4rem;color:var(--areia-light);margin-bottom:20px"></i>
      <h3 style="color:var(--azul-escuro);margin-bottom:8px">Selecione uma sessão</h3>
      <p style="color:var(--cinza-medio)">Escolha uma sessão acima para ver e gerenciar o checklist operacional.</p>
    </div>` : `

    ${selectedSession ? `
    <div style="background:linear-gradient(135deg,var(--azul-escuro),var(--verde-escuro));border-radius:var(--radius-lg);padding:20px 24px;margin-bottom:24px;color:white;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:12px">
      <div>
        <div style="font-size:0.75rem;text-transform:uppercase;letter-spacing:0.1em;color:rgba(255,255,255,0.6)">Sessão Selecionada</div>
        <div style="font-weight:700;font-size:1.05rem">${selectedSession.name}</div>
        <div style="font-size:0.82rem;color:rgba(255,255,255,0.7)">${new Date(selectedSession.date+'T12:00:00').toLocaleDateString('pt-BR',{weekday:'long',day:'2-digit',month:'long'})}</div>
      </div>
      <div style="text-align:right">
        <div style="font-size:2rem;font-weight:800;color:var(--amarelo)">${pct}%</div>
        <div style="font-size:0.75rem;color:rgba(255,255,255,0.6)">${doneItems}/${totalItems} itens concluídos</div>
        <div style="height:4px;background:rgba(255,255,255,0.2);border-radius:2px;margin-top:8px;width:120px">
          <div style="height:100%;background:var(--amarelo);border-radius:2px;width:${pct}%"></div>
        </div>
      </div>
    </div>` : ''}

    ${checklist.length === 0 ? `
    <div style="text-align:center;padding:40px;background:var(--branco);border-radius:var(--radius-lg)">
      <p>Inicializando checklist... <a href="/admin/checklist?sessao=${sessionId}" class="btn btn-primary btn-sm" onclick="initChecklist(${sessionId});return false">Criar Checklist</a></p>
    </div>` : `
    <div style="display:flex;gap:16px;align-items:center;margin-bottom:20px;flex-wrap:wrap">
      <div style="display:flex;gap:8px;flex-wrap:wrap">
        ${phases.map(p => {
          const items = checklistByPhase[p.id] || []
          const done = items.filter((i: any) => i.completed).length
          return `<a href="#phase-${p.id}" class="filter-btn ${done===items.length&&items.length>0?'active':''}">
            ${p.icon} ${p.label} <span style="font-size:0.72rem;opacity:0.7">${done}/${items.length}</span>
          </a>`
        }).join('')}
      </div>
      <button onclick="exportChecklist()" class="btn btn-secondary btn-sm" style="margin-left:auto"><i class="fas fa-file-pdf"></i> Exportar PDF</button>
    </div>

    <div id="checklistContent">
      ${phases.map(p => {
        const items = checklistByPhase[p.id] || []
        const done = items.filter((i: any) => i.completed).length
        return `<div class="checklist-phase" id="phase-${p.id}">
          <div class="phase-header" style="background:${p.color}">
            <span class="phase-icon">${p.icon}</span>
            <span class="phase-title">${p.label}</span>
            <span class="phase-progress">${done}/${items.length}</span>
          </div>
          ${items.map((item: any) => `
          <div class="checklist-item ${item.completed ? 'completed' : ''}" id="item-${item.id}" onclick="toggleItem(${item.id})">
            <input type="checkbox" ${item.completed ? 'checked' : ''} onchange="toggleItem(${item.id})">
            <label>${item.item}</label>
            ${item.completed ? `<span class="check-done"><i class="fas fa-check-circle"></i> ${item.completed_by || ''}</span>` : ''}
          </div>`).join('')}
        </div>`
      }).join('')}
    </div>`}

    <script>
      async function toggleItem(id) {
        const item = document.getElementById('item-'+id);
        const cb = item.querySelector('input[type="checkbox"]');
        const completed = cb.checked;
        item.classList.toggle('completed', completed);
        await fetch('/api/checklist/'+id, {
          method:'PUT', headers:{'Content-Type':'application/json'},
          body: JSON.stringify({completed, completed_by: 'Admin'})
        });
        setTimeout(() => location.reload(), 500);
      }
      async function initChecklist(sid) {
        await fetch('/api/checklist/init/'+sid, {method:'POST'});
        location.reload();
      }
      function exportChecklist() {
        window.print();
      }
    </script>`}
  `

  return c.html(adminLayout('Checklist', 'checklist', content))
})

// INSTRUCTORS
adminPages.get('/instrutores', async (c) => {
  let instructors: any[] = []
  try {
    if (c.env?.DB) instructors = (await c.env.DB.prepare('SELECT * FROM instructors ORDER BY id').all()).results || []
  } catch (e) {}

  const content = `
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:24px">
      <h2 style="font-size:1.3rem;color:var(--azul-escuro)">Equipe de Instrutores</h2>
      <button onclick="document.getElementById('addInstructorModal').classList.add('open')" class="btn btn-primary"><i class="fas fa-plus"></i> Novo Instrutor</button>
    </div>

    <div class="grid-3">
      ${instructors.map(i => `
      <div class="instructor-card">
        <div class="instructor-photo">
          <i class="fas fa-user"></i>
          <div class="instructor-badge">${i.experience_years}+ anos</div>
        </div>
        <div class="instructor-body">
          <h3 class="instructor-name">${i.name}</h3>
          <p class="instructor-exp"><i class="fas fa-mountain"></i> ${i.specialties || '—'}</p>
          <p class="instructor-bio" style="-webkit-line-clamp:3;overflow:hidden;display:-webkit-box;-webkit-box-orient:vertical">${i.bio || ''}</p>
          ${i.certifications ? `<div class="instructor-certs">${i.certifications.split(',').map((cert: string) => `<span class="cert-tag">${cert.trim()}</span>`).join('')}</div>` : ''}
          <div style="display:flex;gap:8px;margin-top:16px">
            <span class="status-badge ${i.active ? 'status-confirmado' : 'status-cancelada'}">${i.active ? 'Ativo' : 'Inativo'}</span>
          </div>
        </div>
      </div>`).join('') || `<div style="grid-column:span 3;text-align:center;padding:60px;background:var(--branco);border-radius:var(--radius-lg)">
        <i class="fas fa-user-plus" style="font-size:3rem;color:var(--areia-light);margin-bottom:16px"></i>
        <h3 style="color:var(--azul-escuro)">Nenhum instrutor cadastrado</h3>
        <p style="color:var(--cinza-medio);margin-bottom:20px">Cadastre os guias e instrutores da equipe.</p>
        <button onclick="document.getElementById('addInstructorModal').classList.add('open')" class="btn btn-primary">Cadastrar primeiro instrutor</button>
      </div>`}
    </div>

    <!-- Add Instructor Modal -->
    <div class="modal-overlay" id="addInstructorModal">
      <div class="modal">
        <div class="modal-header">
          <h3 class="modal-title">Novo Instrutor</h3>
          <button class="modal-close" onclick="document.getElementById('addInstructorModal').classList.remove('open')"><i class="fas fa-times"></i></button>
        </div>
        <div class="modal-body">
          <form action="/admin/instrutores" method="POST">
            <div class="form-group"><label class="form-label">Nome completo <span class="required">*</span></label><input type="text" name="name" class="form-input" required></div>
            <div class="form-row">
              <div class="form-group"><label class="form-label">Anos de experiência</label><input type="number" name="experience_years" class="form-input" value="5" min="1"></div>
            </div>
            <div class="form-group"><label class="form-label">Especialidades</label><input type="text" name="specialties" class="form-input" placeholder="Ex: Trilhas, Rapel, Escalada"></div>
            <div class="form-group"><label class="form-label">Certificações</label><input type="text" name="certifications" class="form-input" placeholder="Ex: CBME, WFR, ACMG (separados por vírgula)"></div>
            <div class="form-group"><label class="form-label">Biografia</label><textarea name="bio" class="form-textarea"></textarea></div>
            <div class="form-group"><label class="form-label">Filosofia de trabalho</label><input type="text" name="philosophy" class="form-input" placeholder="Uma frase que define sua abordagem"></div>
            <button type="submit" class="btn btn-primary btn-full"><i class="fas fa-check"></i> Cadastrar Instrutor</button>
          </form>
        </div>
      </div>
    </div>`

  return c.html(adminLayout('Instrutores', 'instructors', content))
})

adminPages.post('/instrutores', async (c) => {
  try {
    const body = await c.req.parseBody()
    await c.env.DB.prepare('INSERT INTO instructors (name, experience_years, specialties, certifications, bio, philosophy) VALUES (?,?,?,?,?,?)')
      .bind(body['name'], Number(body['experience_years']) || 0, body['specialties'] || '', body['certifications'] || '', body['bio'] || '', body['philosophy'] || '').run()
    return c.redirect('/admin/instrutores')
  } catch (e: any) {
    return c.redirect('/admin/instrutores')
  }
})

// WHATSAPP
adminPages.get('/whatsapp', async (c) => {
  let messages: any[] = []
  let sessions: any[] = []
  try {
    if (c.env?.DB) {
      messages = (await c.env.DB.prepare('SELECT m.*, r.full_name, s.name as session_name FROM whatsapp_messages m LEFT JOIN registrations r ON m.registration_id=r.id LEFT JOIN sessions s ON m.session_id=s.id ORDER BY m.created_at DESC LIMIT 50').all()).results || []
      sessions = (await c.env.DB.prepare("SELECT * FROM sessions WHERE date >= date('now') ORDER BY date ASC").all()).results || []
    }
  } catch (e) {}

  const templates = [
    { id: 'confirmacao', label: '✅ Confirmação de Inscrição', icon: 'fa-check-circle', color: 'var(--verde)' },
    { id: 'd5', label: '🎯 Engajamento D-5', icon: 'fa-fire', color: 'var(--amarelo-dark)' },
    { id: 'd2', label: '📋 Instruções D-2', icon: 'fa-list', color: 'var(--azul)' },
    { id: 'd1', label: '⏰ Lembrete D-1', icon: 'fa-clock', color: 'var(--verde)' },
    { id: 'dia', label: '🚀 Dia do Evento', icon: 'fa-rocket', color: '#7C3AED' },
    { id: 'pos', label: '💚 Pós-Evento', icon: 'fa-heart', color: '#DC2626' },
  ]

  const content = `
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:24px">
      <div>
        <h2 style="font-size:1.3rem;color:var(--azul-escuro);margin-bottom:20px">Central de Mensagens WhatsApp</h2>
        
        <!-- Templates -->
        <div style="background:var(--branco);border-radius:var(--radius-lg);padding:24px;box-shadow:var(--shadow-sm);margin-bottom:20px">
          <h3 style="font-size:0.95rem;color:var(--azul-escuro);margin-bottom:16px">Templates de Mensagem</h3>
          <div style="display:flex;flex-direction:column;gap:8px">
            ${templates.map(t => `
            <div style="display:flex;align-items:center;justify-content:space-between;padding:12px 16px;background:var(--cinza-claro);border-radius:var(--radius-md)">
              <div style="display:flex;align-items:center;gap:12px">
                <i class="fas ${t.icon}" style="color:${t.color};width:20px"></i>
                <span style="font-size:0.9rem;font-weight:500">${t.label}</span>
              </div>
              <button onclick="previewMessage('${t.id}')" class="btn btn-sm btn-secondary">Preview</button>
            </div>`).join('')}
          </div>
        </div>

        <!-- Send Manual -->
        <div style="background:var(--branco);border-radius:var(--radius-lg);padding:24px;box-shadow:var(--shadow-sm)">
          <h3 style="font-size:0.95rem;color:var(--azul-escuro);margin-bottom:16px">Envio Manual</h3>
          <div class="form-group">
            <label class="form-label">Sessão</label>
            <select class="form-select" id="targetSession">
              <option value="">Selecione...</option>
              ${sessions.map((s: any) => `<option value="${s.id}">${s.name} — ${new Date(s.date+'T12:00:00').toLocaleDateString('pt-BR',{day:'2-digit',month:'short'})}</option>`).join('')}
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">Template</label>
            <select class="form-select" id="targetTemplate">
              ${templates.map(t => `<option value="${t.id}">${t.label}</option>`).join('')}
            </select>
          </div>
          <button onclick="sendBatch()" class="btn btn-whatsapp btn-full"><i class="fab fa-whatsapp"></i> Enviar para toda a turma</button>
          <p style="font-size:0.75rem;color:var(--cinza-medio);margin-top:8px;text-align:center">Integração com API oficial do WhatsApp Business necessária</p>
        </div>
      </div>

      <div>
        <h3 style="font-size:1rem;color:var(--azul-escuro);margin-bottom:16px">Histórico de Mensagens</h3>
        <div style="background:var(--branco);border-radius:var(--radius-lg);box-shadow:var(--shadow-sm);overflow:hidden">
          ${messages.length > 0 ? `
          <table class="data-table">
            <thead><tr><th>Destinatário</th><th>Tipo</th><th>Status</th><th>Data</th></tr></thead>
            <tbody>
              ${messages.map((m: any) => `<tr>
                <td><div style="font-size:0.85rem;font-weight:600">${m.full_name || m.phone}</div><div style="font-size:0.75rem;color:var(--cinza-medio)">${m.phone}</div></td>
                <td style="font-size:0.8rem">${m.type}</td>
                <td><span class="status-badge status-${m.status==='enviado'?'confirmado':'pendente'}">${m.status}</span></td>
                <td style="font-size:0.78rem;color:var(--cinza-medio)">${new Date(m.created_at).toLocaleDateString('pt-BR')}</td>
              </tr>`).join('')}
            </tbody>
          </table>` : `
          <div style="text-align:center;padding:60px;color:var(--cinza-medio)">
            <i class="fab fa-whatsapp" style="font-size:3rem;margin-bottom:16px;opacity:0.3"></i>
            <p>Nenhuma mensagem enviada ainda.</p>
          </div>`}
        </div>
      </div>
    </div>

    <!-- Preview Modal -->
    <div class="modal-overlay" id="previewModal">
      <div class="modal">
        <div class="modal-header">
          <h3 class="modal-title">Preview da Mensagem</h3>
          <button class="modal-close" onclick="document.getElementById('previewModal').classList.remove('open')"><i class="fas fa-times"></i></button>
        </div>
        <div class="modal-body">
          <div style="background:#ECE5DD;border-radius:16px;padding:20px;font-family:sans-serif">
            <div id="previewContent" style="background:white;border-radius:0 12px 12px 12px;padding:12px 16px;max-width:85%;font-size:0.9rem;line-height:1.6;box-shadow:0 1px 4px rgba(0,0,0,0.1)"></div>
          </div>
        </div>
      </div>
    </div>

    <script>
      const templates = {
        confirmacao: \`Olá, *[NOME]*! 🎉\\n\\nSua inscrição na *[SESSÃO]* foi confirmada com sucesso!\\n\\n📅 Data: *[DATA]*\\n🕐 Horário: *[HORA]*\\n📍 Local: *[LOCAL]*\\n\\nEm breve você receberá mais informações. Qualquer dúvida, é só falar! 🏔️\\n\\n*Equipe Rota Horizonte*\`,
        d5: \`Oi, *[NOME]*! 👋\\n\\nFaltam apenas *5 dias* para sua aventura na Rota Horizonte! 🏔️\\n\\nVocê está preparado(a)? Vai ser incrível!\\n\\nSe tiver alguma dúvida sobre o que levar ou como chegar, me chama aqui. 💪\`,
        d2: \`*[NOME]*, amanhã é quase lá! ⛰️\\n\\nAqui estão as instruções para *[SESSÃO]*:\\n\\n✅ Ponto de encontro: *[LOCAL]*\\n⏰ Horário: *[HORA]* — chegue 15min antes\\n🎒 Leve: tênis/bota, mochila, água 2L, protetor solar, lanche\\n\\nAnote o ponto de encontro: [LINK MAPS]\\n\\nAlguma dúvida? Responda aqui! 🙂\`,
        d1: \`*[NOME]*, está quase chegando! 🔥\\n\\nLembrete: *AMANHÃ* é sua trilha com a Rota Horizonte!\\n\\n⏰ Horário: *[HORA]*\\n📍 Local: *[LOCAL]*\\n\\nDica: prepare sua mochila hoje à noite e durma bem. Você vai precisar de energia! 💪\\n\\nTe vejo amanhã! 🏔️\`,
        dia: \`*[NOME]*, hoje é o dia! 🚀\\n\\nBom dia! Estamos ansiosos para começar a aventura com você!\\n\\nChegue no ponto de encontro até *[HORA]*. Não se atrase! ⏰\\n\\nTraga sua energia e seu sorriso. Vai ser épico! 💥\`,
        pos: \`*[NOME]*, que experiência incrível! 🏆\\n\\nObrigado por fazer parte dessa aventura conosco! Foi uma honra ter você na Rota Horizonte.\\n\\nEmbreve enviaremos as fotos do grupo. 📸\\n\\nSe puder, deixe sua avaliação — significa muito para nós:\\n⭐⭐⭐⭐⭐\\n\\nNos vemos na próxima trilha! 🌄\`,
      };
      function previewMessage(id) {
        const msg = templates[id] || 'Template não encontrado';
        document.getElementById('previewContent').innerHTML = msg.replace(/\\n/g,'<br>').replace(/\\*(.*?)\\*/g,'<strong>$1</strong>');
        document.getElementById('previewModal').classList.add('open');
      }
      function sendBatch() {
        const session = document.getElementById('targetSession').value;
        const template = document.getElementById('targetTemplate').value;
        if (!session) { alert('Selecione uma sessão primeiro'); return; }
        alert('Integração com WhatsApp Business API necessária para envio real.\\n\\nUse Twilio, Zapi, Evolution API ou similar.');
      }
    </script>`

  return c.html(adminLayout('WhatsApp', 'messages', content))
})
