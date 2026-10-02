import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { serveStatic } from 'hono/cloudflare-workers'
import { DB_SCHEMA, SEED_DATA, generateToken, getStatusLabel, getTypeLabel, getDifficultyLabel } from './lib/db'
import { landingPage } from './routes/landing'
import { sessionsPage } from './routes/sessions'
import { inscricaoPage } from './routes/inscricao'
import { clientAreaPage } from './routes/client'
import { adminPages } from './routes/admin'

type Bindings = {
  DB: D1Database
}

const app = new Hono<{ Bindings: Bindings }>()

app.use('/static/*', serveStatic({ root: './' }))
app.use('/api/*', cors())
app.get('/favicon.svg', (c) => {
  return c.body(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" rx="20" fill="#1B3A5C"/><path d="M15,80 L35,35 L50,55 L65,20 L85,80 Z" fill="#F6BE42" opacity="0.9"/><path d="M15,80 L40,50 L50,62 L65,40 L85,80 Z" fill="#396644" opacity="0.7"/></svg>`, 200, { 'Content-Type': 'image/svg+xml' })
})
app.get('/favicon.ico', (c) => c.body('', 200))

// ---- DB Init ----
async function initDB(db: D1Database) {
  const statements = DB_SCHEMA.split(';').filter(s => s.trim().length > 0)
  for (const stmt of statements) {
    try { await db.prepare(stmt + ';').run() } catch (e) { /* ignore */ }
  }
  // Seed if empty
  try {
    const count = await db.prepare('SELECT COUNT(*) as c FROM sessions').first<{ c: number }>()
    if (!count || count.c === 0) {
      const seedStmts = SEED_DATA.split(';').filter(s => s.trim().length > 0)
      for (const stmt of seedStmts) {
        try { await db.prepare(stmt + ';').run() } catch (e) { /* ignore */ }
      }
    }
  } catch (e) { /* ignore */ }
}

// ---- PAGES ----
app.get('/', async (c) => {
  if (c.env?.DB) await initDB(c.env.DB)
  let sessions: any[] = []
  let testimonials: any[] = []
  let instructors: any[] = []
  try {
    if (c.env?.DB) {
      sessions = (await c.env.DB.prepare('SELECT * FROM sessions WHERE status != "cancelada" ORDER BY date ASC LIMIT 6').all()).results || []
      testimonials = (await c.env.DB.prepare('SELECT * FROM testimonials WHERE approved = 1 ORDER BY id LIMIT 5').all()).results || []
      instructors = (await c.env.DB.prepare('SELECT * FROM instructors WHERE active = 1 ORDER BY id').all()).results || []
    }
  } catch (e) { /* demo mode */ }
  return c.html(landingPage({ sessions, testimonials, instructors }))
})

app.get('/sessoes', async (c) => {
  let sessions: any[] = []
  const tipo = c.req.query('tipo') || ''
  const nivel = c.req.query('nivel') || ''
  try {
    if (c.env?.DB) {
      let query = 'SELECT * FROM sessions WHERE status != "cancelada"'
      const params: string[] = []
      if (tipo) { query += ' AND type = ?'; params.push(tipo) }
      if (nivel) { query += ' AND difficulty = ?'; params.push(nivel) }
      query += ' ORDER BY date ASC'
      sessions = (await c.env.DB.prepare(query).bind(...params).all()).results || []
    }
  } catch (e) {}
  return c.html(sessionsPage({ sessions, tipo, nivel }))
})

app.get('/sessao/:id', async (c) => {
  const id = c.req.param('id')
  let session: any = null
  let instructors: any[] = []
  let spotsUsed = 0
  try {
    if (c.env?.DB) {
      session = await c.env.DB.prepare('SELECT * FROM sessions WHERE id = ?').bind(id).first()
      const reg = await c.env.DB.prepare("SELECT COUNT(*) as c FROM registrations WHERE session_id = ? AND status NOT IN ('cancelado')").bind(id).first<{ c: number }>()
      spotsUsed = reg?.c || 0
      if (session?.instructor_ids) {
        try {
          const ids = JSON.parse(session.instructor_ids)
          if (ids.length > 0) {
            instructors = (await c.env.DB.prepare(`SELECT * FROM instructors WHERE id IN (${ids.map((_: any) => '?').join(',')})` ).bind(...ids).all()).results || []
          }
        } catch (e) {}
      }
    }
  } catch (e) {}
  if (!session) {
    return c.html('<h1>Sessão não encontrada</h1>', 404)
  }
  return c.html(sessaoDetailPage(session, instructors, spotsUsed))
})

app.get('/inscrever/:sessionId', async (c) => {
  const sessionId = c.req.param('sessionId')
  let session: any = null
  try {
    if (c.env?.DB) {
      session = await c.env.DB.prepare('SELECT * FROM sessions WHERE id = ?').bind(sessionId).first()
    }
  } catch (e) {}
  return c.html(inscricaoPage({ session, step: 1, error: null, success: false, token: '' }))
})

app.post('/inscrever/:sessionId', async (c) => {
  const sessionId = c.req.param('sessionId')
  const body = await c.req.parseBody()
  let session: any = null
  let error = null

  try {
    if (c.env?.DB) {
      session = await c.env.DB.prepare('SELECT * FROM sessions WHERE id = ?').bind(sessionId).first()
      // Validate required fields
      const required = ['full_name', 'email', 'phone', 'cpf', 'emergency_contact', 'emergency_phone']
      for (const f of required) {
        if (!body[f]) { error = `Campo obrigatório não preenchido: ${f}`; break }
      }
      // Check accepts
      if (!error && (!body['accepted_terms'] || !body['accepted_cancellation'] || !body['accepted_image'] || !body['accepted_risk'])) {
        error = 'Você precisa aceitar todos os termos obrigatórios.'
      }
      if (!error && session) {
        const spotsQuery = await c.env.DB.prepare("SELECT COUNT(*) as c FROM registrations WHERE session_id = ? AND status NOT IN ('cancelado')").bind(sessionId).first<{ c: number }>()
        const spotsUsed = spotsQuery?.c || 0
        if (spotsUsed >= session.max_spots) { error = 'Todas as vagas estão preenchidas.' }
      }
      if (!error) {
        const token = generateToken()
        const status = session?.price > 0 ? 'aguardando_pagamento' : 'confirmado'
        await c.env.DB.prepare(`
          INSERT INTO registrations 
          (session_id, full_name, email, phone, cpf, emergency_contact, emergency_phone, previous_experience, physical_restrictions, notes, status, accepted_terms, accepted_cancellation, accepted_image, accepted_risk, token)
          VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
        `).bind(
          sessionId,
          body['full_name'] as string,
          body['email'] as string,
          body['phone'] as string,
          body['cpf'] as string,
          body['emergency_contact'] as string,
          body['emergency_phone'] as string,
          body['previous_experience'] as string || '',
          body['physical_restrictions'] as string || '',
          body['notes'] as string || '',
          status,
          body['accepted_terms'] ? 1 : 0,
          body['accepted_cancellation'] ? 1 : 0,
          body['accepted_image'] ? 1 : 0,
          body['accepted_risk'] ? 1 : 0,
          token
        ).run()
        return c.html(inscricaoPage({ session, step: 3, error: null, success: true, token }))
      }
    }
  } catch (e: any) {
    error = 'Erro ao processar inscrição. Tente novamente.'
  }
  return c.html(inscricaoPage({ session, step: 1, error, success: false, token: '' }))
})

app.get('/minha-area/:token', async (c) => {
  const token = c.req.param('token')
  let reg: any = null
  let session: any = null
  let messages: any[] = []
  try {
    if (c.env?.DB) {
      reg = await c.env.DB.prepare('SELECT * FROM registrations WHERE token = ?').bind(token).first()
      if (reg) {
        session = await c.env.DB.prepare('SELECT * FROM sessions WHERE id = ?').bind(reg.session_id).first()
        messages = (await c.env.DB.prepare('SELECT * FROM whatsapp_messages WHERE registration_id = ? ORDER BY created_at DESC LIMIT 10').bind(reg.id).all()).results || []
      }
    }
  } catch (e) {}
  if (!reg) return c.html('<div style="padding:40px;text-align:center"><h2>Link inválido ou expirado</h2></div>', 404)
  return c.html(clientAreaPage({ reg, session, messages }))
})

// Admin routes
app.route('/admin', adminPages)

// ---- API ROUTES ----
app.get('/api/sessions', async (c) => {
  try {
    if (!c.env?.DB) return c.json({ results: [] })
    const sessions = await c.env.DB.prepare('SELECT * FROM sessions ORDER BY date ASC').all()
    return c.json(sessions.results || [])
  } catch (e) { return c.json([]) }
})

app.post('/api/sessions', async (c) => {
  try {
    const body = await c.req.json()
    const db = c.env.DB
    const r = await db.prepare(`
      INSERT INTO sessions (name, type, difficulty, date, time, location, location_maps, duration, max_spots, price, description, included, what_to_bring, plan_a, plan_b, status, instructor_ids, image_url)
      VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
    `).bind(
      body.name, body.type, body.difficulty, body.date, body.time, body.location,
      body.location_maps || '', body.duration, body.max_spots, body.price,
      body.description || '', body.included || '', body.what_to_bring || '',
      body.plan_a || '', body.plan_b || '', body.status || 'aberta',
      JSON.stringify(body.instructor_ids || []), body.image_url || ''
    ).run()
    return c.json({ success: true, id: r.meta.last_row_id })
  } catch (e: any) { return c.json({ error: e.message }, 500) }
})

app.put('/api/sessions/:id', async (c) => {
  try {
    const id = c.req.param('id')
    const body = await c.req.json()
    const db = c.env.DB
    await db.prepare(`UPDATE sessions SET name=?, type=?, difficulty=?, date=?, time=?, location=?, duration=?, max_spots=?, price=?, description=?, status=?, updated_at=datetime('now') WHERE id=?`)
      .bind(body.name, body.type, body.difficulty, body.date, body.time, body.location, body.duration, body.max_spots, body.price, body.description, body.status, id).run()
    return c.json({ success: true })
  } catch (e: any) { return c.json({ error: e.message }, 500) }
})

app.get('/api/registrations/:sessionId', async (c) => {
  try {
    const sid = c.req.param('sessionId')
    const regs = await c.env.DB.prepare('SELECT * FROM registrations WHERE session_id = ? ORDER BY created_at DESC').bind(sid).all()
    return c.json(regs.results || [])
  } catch (e) { return c.json([]) }
})

app.put('/api/registrations/:id/status', async (c) => {
  try {
    const id = c.req.param('id')
    const { status } = await c.req.json()
    await c.env.DB.prepare("UPDATE registrations SET status=?, updated_at=datetime('now') WHERE id=?").bind(status, id).run()
    return c.json({ success: true })
  } catch (e: any) { return c.json({ error: e.message }, 500) }
})

app.get('/api/checklist/:sessionId', async (c) => {
  try {
    const sid = c.req.param('sessionId')
    const items = await c.env.DB.prepare('SELECT * FROM checklists WHERE session_id = ? ORDER BY phase, order_index').bind(sid).all()
    return c.json(items.results || [])
  } catch (e) { return c.json([]) }
})

app.put('/api/checklist/:id', async (c) => {
  try {
    const id = c.req.param('id')
    const { completed, completed_by } = await c.req.json()
    await c.env.DB.prepare("UPDATE checklists SET completed=?, completed_by=?, completed_at=datetime('now') WHERE id=?").bind(completed ? 1 : 0, completed_by || 'Sistema', id).run()
    return c.json({ success: true })
  } catch (e: any) { return c.json({ error: e.message }, 500) }
})

app.post('/api/checklist/init/:sessionId', async (c) => {
  const sid = c.req.param('sessionId')
  const items = [
    { phase: 'antes', item: 'Equipamentos revisados e testados', order_index: 1 },
    { phase: 'antes', item: 'Lista de presença impressa', order_index: 2 },
    { phase: 'antes', item: 'Kit de primeiros socorros completo', order_index: 3 },
    { phase: 'antes', item: 'Kit lanche preparado', order_index: 4 },
    { phase: 'antes', item: 'Plano B definido e documentado', order_index: 5 },
    { phase: 'antes', item: 'Previsão do tempo verificada', order_index: 6 },
    { phase: 'antes', item: 'Comunicação com rádio testada', order_index: 7 },
    { phase: 'recepcao', item: 'Check-in de todos os participantes', order_index: 1 },
    { phase: 'recepcao', item: 'Documentos verificados (CPF/RG)', order_index: 2 },
    { phase: 'recepcao', item: 'Termo de responsabilidade coletado', order_index: 3 },
    { phase: 'recepcao', item: 'Apresentação da equipe realizada', order_index: 4 },
    { phase: 'recepcao', item: 'Dinâmica inicial e aquecimento', order_index: 5 },
    { phase: 'execucao', item: 'Briefing de segurança realizado', order_index: 1 },
    { phase: 'execucao', item: 'Equipamentos de segurança checados em cada participante', order_index: 2 },
    { phase: 'execucao', item: 'Grupo monitorado continuamente', order_index: 3 },
    { phase: 'execucao', item: 'Hidratação e descanso assegurados', order_index: 4 },
    { phase: 'execucao', item: 'Ritmo adequado para o grupo', order_index: 5 },
    { phase: 'encerramento', item: 'Foto final do grupo realizada', order_index: 1 },
    { phase: 'encerramento', item: 'Agradecimento e encerramento oficial', order_index: 2 },
    { phase: 'encerramento', item: 'Contagem de todos os participantes', order_index: 3 },
    { phase: 'encerramento', item: 'Equipamentos recolhidos e conferidos', order_index: 4 },
    { phase: 'encerramento', item: 'Local limpo e organizado', order_index: 5 },
    { phase: 'pos', item: 'Mídia enviada aos participantes (WhatsApp)', order_index: 1 },
    { phase: 'pos', item: 'Link de feedback enviado', order_index: 2 },
    { phase: 'pos', item: 'Relatório interno preenchido', order_index: 3 },
    { phase: 'pos', item: 'Incidentes registrados (se houver)', order_index: 4 },
    { phase: 'pos', item: 'Equipamentos higienizados e armazenados', order_index: 5 },
  ]
  try {
    const existing = await c.env.DB.prepare('SELECT COUNT(*) as c FROM checklists WHERE session_id = ?').bind(sid).first<{ c: number }>()
    if (existing && existing.c > 0) return c.json({ message: 'Already initialized' })
    for (const item of items) {
      await c.env.DB.prepare('INSERT INTO checklists (session_id, phase, item, order_index) VALUES (?,?,?,?)').bind(sid, item.phase, item.item, item.order_index).run()
    }
    return c.json({ success: true, count: items.length })
  } catch (e: any) { return c.json({ error: e.message }, 500) }
})

app.get('/api/stats', async (c) => {
  try {
    const db = c.env.DB
    const [sessions, regs, upcoming, revenue] = await Promise.all([
      db.prepare('SELECT COUNT(*) as c FROM sessions').first<{ c: number }>(),
      db.prepare("SELECT COUNT(*) as c FROM registrations WHERE status NOT IN ('cancelado')").first<{ c: number }>(),
      db.prepare("SELECT COUNT(*) as c FROM sessions WHERE date >= date('now') AND status != 'cancelada'").first<{ c: number }>(),
      db.prepare("SELECT COALESCE(SUM(payment_amount), 0) as total FROM registrations WHERE payment_status = 'pago'").first<{ total: number }>(),
    ])
    return c.json({
      total_sessions: sessions?.c || 0,
      total_registrations: regs?.c || 0,
      upcoming_sessions: upcoming?.c || 0,
      total_revenue: revenue?.total || 0,
    })
  } catch (e) { return c.json({ total_sessions: 0, total_registrations: 0, upcoming_sessions: 0, total_revenue: 0 }) }
})

// ---- Session Detail Page (inline for simplicity) ----
function sessaoDetailPage(session: any, instructors: any[], spotsUsed: number): string {
  const spotsLeft = session.max_spots - spotsUsed
  const pct = Math.round((spotsUsed / session.max_spots) * 100)
  const vagas_class = pct >= 100 ? 'vagas-full' : pct >= 70 ? 'vagas-warn' : 'vagas-ok'
  const included = session.included ? session.included.split(',') : []
  const whats = session.what_to_bring ? session.what_to_bring.split(',') : []
  const dateObj = new Date(session.date + 'T12:00:00')
  const dateStr = dateObj.toLocaleDateString('pt-BR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })

  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>${session.name} — Rota Horizonte</title>
  <link rel="stylesheet" href="/static/style.css">
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
</head>
<body>
  <nav class="navbar solid">
    <a href="/" class="nav-logo"><div class="logo-icon"><i class="fas fa-mountain"></i></div><div class="logo-text">Rota<span> Horizonte</span></div></a>
    <ul class="nav-links">
      <li><a href="/">Início</a></li><li><a href="/sessoes">Sessões</a></li>
      <li><a href="/#instrutores">Instrutores</a></li><li><a href="/#contato">Contato</a></li>
    </ul>
    <a href="/sessoes" class="btn btn-primary btn-sm nav-cta"><i class="fas fa-calendar"></i> Ver Sessões</a>
  </nav>

  <div style="padding-top:72px">
    <div style="background:linear-gradient(135deg,#0F2540,#1E4429);padding:60px 5%;color:white">
      <div class="container">
        <div style="display:flex;gap:12px;align-items:center;margin-bottom:16px;flex-wrap:wrap">
          <a href="/sessoes" style="color:rgba(255,255,255,0.6);font-size:0.85rem"><i class="fas fa-arrow-left"></i> Voltar às sessões</a>
          <span style="color:rgba(255,255,255,0.3)">•</span>
          <span class="card-tag tag-${session.type}">${getTypeLabel(session.type)}</span>
          <span class="difficulty difficulty-${session.difficulty}"><span class="diff-dot"></span>${getDifficultyLabel(session.difficulty)}</span>
        </div>
        <h1 style="font-size:clamp(1.8rem,4vw,3rem);margin-bottom:12px">${session.name}</h1>
        <div style="display:flex;gap:24px;flex-wrap:wrap;color:rgba(255,255,255,0.75);font-size:0.9rem">
          <span><i class="fas fa-calendar" style="color:var(--amarelo)"></i> ${dateStr}</span>
          <span><i class="fas fa-clock" style="color:var(--amarelo)"></i> ${session.time}</span>
          <span><i class="fas fa-map-marker-alt" style="color:var(--amarelo)"></i> ${session.location}</span>
          <span><i class="fas fa-hourglass-half" style="color:var(--amarelo)"></i> ${session.duration}</span>
        </div>
      </div>
    </div>

    <div class="container" style="padding:48px 5%;display:grid;grid-template-columns:1fr 380px;gap:40px;align-items:start">
      <div>
        ${session.description ? `<div style="margin-bottom:32px"><h2 style="font-size:1.3rem;margin-bottom:12px">Sobre a Experiência</h2><p style="color:var(--grafite);line-height:1.8">${session.description}</p></div>` : ''}

        ${included.length > 0 ? `
        <div style="margin-bottom:32px">
          <h2 style="font-size:1.3rem;margin-bottom:16px"><i class="fas fa-check-circle" style="color:var(--verde)"></i> O que está incluso</h2>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">
            ${included.map(i => `<div style="display:flex;gap:10px;align-items:center;padding:10px 14px;background:rgba(57,102,68,0.08);border-radius:10px">
              <i class="fas fa-check" style="color:var(--verde);font-size:0.85rem"></i>
              <span style="font-size:0.9rem">${i.trim()}</span></div>`).join('')}
          </div>
        </div>` : ''}

        ${whats.length > 0 ? `
        <div style="margin-bottom:32px">
          <h2 style="font-size:1.3rem;margin-bottom:16px"><i class="fas fa-backpack" style="color:var(--azul)"></i> O que levar</h2>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">
            ${whats.map(i => `<div style="display:flex;gap:10px;align-items:center;padding:10px 14px;background:rgba(27,58,92,0.06);border-radius:10px">
              <i class="fas fa-circle" style="color:var(--azul);font-size:0.4rem;flex-shrink:0"></i>
              <span style="font-size:0.9rem">${i.trim()}</span></div>`).join('')}
          </div>
        </div>` : ''}

        ${(session.plan_a || session.plan_b) ? `
        <div style="margin-bottom:32px">
          <h2 style="font-size:1.3rem;margin-bottom:16px"><i class="fas fa-route" style="color:var(--amarelo-dark)"></i> Plano de Execução</h2>
          <div style="display:grid;gap:16px">
            ${session.plan_a ? `<div style="padding:20px;background:rgba(57,102,68,0.07);border-left:4px solid var(--verde);border-radius:0 12px 12px 0">
              <strong style="color:var(--verde);font-size:0.8rem;text-transform:uppercase;letter-spacing:0.08em">Plano A — Condições Ideais</strong>
              <p style="font-size:0.9rem;color:var(--grafite);margin-top:8px;line-height:1.6">${session.plan_a}</p></div>` : ''}
            ${session.plan_b ? `<div style="padding:20px;background:rgba(246,190,66,0.08);border-left:4px solid var(--amarelo);border-radius:0 12px 12px 0">
              <strong style="color:var(--amarelo-dark);font-size:0.8rem;text-transform:uppercase;letter-spacing:0.08em">Plano B — Imprevistos/Mau Tempo</strong>
              <p style="font-size:0.9rem;color:var(--grafite);margin-top:8px;line-height:1.6">${session.plan_b}</p></div>` : ''}
          </div>
        </div>` : ''}

        ${instructors.length > 0 ? `
        <div>
          <h2 style="font-size:1.3rem;margin-bottom:20px"><i class="fas fa-user-shield" style="color:var(--azul)"></i> Instrutores desta Sessão</h2>
          <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:16px">
            ${instructors.map(i => `<div style="display:flex;gap:16px;padding:20px;background:var(--branco);border-radius:16px;box-shadow:var(--shadow-sm)">
              <div style="width:56px;height:56px;min-width:56px;background:linear-gradient(135deg,var(--azul),var(--verde));border-radius:50%;display:flex;align-items:center;justify-content:center;color:white;font-size:1.4rem"><i class="fas fa-user"></i></div>
              <div><div style="font-weight:700;color:var(--azul-escuro)">${i.name}</div>
              <div style="font-size:0.8rem;color:var(--verde);margin-bottom:6px">${i.experience_years} anos de experiência</div>
              <div style="font-size:0.82rem;color:var(--grafite)">${i.specialties || ''}</div></div>
            </div>`).join('')}
          </div>
        </div>` : ''}
      </div>

      <div style="position:sticky;top:90px">
        <div style="background:var(--branco);border-radius:20px;box-shadow:var(--shadow-lg);overflow:hidden">
          <div style="background:linear-gradient(135deg,var(--azul-escuro),var(--verde-escuro));padding:24px;color:white">
            <div style="font-size:0.8rem;text-transform:uppercase;letter-spacing:0.1em;color:var(--amarelo);margin-bottom:4px">Valor por pessoa</div>
            <div style="font-size:2.5rem;font-weight:800">R$ ${Number(session.price).toFixed(2).replace('.', ',')}</div>
          </div>
          <div style="padding:24px">
            <div style="margin-bottom:20px">
              <div style="display:flex;justify-content:space-between;font-size:0.85rem;margin-bottom:8px">
                <span style="font-weight:600">Vagas disponíveis</span>
                <span style="font-weight:700;color:${spotsLeft > 0 ? 'var(--verde)' : '#DC2626'}">${spotsLeft > 0 ? spotsLeft + ' restantes' : 'Esgotado'}</span>
              </div>
              <div class="vagas-bar ${vagas_class}"><div class="vagas-bar-fill" style="width:${Math.min(pct,100)}%"></div></div>
              <div class="vagas-text">${spotsUsed} de ${session.max_spots} vagas preenchidas</div>
            </div>
            <div class="status-badge status-${session.status}" style="margin-bottom:20px">${getStatusLabel(session.status)}</div>
            ${spotsLeft > 0 && session.status !== 'cancelada' ? `
              <a href="/inscrever/${session.id}" class="btn btn-primary btn-full btn-lg" style="justify-content:center;text-align:center;display:flex">
                <i class="fas fa-bolt"></i> Garantir Minha Vaga
              </a>
              <a href="https://wa.me/5511999999999?text=Olá!%20Tenho%20interesse%20na%20sessão%20${encodeURIComponent(session.name)}" target="_blank" class="btn btn-whatsapp btn-full" style="justify-content:center;margin-top:12px;display:flex">
                <i class="fab fa-whatsapp"></i> Tirar Dúvidas no WhatsApp
              </a>` : `
              <a href="https://wa.me/5511999999999?text=Quero%20entrar%20na%20lista%20de%20espera%20para%20${encodeURIComponent(session.name)}" target="_blank" class="btn btn-secondary btn-full" style="justify-content:center;display:flex">
                <i class="fas fa-list"></i> Entrar na Lista de Espera
              </a>`}
            <div style="padding-top:20px;border-top:1px solid var(--areia-light);margin-top:20px">
              <div style="display:flex;flex-direction:column;gap:10px;font-size:0.85rem;color:var(--grafite)">
                <div style="display:flex;gap:10px;align-items:center"><i class="fas fa-shield-alt" style="color:var(--verde);width:16px"></i><span>Seguro de aventura incluso</span></div>
                <div style="display:flex;gap:10px;align-items:center"><i class="fas fa-user-md" style="color:var(--verde);width:16px"></i><span>Guias com certificação técnica</span></div>
                <div style="display:flex;gap:10px;align-items:center"><i class="fas fa-redo" style="color:var(--verde);width:16px"></i><span>Cancelamento com reembolso*</span></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <a href="https://wa.me/5511999999999" target="_blank" class="whatsapp-float"><i class="fab fa-whatsapp"></i></a>
  <script src="/static/app.js"></script>
</body>
</html>`
}

export default app
