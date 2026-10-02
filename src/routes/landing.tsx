import { getTypeLabel, getDifficultyLabel, getStatusLabel } from '../lib/db'

interface LandingProps {
  sessions: any[]
  testimonials: any[]
  instructors: any[]
}

export function landingPage({ sessions, testimonials, instructors }: LandingProps): string {
  // Use demo data if DB not available
  if (!sessions || sessions.length === 0) {
    sessions = [
      { id: 1, name: 'Trilha do Mirante das Águias', type: 'trilha', difficulty: 'iniciante', date: '2026-04-05', time: '07:00', location: 'Serra da Canastra - MG', duration: '6 horas', max_spots: 15, price: 180, status: 'aberta', description: 'Uma jornada de 8km pelo coração da Serra da Canastra.' },
      { id: 2, name: 'Rapel das Cachoeiras', type: 'rapel', difficulty: 'intermediario', date: '2026-04-12', time: '08:00', location: 'Chapada dos Veadeiros - GO', duration: '5 horas', max_spots: 10, price: 250, status: 'quase_lotada', description: 'Descida técnica de 40m em cachoeira com piscina natural.' },
      { id: 3, name: 'Expedição Combo: Trilha + Rapel', type: 'combo', difficulty: 'intermediario', date: '2026-04-19', time: '06:30', location: 'Ibitipoca - MG', duration: '8 horas', max_spots: 8, price: 380, status: 'aberta', description: 'A experiência completa: 10km de trilha + rapel de 25m.' },
    ]
  }
  if (!testimonials || testimonials.length === 0) {
    testimonials = [
      { name: 'Mariana S.', text: 'Nunca pensei que conseguiria! A equipe me fez acreditar que era possível. O rapel foi a experiência mais intensa da minha vida — e já quero voltar!', rating: 5, session_type: 'rapel' },
      { name: 'Pedro L.', text: 'Profissionalismo impecável do início ao fim. Senti segurança em cada passo. A trilha do Mirante é simplesmente espetacular. Recomendo para toda a família.', rating: 5, session_type: 'trilha' },
      { name: 'Carla M.', text: 'Fiz a expedição combo e foi transformador. Carlos e Roberto são guias excepcionais. Saí de lá com mais confiança em mim mesma do que entrei.', rating: 5, session_type: 'combo' },
      { name: 'João V.', text: 'Levamos o time da empresa. Resultado: a melhor experiência de integração que já tivemos. Comunicação da equipe é perfeita.', rating: 5, session_type: 'trilha' },
      { name: 'Fernanda C.', text: 'Tinha muito medo de altura. O Roberto foi paciente, técnico e encorajador. Desci os 40 metros sorrindo. Isso não tem preço.', rating: 5, session_type: 'rapel' },
    ]
  }
  if (!instructors || instructors.length === 0) {
    instructors = [
      { id: 1, name: 'Carlos Montanha', experience_years: 12, certifications: 'ACMG Level 3, WFR', specialties: 'Trilhas técnicas, Rapel, Escalada', philosophy: 'Segurança não é uma limitação — é o que nos permite ir mais longe.', bio: 'Apaixonado por montanhas desde os 16 anos, liderou mais de 500 expedições com zero incidentes graves.' },
      { id: 2, name: 'Ana Trilheira', experience_years: 8, certifications: 'Guia IBAMA, WAFA', specialties: 'Ecoturismo, Trilhas longas, Flora e Fauna', philosophy: 'Cada trilha é única. Meu papel é garantir que você chegue ao fim transformado.', bio: 'Bióloga e guia certificada, combina conhecimento científico com amor pela natureza.' },
      { id: 3, name: 'Roberto Vértice', experience_years: 15, certifications: 'CBME, Resgate em Montanha', specialties: 'Rapel técnico, Escalada, Resgate vertical', philosophy: 'Vencer o medo da altura começa com confiar no equipamento — e em quem está ao seu lado.', bio: 'Ex-atleta de escalada, referência em segurança vertical na região.' },
    ]
  }

  const sessionsHtml = sessions.slice(0, 3).map(s => {
    const dateObj = new Date(s.date + 'T12:00:00')
    const dateStr = dateObj.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }).replace('.', '')
    const dayNum = dateObj.getDate()
    const monthStr = dateObj.toLocaleDateString('pt-BR', { month: 'short' }).replace('.', '').toUpperCase()
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
        <h3 style="font-size:1.05rem;margin-bottom:6px;color:var(--azul-escuro)">${s.name}</h3>
        <div style="display:flex;gap:16px;flex-wrap:wrap;font-size:0.82rem;color:var(--grafite)">
          <span><i class="fas fa-map-marker-alt" style="color:var(--verde)"></i> ${s.location}</span>
          <span><i class="fas fa-clock" style="color:var(--verde)"></i> ${s.time} • ${s.duration}</span>
          <span><i class="fas fa-users" style="color:var(--verde)"></i> ${s.max_spots} vagas</span>
        </div>
      </div>
      <div style="text-align:right;min-width:140px">
        <div class="card-price">R$ ${Number(s.price).toFixed(2).replace('.', ',')}<span>/pessoa</span></div>
        <a href="/sessao/${s.id}" class="btn btn-primary btn-sm" style="margin-top:10px">Ver Detalhes</a>
      </div>
    </div>`
  }).join('')

  const testimonialsHtml = testimonials.map(t => `
    <div class="testimonial-card">
      <div class="testimonial-stars">${'★'.repeat(t.rating)}${'☆'.repeat(5 - t.rating)}</div>
      <p class="testimonial-text">"${t.text}"</p>
      <div class="testimonial-author">
        <div class="testimonial-avatar">${t.name.charAt(0)}</div>
        <div>
          <div class="testimonial-name">${t.name}</div>
          <div class="testimonial-type">${getTypeLabel(t.session_type || 'trilha')} • Participante verificado</div>
        </div>
      </div>
    </div>`).join('')

  const instructorsHtml = instructors.map(i => `
    <div class="instructor-card">
      <div class="instructor-photo">
        <i class="fas fa-user"></i>
        <div class="instructor-badge">${i.experience_years}+ anos</div>
      </div>
      <div class="instructor-body">
        <h3 class="instructor-name">${i.name}</h3>
        <p class="instructor-exp"><i class="fas fa-mountain"></i> ${i.specialties || 'Especialista em aventura'}</p>
        <p class="instructor-bio">${i.bio || ''}</p>
        ${i.certifications ? `<div class="instructor-certs">${i.certifications.split(',').map((c: string) => `<span class="cert-tag">${c.trim()}</span>`).join('')}</div>` : ''}
        ${i.philosophy ? `<p class="instructor-philosophy"><i class="fas fa-quote-left" style="color:var(--amarelo);margin-right:8px;font-size:0.75rem"></i>${i.philosophy}</p>` : ''}
      </div>
    </div>`).join('')

  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <meta name="description" content="Rota Horizonte — Trilhas e Rapel com segurança e aventura na natureza. Reserve sua vaga e transforme sua vida!">
  <title>Rota Horizonte — Trilhas &amp; Rapel de Aventura</title>
  <link rel="stylesheet" href="/static/style.css">
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
  <link rel="preconnect" href="https://fonts.googleapis.com">
</head>
<body>

  <!-- NAVBAR -->
  <nav class="navbar transparent" id="navbar">
    <a href="/" class="nav-logo">
      <div class="logo-icon"><i class="fas fa-mountain"></i></div>
      <div class="logo-text">Rota<span> Horizonte</span></div>
    </a>
    <ul class="nav-links" id="navLinks">
      <li><a href="/#sessoes">Sessões</a></li>
      <li><a href="/#experiencia">Experiências</a></li>
      <li><a href="/#instrutores">Instrutores</a></li>
      <li><a href="/#depoimentos">Depoimentos</a></li>
      <li><a href="/#contato">Contato</a></li>
    </ul>
    <div style="display:flex;gap:10px;align-items:center">
      <a href="/admin" class="btn btn-outline btn-sm nav-cta" style="font-size:0.78rem;padding:6px 12px;opacity:0.7"><i class="fas fa-lock"></i></a>
      <a href="/sessoes" class="btn btn-primary btn-sm nav-cta"><i class="fas fa-compass"></i> Ver Sessões</a>
    </div>
    <div class="hamburger" id="hamburger" onclick="toggleNav()">
      <span></span><span></span><span></span>
    </div>
  </nav>

  <!-- HERO -->
  <section class="hero" id="inicio">
    <div class="hero-bg"></div>
    <div class="hero-mountain">
      <svg viewBox="0 0 1440 400" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
        <path d="M0,400 L0,280 L120,180 L240,220 L360,120 L480,200 L600,80 L720,160 L840,60 L960,140 L1080,100 L1200,180 L1320,140 L1440,200 L1440,400 Z" fill="white"/>
        <path d="M0,400 L0,320 L180,240 L360,280 L540,200 L720,240 L900,180 L1080,220 L1260,200 L1440,240 L1440,400 Z" fill="white" opacity="0.4"/>
      </svg>
    </div>
    <div class="hero-particles"></div>

    <div class="hero-content">
      <div>
        <div class="hero-badge animate-fade-up">
          <i class="fas fa-map-marked-alt"></i> Turismo de Aventura Premium
        </div>
        <h1 class="hero-title animate-fade-up delay-1">
          Onde o<br><span class="highlight">Horizonte</span><br>te transforma
        </h1>
        <p class="hero-subtitle animate-fade-up delay-2">
          Trilhas e rapel com a mais alta segurança técnica. 
          Cada expedição é uma conquista pessoal que você vai carregar para sempre.
        </p>
        <div class="hero-cta-group animate-fade-up delay-3">
          <a href="/sessoes" class="btn btn-primary btn-lg">
            <i class="fas fa-compass"></i> Explorar Sessões
          </a>
          <a href="https://wa.me/5511999999999?text=Olá!%20Quero%20saber%20mais%20sobre%20as%20experiências%20da%20Rota%20Horizonte" target="_blank" class="btn btn-whatsapp btn-lg">
            <i class="fab fa-whatsapp"></i> Falar no WhatsApp
          </a>
        </div>
        <div class="hero-stats animate-fade-up delay-4">
          <div class="hero-stat"><div class="number">500+</div><div class="label">Expedições realizadas</div></div>
          <div class="hero-stat"><div class="number">2.000+</div><div class="label">Aventureiros guiados</div></div>
          <div class="hero-stat"><div class="number">0</div><div class="label">Incidentes graves</div></div>
        </div>
      </div>

      <div class="hero-visual">
        <div class="hero-cards">
          <div class="hero-card animate-fade-up delay-1">
            <div class="hero-card-icon"><i class="fas fa-hiking"></i></div>
            <h4>Trilhas</h4>
            <p>De iniciante ao avançado, com guias certificados</p>
          </div>
          <div class="hero-card animate-fade-up delay-2">
            <div class="hero-card-icon"><i class="fas fa-anchor"></i></div>
            <h4>Rapel</h4>
            <p>Descidas técnicas com equipamento profissional</p>
          </div>
          <div class="hero-card featured animate-fade-up delay-3">
            <div class="hero-card-icon" style="background:rgba(246,190,66,0.2);color:var(--amarelo)"><i class="fas fa-shield-alt"></i></div>
            <h4 style="color:var(--amarelo)">Segurança em Primeiro Lugar</h4>
            <p>Equipe certificada, equipamentos revisados e plano de contingência para cada sessão</p>
          </div>
        </div>
      </div>
    </div>
    <div style="position:absolute;bottom:32px;left:50%;transform:translateX(-50%);z-index:2;animation:pulse-whatsapp 2s infinite">
      <a href="#sessoes" style="color:rgba(255,255,255,0.5);font-size:1.3rem">
        <i class="fas fa-chevron-down"></i>
      </a>
    </div>
  </section>

  <!-- EXPERIENCE OVERVIEW -->
  <section class="section" id="experiencia" style="background:var(--branco)">
    <div class="container">
      <div class="section-header">
        <div class="section-badge"><i class="fas fa-mountain"></i> Nossa Proposta</div>
        <h2 class="section-title">Mais do que uma atividade.<br>Uma <em style="color:var(--verde);font-style:normal">transformação</em>.</h2>
        <p class="section-subtitle">Na Rota Horizonte, cada saída é cuidadosamente planejada para que você vivencie a natureza com máxima segurança e impacto emocional.</p>
      </div>

      <div class="grid-3" style="margin-bottom:60px">
        <div style="text-align:center;padding:32px 24px">
          <div style="width:80px;height:80px;background:linear-gradient(135deg,var(--azul),var(--verde));border-radius:50%;display:flex;align-items:center;justify-content:center;margin:0 auto 20px;font-size:2rem;color:white">
            <i class="fas fa-hiking"></i>
          </div>
          <h3 style="font-size:1.2rem;margin-bottom:12px">Trilhas de Aventura</h3>
          <p style="color:var(--grafite);font-size:0.92rem;line-height:1.7">Percursos de 4 a 15km em ambientes naturais deslumbrantes. Biomas variados, fauna exuberante e vistas que ficam na memória para sempre.</p>
          <div style="display:flex;justify-content:center;gap:8px;margin-top:16px;flex-wrap:wrap">
            <span class="cert-tag">Iniciante</span><span class="cert-tag">Intermediário</span><span class="cert-tag">Avançado</span>
          </div>
        </div>
        <div style="text-align:center;padding:32px 24px;background:linear-gradient(135deg,var(--azul-escuro),var(--verde-escuro));border-radius:var(--radius-lg);color:white">
          <div style="width:80px;height:80px;background:var(--amarelo);border-radius:50%;display:flex;align-items:center;justify-content:center;margin:0 auto 20px;font-size:2rem;color:var(--azul-escuro)">
            <i class="fas fa-anchor"></i>
          </div>
          <h3 style="font-size:1.2rem;margin-bottom:12px;color:white">Rapel Técnico</h3>
          <p style="color:rgba(255,255,255,0.75);font-size:0.92rem;line-height:1.7">Descidas de 15 a 60 metros em paredões rochosos e cachoeiras. Equipamento profissional, briefing de segurança e acompanhamento individual.</p>
          <div style="display:flex;justify-content:center;gap:8px;margin-top:16px;flex-wrap:wrap">
            <span style="background:rgba(246,190,66,0.2);color:var(--amarelo);font-size:0.72rem;font-weight:600;padding:3px 10px;border-radius:100px">Iniciante +</span>
            <span style="background:rgba(246,190,66,0.2);color:var(--amarelo);font-size:0.72rem;font-weight:600;padding:3px 10px;border-radius:100px">Controle Total</span>
          </div>
        </div>
        <div style="text-align:center;padding:32px 24px">
          <div style="width:80px;height:80px;background:linear-gradient(135deg,var(--amarelo),var(--areia));border-radius:50%;display:flex;align-items:center;justify-content:center;margin:0 auto 20px;font-size:2rem;color:var(--azul-escuro)">
            <i class="fas fa-route"></i>
          </div>
          <h3 style="font-size:1.2rem;margin-bottom:12px">Combo Completo</h3>
          <p style="color:var(--grafite);font-size:0.92rem;line-height:1.7">A experiência definitiva. Trilha técnica + rapel em um único dia épico. Para quem quer viver tudo de uma vez e sair completamente transformado.</p>
          <div style="display:flex;justify-content:center;gap:8px;margin-top:16px;flex-wrap:wrap">
            <span class="cert-tag">Full Day</span><span class="cert-tag">Máxima Adrenalina</span>
          </div>
        </div>
      </div>

      <!-- Why Us -->
      <div style="background:var(--cinza-claro);padding:48px;border-radius:var(--radius-xl)" id="porque">
        <div style="text-align:center;margin-bottom:40px">
          <div class="section-badge gold"><i class="fas fa-star"></i> Nossos Diferenciais</div>
          <h2 class="section-title" style="margin-bottom:0">Por que escolher a Rota Horizonte?</h2>
        </div>
        <div class="grid-2">
          <div class="why-item">
            <div class="why-icon"><i class="fas fa-certificate"></i></div>
            <div class="why-content">
              <h4>Guias certificados e experientes</h4>
              <p>Nossa equipe tem certificações técnicas nacionais e internacionais, com mais de 1.000 horas combinadas de instrução em campo.</p>
            </div>
          </div>
          <div class="why-item">
            <div class="why-icon"><i class="fas fa-shield-alt"></i></div>
            <div class="why-content">
              <h4>Seguro de aventura incluso</h4>
              <p>Toda sessão inclui cobertura de acidente para todos os participantes. Sua segurança é nossa responsabilidade, não sua preocupação.</p>
            </div>
          </div>
          <div class="why-item">
            <div class="why-icon"><i class="fas fa-users-cog"></i></div>
            <div class="why-content">
              <h4>Grupos pequenos e personalizados</h4>
              <p>Máximo de 15 pessoas por sessão para garantir atenção individual e uma experiência mais íntima e significativa.</p>
            </div>
          </div>
          <div class="why-item">
            <div class="why-icon"><i class="fas fa-map-signs"></i></div>
            <div class="why-content">
              <h4>Plano B sempre definido</h4>
              <p>Cada sessão tem um plano de contingência documentado. Nenhuma saída acontece sem alternativa segura para imprevistos.</p>
            </div>
          </div>
          <div class="why-item">
            <div class="why-icon"><i class="fas fa-tools"></i></div>
            <div class="why-content">
              <h4>Equipamentos revisados</h4>
              <p>Capacetes, cordas e arneses revisados antes de cada sessão, dentro do prazo de vida útil e normas técnicas vigentes.</p>
            </div>
          </div>
          <div class="why-item">
            <div class="why-icon"><i class="fas fa-comment-dots"></i></div>
            <div class="why-content">
              <h4>Comunicação clara e humanizada</h4>
              <p>Do agendamento ao pós-evento, você recebe informações precisas e suporte via WhatsApp. Sem surpresas desagradáveis.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- SESSIONS CALENDAR -->
  <section class="section bg-cinza" id="sessoes">
    <div class="container">
      <div class="section-header">
        <div class="section-badge"><i class="fas fa-calendar-alt"></i> Agenda 2026</div>
        <h2 class="section-title">Próximas Sessões</h2>
        <p class="section-subtitle">Reserve sua vaga com antecedência. As turmas se enchem rápido!</p>
      </div>
      ${sessionsHtml}
      <div style="text-align:center;margin-top:32px">
        <a href="/sessoes" class="btn btn-secondary btn-lg">
          <i class="fas fa-calendar"></i> Ver Calendário Completo
        </a>
      </div>
    </div>
  </section>

  <!-- INSTRUCTORS -->
  <section class="section" id="instrutores" style="background:var(--branco)">
    <div class="container">
      <div class="section-header">
        <div class="section-badge"><i class="fas fa-user-shield"></i> Equipe Técnica</div>
        <h2 class="section-title">Quem vai estar ao seu lado</h2>
        <p class="section-subtitle">Nossa equipe é nossa maior credencial. Guias apaixonados e rigorosamente preparados.</p>
      </div>
      <div class="grid-3">${instructorsHtml}</div>
    </div>
  </section>

  <!-- TESTIMONIALS -->
  <section class="testimonials-section" id="depoimentos">
    <div class="container">
      <div class="section-header">
        <div class="section-badge gold"><i class="fas fa-heart"></i> Depoimentos</div>
        <h2 class="section-title white">O que dizem nossos aventureiros</h2>
        <p class="section-subtitle white">Histórias reais de pessoas que escolheram sair da zona de conforto.</p>
      </div>
      <div class="grid-3">${testimonialsHtml}</div>
    </div>
  </section>

  <!-- TRUST STRIP -->
  <section style="background:var(--amarelo);padding:24px 5%">
    <div class="container" style="display:flex;justify-content:center;gap:40px;flex-wrap:wrap;align-items:center">
      <div style="display:flex;align-items:center;gap:12px;color:var(--azul-escuro)">
        <i class="fas fa-shield-alt" style="font-size:1.4rem"></i>
        <div><div style="font-weight:700;font-size:0.9rem">100% Seguro</div><div style="font-size:0.75rem;opacity:0.7">Equipe certificada</div></div>
      </div>
      <div style="display:flex;align-items:center;gap:12px;color:var(--azul-escuro)">
        <i class="fas fa-undo" style="font-size:1.4rem"></i>
        <div><div style="font-weight:700;font-size:0.9rem">Reembolso Garantido</div><div style="font-size:0.75rem;opacity:0.7">Cancelamento até D-3</div></div>
      </div>
      <div style="display:flex;align-items:center;gap:12px;color:var(--azul-escuro)">
        <i class="fas fa-star" style="font-size:1.4rem"></i>
        <div><div style="font-weight:700;font-size:0.9rem">5.0 de avaliação</div><div style="font-size:0.75rem;opacity:0.7">+200 avaliações</div></div>
      </div>
      <div style="display:flex;align-items:center;gap:12px;color:var(--azul-escuro)">
        <i class="fab fa-whatsapp" style="font-size:1.4rem"></i>
        <div><div style="font-weight:700;font-size:0.9rem">Suporte via WhatsApp</div><div style="font-size:0.75rem;opacity:0.7">Resposta em até 1h</div></div>
      </div>
    </div>
  </section>

  <!-- CTA FINAL -->
  <section class="cta-section" id="contato">
    <div class="container">
      <div class="section-badge gold" style="margin:0 auto 20px"><i class="fas fa-bolt"></i> Pronto para ir?</div>
      <h2 class="section-title white" style="font-size:clamp(2rem,5vw,3.5rem);margin-bottom:16px">
        Sua próxima conquista<br>começa aqui.
      </h2>
      <p class="section-subtitle white" style="margin-bottom:40px">Não deixe o medo decidir por você. Reserve sua vaga agora e faça parte da família Rota Horizonte.</p>
      <div style="display:flex;gap:16px;justify-content:center;flex-wrap:wrap">
        <a href="/sessoes" class="btn btn-primary btn-lg"><i class="fas fa-compass"></i> Explorar Sessões</a>
        <a href="https://wa.me/5511999999999?text=Quero%20saber%20mais%20sobre%20as%20expedições%20da%20Rota%20Horizonte!" target="_blank" class="btn btn-whatsapp btn-lg"><i class="fab fa-whatsapp"></i> Falar Agora no WhatsApp</a>
      </div>
      <div style="margin-top:40px;padding:24px 32px;background:rgba(255,255,255,0.07);border:1px solid rgba(255,255,255,0.15);border-radius:var(--radius-lg);display:inline-block">
        <div style="display:flex;gap:8px;justify-content:center;flex-wrap:wrap;font-size:0.85rem;color:rgba(255,255,255,0.7)">
          <span><i class="fas fa-map-marker-alt"></i> Serra da Canastra • Chapada dos Veadeiros • Ibitipoca</span>
          <span>•</span>
          <span><i class="fas fa-envelope"></i> contato@rotahorizonte.com.br</span>
        </div>
      </div>
    </div>
  </section>

  <!-- FOOTER -->
  <footer>
    <div class="footer-grid">
      <div class="footer-brand">
        <h3><i class="fas fa-mountain" style="color:var(--amarelo);margin-right:8px"></i>Rota Horizonte</h3>
        <p>Há mais de 8 anos levando pessoas além dos seus limites com segurança, técnica e paixão. Cada trilha é uma nova história. Venha escrever a sua.</p>
        <div class="social-links">
          <a href="#" class="social-link"><i class="fab fa-instagram"></i></a>
          <a href="#" class="social-link"><i class="fab fa-facebook"></i></a>
          <a href="#" class="social-link"><i class="fab fa-youtube"></i></a>
          <a href="#" class="social-link"><i class="fab fa-tiktok"></i></a>
        </div>
      </div>
      <div>
        <div class="footer-heading">Experiências</div>
        <ul class="footer-links">
          <li><a href="/sessoes?tipo=trilha">Trilhas</a></li>
          <li><a href="/sessoes?tipo=rapel">Rapel</a></li>
          <li><a href="/sessoes?tipo=combo">Combo</a></li>
          <li><a href="/sessoes">Calendário Completo</a></li>
        </ul>
      </div>
      <div>
        <div class="footer-heading">Empresa</div>
        <ul class="footer-links">
          <li><a href="/#instrutores">Nossa Equipe</a></li>
          <li><a href="/#porque">Por que a Rota</a></li>
          <li><a href="/#depoimentos">Depoimentos</a></li>
          <li><a href="/admin">Área Restrita</a></li>
        </ul>
      </div>
      <div>
        <div class="footer-heading">Contato</div>
        <ul class="footer-links">
          <li><a href="https://wa.me/5511999999999" target="_blank"><i class="fab fa-whatsapp"></i> WhatsApp</a></li>
          <li><a href="mailto:contato@rotahorizonte.com.br"><i class="fas fa-envelope"></i> E-mail</a></li>
          <li><a href="#"><i class="fab fa-instagram"></i> Instagram</a></li>
        </ul>
      </div>
    </div>
    <hr class="footer-divider">
    <div class="footer-bottom">
      <p>© 2026 Rota Horizonte. Todos os direitos reservados.</p>
      <p style="font-size:0.78rem;color:rgba(255,255,255,0.35)">Turismo de Aventura com Responsabilidade</p>
    </div>
  </footer>

  <a href="https://wa.me/5511999999999?text=Olá!%20Tenho%20interesse%20nas%20experiências%20da%20Rota%20Horizonte." target="_blank" class="whatsapp-float" title="Falar no WhatsApp">
    <i class="fab fa-whatsapp"></i>
  </a>

  <script src="/static/app.js"></script>
</body>
</html>`
}
