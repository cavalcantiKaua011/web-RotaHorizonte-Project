import { getTypeLabel, getDifficultyLabel } from '../lib/db'

interface InscricaoProps {
  session: any
  step: number
  error: string | null
  success: boolean
  token: string
}

export function inscricaoPage({ session, step, error, success, token }: InscricaoProps): string {
  const demoSession = session || {
    id: 1, name: 'Trilha do Mirante das Águias', type: 'trilha', difficulty: 'iniciante',
    date: '2026-04-05', time: '07:00', location: 'Serra da Canastra - MG',
    duration: '6 horas', price: 180, max_spots: 15
  }
  const dateObj = new Date(demoSession.date + 'T12:00:00')
  const dateStr = dateObj.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })

  if (success) {
    return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
  <title>Inscrição Confirmada — Rota Horizonte</title>
  <link rel="stylesheet" href="/static/style.css">
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
</head>
<body style="background:var(--cinza-claro)">
  <nav class="navbar solid"><a href="/" class="nav-logo"><div class="logo-icon"><i class="fas fa-mountain"></i></div><div class="logo-text">Rota<span> Horizonte</span></div></a></nav>
  <div style="padding-top:72px;min-height:100vh;display:flex;align-items:center;justify-content:center;padding:120px 5%">
    <div style="max-width:560px;width:100%;text-align:center">
      <div style="width:100px;height:100px;background:linear-gradient(135deg,var(--verde),var(--verde-claro));border-radius:50%;display:flex;align-items:center;justify-content:center;margin:0 auto 28px;font-size:2.5rem;color:white;box-shadow:0 8px 32px rgba(57,102,68,0.35)">
        <i class="fas fa-check"></i>
      </div>
      <h1 style="font-size:2rem;color:var(--azul-escuro);margin-bottom:12px">Inscrição Recebida! 🎉</h1>
      <p style="color:var(--grafite);margin-bottom:32px;line-height:1.7">Sua inscrição para <strong>${demoSession.name}</strong> foi registrada com sucesso! Em breve você receberá uma confirmação via WhatsApp e e-mail.</p>
      
      <div style="background:var(--branco);border-radius:var(--radius-lg);padding:24px;box-shadow:var(--shadow-md);margin-bottom:24px;text-align:left">
        <h3 style="font-size:1rem;color:var(--azul-escuro);margin-bottom:16px">Próximos passos:</h3>
        <div style="display:flex;flex-direction:column;gap:12px">
          <div style="display:flex;gap:12px;align-items:center">
            <div style="width:32px;height:32px;min-width:32px;background:var(--azul);border-radius:50%;display:flex;align-items:center;justify-content:center;color:white;font-size:0.8rem;font-weight:700">1</div>
            <span style="font-size:0.9rem">Aguarde a confirmação de pagamento (se aplicável)</span>
          </div>
          <div style="display:flex;gap:12px;align-items:center">
            <div style="width:32px;height:32px;min-width:32px;background:var(--verde);border-radius:50%;display:flex;align-items:center;justify-content:center;color:white;font-size:0.8rem;font-weight:700">2</div>
            <span style="font-size:0.9rem">Você receberá instruções completas por WhatsApp</span>
          </div>
          <div style="display:flex;gap:12px;align-items:center">
            <div style="width:32px;height:32px;min-width:32px;background:var(--amarelo);border-radius:50%;display:flex;align-items:center;justify-content:center;color:var(--azul-escuro);font-size:0.8rem;font-weight:700">3</div>
            <span style="font-size:0.9rem">Acesse sua área pessoal para acompanhar tudo</span>
          </div>
        </div>
      </div>
      
      ${token ? `<a href="/minha-area/${token}" class="btn btn-primary btn-lg btn-full" style="justify-content:center;margin-bottom:12px;display:flex"><i class="fas fa-user"></i> Acessar Minha Área</a>` : ''}
      <a href="https://wa.me/5511999999999" target="_blank" class="btn btn-whatsapp btn-full" style="justify-content:center;display:flex"><i class="fab fa-whatsapp"></i> Falar no WhatsApp</a>
      <a href="/" style="display:block;margin-top:20px;color:var(--grafite);font-size:0.88rem"><i class="fas fa-arrow-left"></i> Voltar para o início</a>
    </div>
  </div>
</body>
</html>`
  }

  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
  <title>Inscrição — ${demoSession.name} — Rota Horizonte</title>
  <link rel="stylesheet" href="/static/style.css">
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
</head>
<body style="background:var(--cinza-claro)">
  <nav class="navbar solid">
    <a href="/" class="nav-logo"><div class="logo-icon"><i class="fas fa-mountain"></i></div><div class="logo-text">Rota<span> Horizonte</span></div></a>
    <a href="/sessoes" style="color:rgba(255,255,255,0.7);font-size:0.88rem"><i class="fas fa-arrow-left"></i> Voltar</a>
  </nav>
  <div style="padding-top:72px;min-height:100vh">
    <div style="background:linear-gradient(135deg,var(--azul-escuro),var(--verde-escuro));padding:40px 5% 60px">
      <div class="container">
        <div style="display:flex;gap:12px;align-items:center;margin-bottom:16px;flex-wrap:wrap">
          <span class="card-tag tag-${demoSession.type}">${getTypeLabel(demoSession.type)}</span>
          <span class="difficulty difficulty-${demoSession.difficulty}"><span class="diff-dot"></span>${getDifficultyLabel(demoSession.difficulty)}</span>
        </div>
        <h1 style="color:white;font-size:clamp(1.5rem,3vw,2.2rem);margin-bottom:8px">${demoSession.name}</h1>
        <div style="display:flex;gap:20px;color:rgba(255,255,255,0.7);font-size:0.88rem;flex-wrap:wrap">
          <span><i class="fas fa-calendar" style="color:var(--amarelo)"></i> ${dateStr} às ${demoSession.time}</span>
          <span><i class="fas fa-map-marker-alt" style="color:var(--amarelo)"></i> ${demoSession.location}</span>
          <span><i class="fas fa-hourglass-half" style="color:var(--amarelo)"></i> ${demoSession.duration}</span>
          <span><i class="fas fa-tag" style="color:var(--amarelo)"></i> R$ ${Number(demoSession.price).toFixed(2).replace('.', ',')}/pessoa</span>
        </div>
      </div>
    </div>

    <div class="container" style="padding:0 5%;margin-top:-30px;padding-bottom:60px">
      <div style="max-width:680px;margin:0 auto">
        <!-- Progress -->
        <div style="background:var(--branco);border-radius:var(--radius-lg);padding:24px 28px;box-shadow:var(--shadow-md);margin-bottom:24px">
          <div class="step-progress">
            <div class="step done"><div class="step-circle"><i class="fas fa-check" style="font-size:0.75rem"></i></div><div class="step-label">Sessão</div></div>
            <div class="step-line done"></div>
            <div class="step active"><div class="step-circle">2</div><div class="step-label">Seus dados</div></div>
            <div class="step-line"></div>
            <div class="step"><div class="step-circle">3</div><div class="step-label">Confirmação</div></div>
          </div>
        </div>

        ${error ? `<div class="alert alert-error" style="margin-bottom:20px"><i class="fas fa-exclamation-circle alert-icon"></i><div><strong>Atenção:</strong> ${error}</div></div>` : ''}

        <form action="/inscrever/${demoSession.id}" method="POST" id="inscricaoForm" onsubmit="return validateForm(event)">
          <!-- Personal Data -->
          <div style="background:var(--branco);border-radius:var(--radius-lg);padding:28px;box-shadow:var(--shadow-sm);margin-bottom:20px">
            <h3 style="font-size:1rem;color:var(--azul-escuro);margin-bottom:20px;display:flex;align-items:center;gap:10px">
              <span style="width:28px;height:28px;background:var(--azul);border-radius:50%;display:inline-flex;align-items:center;justify-content:center;color:white;font-size:0.75rem;font-weight:700">1</span>
              Dados Pessoais
            </h3>
            <div class="form-row">
              <div class="form-group" style="grid-column:span 2">
                <label class="form-label">Nome completo <span class="required">*</span></label>
                <input type="text" name="full_name" class="form-input" placeholder="Seu nome completo" required>
              </div>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label class="form-label">E-mail <span class="required">*</span></label>
                <input type="email" name="email" class="form-input" placeholder="seu@email.com" required>
              </div>
              <div class="form-group">
                <label class="form-label">Celular / WhatsApp <span class="required">*</span></label>
                <input type="tel" name="phone" class="form-input" placeholder="(11) 99999-9999" required id="phoneInput">
              </div>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label class="form-label">CPF <span class="required">*</span></label>
                <input type="text" name="cpf" class="form-input" placeholder="000.000.000-00" maxlength="14" id="cpfInput" required>
              </div>
              <div class="form-group">
                <label class="form-label">Data de Nascimento</label>
                <input type="date" name="birth_date" class="form-input">
              </div>
            </div>
          </div>

          <!-- Emergency Contact -->
          <div style="background:var(--branco);border-radius:var(--radius-lg);padding:28px;box-shadow:var(--shadow-sm);margin-bottom:20px">
            <h3 style="font-size:1rem;color:var(--azul-escuro);margin-bottom:20px;display:flex;align-items:center;gap:10px">
              <span style="width:28px;height:28px;background:var(--verde);border-radius:50%;display:inline-flex;align-items:center;justify-content:center;color:white;font-size:0.75rem;font-weight:700">2</span>
              Contato de Emergência <span style="font-size:0.8rem;font-weight:400;color:var(--cinza-medio);margin-left:4px">(obrigatório)</span>
            </h3>
            <div class="form-row">
              <div class="form-group">
                <label class="form-label">Nome do contato <span class="required">*</span></label>
                <input type="text" name="emergency_contact" class="form-input" placeholder="Nome completo" required>
              </div>
              <div class="form-group">
                <label class="form-label">Telefone do contato <span class="required">*</span></label>
                <input type="tel" name="emergency_phone" class="form-input" placeholder="(11) 99999-9999" required>
              </div>
            </div>
          </div>

          <!-- Health & Experience -->
          <div style="background:var(--branco);border-radius:var(--radius-lg);padding:28px;box-shadow:var(--shadow-sm);margin-bottom:20px">
            <h3 style="font-size:1rem;color:var(--azul-escuro);margin-bottom:20px;display:flex;align-items:center;gap:10px">
              <span style="width:28px;height:28px;background:var(--amarelo);border-radius:50%;display:inline-flex;align-items:center;justify-content:center;color:var(--azul-escuro);font-size:0.75rem;font-weight:700">3</span>
              Saúde e Experiência <span style="font-size:0.8rem;font-weight:400;color:var(--cinza-medio);margin-left:4px">(opcional)</span>
            </h3>
            <div class="form-group">
              <label class="form-label">Experiência anterior em trilhas/rapel</label>
              <select name="previous_experience" class="form-select">
                <option value="">Selecione...</option>
                <option value="nenhuma">Nunca fiz antes</option>
                <option value="basica">Algumas trilhas fáceis</option>
                <option value="intermediaria">Experiência regular</option>
                <option value="avancada">Experiência avançada</option>
              </select>
            </div>
            <div class="form-group">
              <label class="form-label">Restrições físicas ou de saúde</label>
              <textarea name="physical_restrictions" class="form-textarea" placeholder="Informe condições físicas, limitações ou alergias que os guias devem saber (deixe em branco se não houver)"></textarea>
            </div>
            <div class="form-group">
              <label class="form-label">Observações adicionais</label>
              <textarea name="notes" class="form-textarea" placeholder="Alguma informação extra que gostaria de compartilhar com a equipe?" style="min-height:80px"></textarea>
            </div>
          </div>

          <!-- Legal Acceptances -->
          <div style="background:rgba(27,58,92,0.04);border:2px solid rgba(27,58,92,0.12);border-radius:var(--radius-lg);padding:28px;margin-bottom:24px">
            <h3 style="font-size:1rem;color:var(--azul-escuro);margin-bottom:6px;display:flex;align-items:center;gap:10px">
              <i class="fas fa-file-signature" style="color:var(--azul)"></i> Termos e Aceites Obrigatórios
            </h3>
            <p style="font-size:0.82rem;color:var(--grafite);margin-bottom:20px">Leia e aceite todos os termos abaixo para prosseguir com a inscrição.</p>
            
            <div style="display:flex;flex-direction:column;gap:10px">
              <label class="form-check required-check">
                <input type="checkbox" name="accepted_risk" value="1" required>
                <div class="check-label">
                  <strong>Ciência do risco da atividade</strong> <span class="check-required-mark">Obrigatório</span><br>
                  <span style="color:var(--grafite)">Estou ciente de que trilhas e rapel são atividades de aventura que envolvem riscos físicos, e que mesmo com todos os cuidados de segurança, acidentes podem ocorrer.</span>
                </div>
              </label>
              <label class="form-check required-check">
                <input type="checkbox" name="accepted_terms" value="1" required>
                <div class="check-label">
                  <strong>Termo de responsabilidade</strong> <span class="check-required-mark">Obrigatório</span><br>
                  <span style="color:var(--grafite)">Li e aceito o <a href="#" target="_blank">Termo de Responsabilidade</a> da Rota Horizonte, eximindo a empresa de responsabilidade por acidentes decorrentes de negligência própria.</span>
                </div>
              </label>
              <label class="form-check required-check">
                <input type="checkbox" name="accepted_cancellation" value="1" required>
                <div class="check-label">
                  <strong>Política de cancelamento</strong> <span class="check-required-mark">Obrigatório</span><br>
                  <span style="color:var(--grafite)">Compreendo a <a href="#" target="_blank">Política de Cancelamento</a>: reembolso integral até D-3, 50% em D-2 e D-1, sem reembolso no dia da atividade.</span>
                </div>
              </label>
              <label class="form-check">
                <input type="checkbox" name="accepted_image" value="1">
                <div class="check-label">
                  <strong>Autorização de uso de imagem</strong><br>
                  <span style="color:var(--grafite)">Autorizo a Rota Horizonte a utilizar fotos e vídeos da atividade para fins de divulgação nas redes sociais e site da empresa.</span>
                </div>
              </label>
            </div>
          </div>

          <!-- Summary -->
          <div style="background:linear-gradient(135deg,var(--azul-escuro),var(--verde-escuro));border-radius:var(--radius-lg);padding:24px;margin-bottom:20px;color:white">
            <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:12px">
              <div>
                <div style="font-size:0.78rem;text-transform:uppercase;letter-spacing:0.1em;color:rgba(255,255,255,0.6);margin-bottom:4px">Você está se inscrevendo em</div>
                <div style="font-weight:700;font-size:1rem">${demoSession.name}</div>
                <div style="font-size:0.85rem;color:rgba(255,255,255,0.7);margin-top:4px">${dateStr} • ${demoSession.location}</div>
              </div>
              <div style="text-align:right">
                <div style="font-size:0.78rem;color:rgba(255,255,255,0.6)">Valor</div>
                <div style="font-size:2rem;font-weight:800;color:var(--amarelo)">R$ ${Number(demoSession.price).toFixed(2).replace('.', ',')}</div>
              </div>
            </div>
          </div>

          <button type="submit" class="btn btn-primary btn-full btn-lg" id="submitBtn">
            <i class="fas fa-check-circle"></i> Confirmar Inscrição
          </button>
          <p style="text-align:center;font-size:0.78rem;color:var(--cinza-medio);margin-top:12px">
            <i class="fas fa-lock"></i> Seus dados são protegidos e nunca serão compartilhados com terceiros
          </p>
        </form>
      </div>
    </div>
  </div>

  <script src="/static/app.js"></script>
  <script>
    // CPF mask
    document.getElementById('cpfInput').addEventListener('input', function(e) {
      let v = e.target.value.replace(/\D/g,'');
      v = v.replace(/(\d{3})(\d)/,'$1.$2');
      v = v.replace(/(\d{3})\.(\d{3})(\d)/,'$1.$2.$3');
      v = v.replace(/(\d{3})\.(\d{3})\.(\d{3})(\d)/,'$1.$2.$3-$4');
      e.target.value = v;
    });
    // Phone mask
    document.getElementById('phoneInput').addEventListener('input', function(e) {
      let v = e.target.value.replace(/\D/g,'');
      v = v.replace(/^(\d{2})(\d)/,'($1) $2');
      v = v.replace(/(\d{5})(\d)/,'$1-$2');
      e.target.value = v.substring(0,15);
    });
    function validateForm(e) {
      const required = document.querySelectorAll('[required]');
      let valid = true;
      required.forEach(f => {
        if (f.type === 'checkbox' && !f.checked) { valid = false; f.closest('.form-check').style.borderColor = '#EF4444'; }
        else if (f.type !== 'checkbox' && !f.value.trim()) { valid = false; f.style.borderColor = '#EF4444'; }
      });
      if (!valid) { e.preventDefault(); window.scrollTo(0,0); alert('Por favor, preencha todos os campos obrigatórios e aceite os termos.'); }
      else { document.getElementById('submitBtn').innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processando...'; document.getElementById('submitBtn').disabled = true; }
      return valid;
    }
  </script>
</body>
</html>`
}
