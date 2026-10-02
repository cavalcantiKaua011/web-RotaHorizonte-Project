import { getTypeLabel, getStatusLabel } from '../lib/db'

interface ClientAreaProps {
  reg: any
  session: any
  messages: any[]
}

export function clientAreaPage({ reg, session, messages }: ClientAreaProps): string {
  const dateObj = session ? new Date(session.date + 'T12:00:00') : new Date()
  const dateStr = dateObj.toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' })
  const today = new Date()
  const daysLeft = Math.ceil((dateObj.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
  
  const whatToBring = session?.what_to_bring ? session.what_to_bring.split(',') : [
    'Tênis de trilha ou bota', 'Mochila 20-30L', 'Água 2L mínimo',
    'Protetor solar', 'Repelente', 'Lanche extra', 'Capa de chuva', 'Documentos'
  ]

  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
  <title>Minha Área — Rota Horizonte</title>
  <link rel="stylesheet" href="/static/style.css">
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
</head>
<body style="background:var(--cinza-claro)">

  <!-- Header -->
  <div class="client-hero">
    <nav class="navbar transparent" style="position:relative;height:auto;padding:0 0 0 0;margin-bottom:24px;background:transparent">
      <a href="/" class="nav-logo"><div class="logo-icon"><i class="fas fa-mountain"></i></div><div class="logo-text">Rota<span> Horizonte</span></div></a>
      <a href="https://wa.me/5511999999999" target="_blank" class="btn btn-whatsapp btn-sm"><i class="fab fa-whatsapp"></i> Suporte</a>
    </nav>
    
    <h1 style="font-size:clamp(1.5rem,3vw,2.5rem);margin-bottom:8px">
      Olá, ${reg.full_name.split(' ')[0]}! 👋
    </h1>
    <p style="color:rgba(255,255,255,0.7);margin-bottom:32px">Sua área pessoal para acompanhar tudo sobre sua aventura.</p>
    
    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:16px;max-width:800px">
      <div class="session-info-card">
        <div style="font-size:0.75rem;text-transform:uppercase;letter-spacing:0.1em;color:rgba(255,255,255,0.5);margin-bottom:4px">Status da Inscrição</div>
        <div class="status-badge status-${reg.status}" style="font-size:0.9rem">${getStatusLabel(reg.status)}</div>
      </div>
      <div class="session-info-card">
        <div style="font-size:0.75rem;text-transform:uppercase;letter-spacing:0.1em;color:rgba(255,255,255,0.5);margin-bottom:4px">Dias para a Aventura</div>
        <div style="font-size:1.8rem;font-weight:800;color:var(--amarelo);line-height:1">${daysLeft > 0 ? daysLeft : 0}</div>
        <div style="font-size:0.75rem;color:rgba(255,255,255,0.5)">dias restantes</div>
      </div>
      <div class="session-info-card">
        <div style="font-size:0.75rem;text-transform:uppercase;letter-spacing:0.1em;color:rgba(255,255,255,0.5);margin-bottom:4px">Data e Hora</div>
        <div style="font-weight:700;color:white;font-size:0.95rem">${session?.time || '07:00'}</div>
        <div style="font-size:0.82rem;color:rgba(255,255,255,0.6)">${dateStr}</div>
      </div>
    </div>
  </div>

  <div style="max-width:900px;margin:0 auto;padding:0 5% 60px">
    
    <!-- Tabs -->
    <div class="tabs" style="margin-top:-1px;background:var(--branco);border-radius:var(--radius-lg) var(--radius-lg) 0 0;padding:0 24px;box-shadow:var(--shadow-sm)">
      <button class="tab-btn active" onclick="showTab('info')"><i class="fas fa-info-circle"></i> Minha Sessão</button>
      <button class="tab-btn" onclick="showTab('checklist')"><i class="fas fa-list-check"></i> O que Levar</button>
      <button class="tab-btn" onclick="showTab('location')"><i class="fas fa-map-marker-alt"></i> Local</button>
      <button class="tab-btn" onclick="showTab('messages')"><i class="fas fa-bell"></i> Avisos</button>
    </div>

    <!-- Tab: Info -->
    <div id="tab-info" class="tab-content active" style="background:var(--branco);border-radius:0 0 var(--radius-lg) var(--radius-lg);padding:28px;box-shadow:var(--shadow-sm);margin-bottom:20px">
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:24px">
        <div>
          <h3 style="font-size:1rem;color:var(--azul-escuro);margin-bottom:16px">Detalhes da Sessão</h3>
          <div style="display:flex;flex-direction:column;gap:14px">
            <div style="display:flex;gap:12px">
              <i class="fas fa-mountain" style="color:var(--verde);width:20px;margin-top:2px"></i>
              <div><div style="font-size:0.75rem;color:var(--cinza-medio);text-transform:uppercase;letter-spacing:0.08em">Atividade</div>
              <div style="font-weight:600">${session?.name || 'Sua Sessão'}</div></div>
            </div>
            <div style="display:flex;gap:12px">
              <i class="fas fa-calendar-alt" style="color:var(--verde);width:20px;margin-top:2px"></i>
              <div><div style="font-size:0.75rem;color:var(--cinza-medio);text-transform:uppercase;letter-spacing:0.08em">Data</div>
              <div style="font-weight:600">${dateStr}</div></div>
            </div>
            <div style="display:flex;gap:12px">
              <i class="fas fa-clock" style="color:var(--verde);width:20px;margin-top:2px"></i>
              <div><div style="font-size:0.75rem;color:var(--cinza-medio);text-transform:uppercase;letter-spacing:0.08em">Horário</div>
              <div style="font-weight:600">${session?.time || '07:00'} — Ponto de encontro</div></div>
            </div>
            <div style="display:flex;gap:12px">
              <i class="fas fa-map-marker-alt" style="color:var(--verde);width:20px;margin-top:2px"></i>
              <div><div style="font-size:0.75rem;color:var(--cinza-medio);text-transform:uppercase;letter-spacing:0.08em">Local</div>
              <div style="font-weight:600">${session?.location || 'A confirmar'}</div></div>
            </div>
            <div style="display:flex;gap:12px">
              <i class="fas fa-hourglass-half" style="color:var(--verde);width:20px;margin-top:2px"></i>
              <div><div style="font-size:0.75rem;color:var(--cinza-medio);text-transform:uppercase;letter-spacing:0.08em">Duração</div>
              <div style="font-weight:600">${session?.duration || 'Conforme programado'}</div></div>
            </div>
          </div>
        </div>

        <div>
          <h3 style="font-size:1rem;color:var(--azul-escuro);margin-bottom:16px">Meus Dados</h3>
          <div style="display:flex;flex-direction:column;gap:14px">
            <div style="display:flex;gap:12px">
              <i class="fas fa-user" style="color:var(--azul);width:20px;margin-top:2px"></i>
              <div><div style="font-size:0.75rem;color:var(--cinza-medio);text-transform:uppercase;letter-spacing:0.08em">Nome</div>
              <div style="font-weight:600">${reg.full_name}</div></div>
            </div>
            <div style="display:flex;gap:12px">
              <i class="fas fa-envelope" style="color:var(--azul);width:20px;margin-top:2px"></i>
              <div><div style="font-size:0.75rem;color:var(--cinza-medio);text-transform:uppercase;letter-spacing:0.08em">E-mail</div>
              <div style="font-weight:600">${reg.email}</div></div>
            </div>
            <div style="display:flex;gap:12px">
              <i class="fab fa-whatsapp" style="color:var(--azul);width:20px;margin-top:2px"></i>
              <div><div style="font-size:0.75rem;color:var(--cinza-medio);text-transform:uppercase;letter-spacing:0.08em">WhatsApp</div>
              <div style="font-weight:600">${reg.phone}</div></div>
            </div>
            <div style="display:flex;gap:12px">
              <i class="fas fa-phone-alt" style="color:var(--azul);width:20px;margin-top:2px"></i>
              <div><div style="font-size:0.75rem;color:var(--cinza-medio);text-transform:uppercase;letter-spacing:0.08em">Contato Emergência</div>
              <div style="font-weight:600">${reg.emergency_contact} — ${reg.emergency_phone}</div></div>
            </div>
          </div>
        </div>
      </div>

      <!-- Status Alert -->
      ${reg.status === 'aguardando_pagamento' ? `
      <div class="alert alert-warning" style="margin-top:24px">
        <i class="fas fa-credit-card alert-icon"></i>
        <div><strong>Aguardando pagamento</strong><br>
        <span>Finalize seu pagamento para confirmar a vaga. Entre em contato via WhatsApp.</span></div>
      </div>` : ''}
      ${reg.status === 'confirmado' ? `
      <div class="alert alert-success" style="margin-top:24px">
        <i class="fas fa-check-circle alert-icon"></i>
        <div><strong>Inscrição confirmada!</strong><br>
        <span>Sua vaga está garantida. Nos vemos em ${daysLeft} dias!</span></div>
      </div>` : ''}

      <div style="display:flex;gap:12px;margin-top:24px;flex-wrap:wrap">
        <a href="https://wa.me/5511999999999?text=Olá!%20Sou%20${encodeURIComponent(reg.full_name)}%20e%20tenho%20uma%20dúvida%20sobre%20minha%20inscrição." target="_blank" class="btn btn-whatsapp">
          <i class="fab fa-whatsapp"></i> Falar com a Equipe
        </a>
        <button onclick="window.print()" class="btn btn-secondary btn-sm">
          <i class="fas fa-print"></i> Imprimir Comprovante
        </button>
      </div>
    </div>

    <!-- Tab: Checklist -->
    <div id="tab-checklist" class="tab-content" style="background:var(--branco);border-radius:0 0 var(--radius-lg) var(--radius-lg);padding:28px;box-shadow:var(--shadow-sm);margin-bottom:20px">
      <h3 style="font-size:1.1rem;color:var(--azul-escuro);margin-bottom:6px"><i class="fas fa-backpack" style="color:var(--verde)"></i> Lista de Itens Essenciais</h3>
      <p style="font-size:0.88rem;color:var(--grafite);margin-bottom:24px">Marque os itens que você já separou. Use como guia na noite anterior à atividade.</p>
      <div id="clientChecklist">
        ${whatToBring.map((item: string, idx: number) => `
        <div class="checklist-item" id="ci-${idx}" onclick="toggleClientCheck(${idx})">
          <input type="checkbox" id="cc-${idx}" onchange="toggleClientCheck(${idx})">
          <label for="cc-${idx}">${item.trim()}</label>
        </div>`).join('')}
      </div>
      <div style="margin-top:20px;padding:16px;background:rgba(57,102,68,0.08);border-radius:var(--radius-md);border-left:4px solid var(--verde)">
        <strong style="color:var(--verde);font-size:0.85rem"><i class="fas fa-lightbulb"></i> Dica dos guias:</strong>
        <p style="font-size:0.85rem;color:var(--grafite);margin-top:6px">"Prepare sua mochila na noite anterior. Coloque os itens mais pesados próximos às costas e os de acesso rápido nos bolsos laterais. Seu corpo vai agradecer!"</p>
      </div>
    </div>

    <!-- Tab: Location -->
    <div id="tab-location" class="tab-content" style="background:var(--branco);border-radius:0 0 var(--radius-lg) var(--radius-lg);padding:28px;box-shadow:var(--shadow-sm);margin-bottom:20px">
      <h3 style="font-size:1.1rem;color:var(--azul-escuro);margin-bottom:20px"><i class="fas fa-map-marked-alt" style="color:var(--verde)"></i> Ponto de Encontro</h3>
      <div style="background:var(--cinza-claro);border-radius:var(--radius-lg);height:280px;display:flex;align-items:center;justify-content:center;margin-bottom:20px;border:2px dashed var(--areia-light)">
        <div style="text-align:center;color:var(--cinza-medio)">
          <i class="fas fa-map" style="font-size:3rem;margin-bottom:12px"></i>
          <p style="font-size:0.9rem">Mapa interativo disponível<br>após confirmação da inscrição</p>
          <a href="https://maps.google.com" target="_blank" class="btn btn-secondary btn-sm" style="margin-top:12px"><i class="fas fa-external-link-alt"></i> Abrir no Google Maps</a>
        </div>
      </div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px">
        <div style="padding:16px;background:var(--cinza-claro);border-radius:var(--radius-md)">
          <div style="font-size:0.75rem;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;color:var(--grafite);margin-bottom:8px">Endereço de encontro</div>
          <div style="font-size:0.9rem;font-weight:600">${session?.location || 'A ser confirmado'}</div>
          <div style="font-size:0.82rem;color:var(--cinza-medio);margin-top:4px">Detalhes serão enviados por WhatsApp em D-2</div>
        </div>
        <div style="padding:16px;background:var(--cinza-claro);border-radius:var(--radius-md)">
          <div style="font-size:0.75rem;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;color:var(--grafite);margin-bottom:8px">Horário</div>
          <div style="font-size:0.9rem;font-weight:600">${session?.time || '07:00'} — Pontualidade obrigatória</div>
          <div style="font-size:0.82rem;color:var(--cinza-medio);margin-top:4px">Chegue 15 min antes para check-in</div>
        </div>
      </div>
    </div>

    <!-- Tab: Messages -->
    <div id="tab-messages" class="tab-content" style="background:var(--branco);border-radius:0 0 var(--radius-lg) var(--radius-lg);padding:28px;box-shadow:var(--shadow-sm);margin-bottom:20px">
      <h3 style="font-size:1.1rem;color:var(--azul-escuro);margin-bottom:6px"><i class="fas fa-bell" style="color:var(--verde)"></i> Comunicados da Equipe</h3>
      <p style="font-size:0.88rem;color:var(--grafite);margin-bottom:24px">Mensagens e atualizações importantes sobre sua sessão.</p>
      ${messages.length > 0 ? messages.map(m => `
        <div style="padding:16px;border-radius:var(--radius-md);background:var(--cinza-claro);margin-bottom:12px;border-left:4px solid var(--azul)">
          <div style="display:flex;justify-content:space-between;margin-bottom:8px">
            <span style="font-size:0.75rem;font-weight:700;text-transform:uppercase;color:var(--azul)">${m.type}</span>
            <span style="font-size:0.75rem;color:var(--cinza-medio)">${m.created_at}</span>
          </div>
          <p style="font-size:0.9rem">${m.message}</p>
        </div>`).join('') : `
      <div style="text-align:center;padding:40px;color:var(--cinza-medio)">
        <i class="fas fa-inbox" style="font-size:2.5rem;margin-bottom:12px;opacity:0.4"></i>
        <p>Nenhum comunicado por enquanto.</p>
        <p style="font-size:0.82rem">As mensagens da equipe aparecerão aqui e serão enviadas por WhatsApp.</p>
      </div>`}
    </div>

    <!-- WhatsApp CTA -->
    <div style="background:linear-gradient(135deg,#075E54,#128C7E);border-radius:var(--radius-lg);padding:24px;display:flex;align-items:center;gap:20px;flex-wrap:wrap">
      <div style="width:56px;height:56px;background:rgba(255,255,255,0.15);border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:1.6rem;color:white;flex-shrink:0">
        <i class="fab fa-whatsapp"></i>
      </div>
      <div style="flex:1">
        <div style="font-weight:700;color:white;margin-bottom:4px">Precisa de ajuda?</div>
        <div style="font-size:0.85rem;color:rgba(255,255,255,0.75)">Nossa equipe responde em até 1 hora via WhatsApp, de segunda a domingo.</div>
      </div>
      <a href="https://wa.me/5511999999999?text=Olá!%20Sou%20${encodeURIComponent(reg.full_name)},%20preciso%20de%20ajuda%20com%20minha%20inscrição." target="_blank" class="btn" style="background:white;color:#075E54;font-weight:700">
        <i class="fab fa-whatsapp"></i> Falar Agora
      </a>
    </div>
  </div>

  <a href="https://wa.me/5511999999999" target="_blank" class="whatsapp-float"><i class="fab fa-whatsapp"></i></a>
  <script src="/static/app.js"></script>
  <script>
    function showTab(id) {
      document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
      document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
      document.getElementById('tab-' + id).classList.add('active');
      event.target.classList.add('active');
    }
    function toggleClientCheck(idx) {
      const item = document.getElementById('ci-' + idx);
      const cb = document.getElementById('cc-' + idx);
      if (event.target !== cb) cb.checked = !cb.checked;
      item.classList.toggle('completed', cb.checked);
    }
  </script>
</body>
</html>`
}
