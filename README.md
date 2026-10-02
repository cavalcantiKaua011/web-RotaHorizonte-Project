# 🏔️ Rota Horizonte — Sistema Web Completo

## Visão Geral
Plataforma integrada de turismo de aventura (trilhas e rapel) com foco em alta conversão, gestão operacional e comunicação automatizada.

**Status:** ✅ Ativo e funcional  
**Stack:** Hono + TypeScript + Cloudflare Pages + Cloudflare D1

---

## 🌐 URLs do Sistema

| Página | Rota | Descrição |
|--------|------|-----------|
| Landing Page | `/` | Página principal de conversão |
| Sessões | `/sessoes` | Calendário completo com filtros |
| Detalhe de Sessão | `/sessao/:id` | Página completa da experiência |
| Inscrição | `/inscrever/:sessionId` | Formulário de inscrição |
| Área do Cliente | `/minha-area/:token` | Painel individual do participante |
| Painel Admin | `/admin` | Dashboard administrativo |
| Admin > Sessões | `/admin/sessoes` | Gestão de sessões |
| Admin > Nova Sessão | `/admin/sessoes/nova` | Criar nova sessão |
| Admin > Inscritos | `/admin/inscritos` | Gestão de participantes |
| Admin > Checklist | `/admin/checklist` | Checklist operacional |
| Admin > Instrutores | `/admin/instrutores` | Gestão de equipe |
| Admin > WhatsApp | `/admin/whatsapp` | Central de mensagens |
| API > Sessões | `GET /api/sessions` | Lista de sessões JSON |
| API > Stats | `GET /api/stats` | Estatísticas gerais |

---

## ✅ Funcionalidades Implementadas

### Landing Page (Alta Conversão)
- Hero animado com proposta emocional (aventura + segurança + conquista)
- Estatísticas dinâmicas (500+ expedições, 2.000+ aventureiros, 0 incidentes)
- Cards de experiências (trilha, rapel, combo)
- Seção de diferenciais "Por que escolher a Rota Horizonte"
- Calendário das próximas sessões
- Perfis dos instrutores com autoridade e credenciais
- Depoimentos de participantes verificados
- CTAs claros (reservar vaga, WhatsApp)
- Botão flutuante WhatsApp
- Footer completo com links e redes sociais

### Calendário de Sessões
- Lista com filtros por tipo (trilha/rapel/combo) e nível
- Status visual em tempo real (aberta, quase lotada, lotada, lista de espera)
- Indicador de vagas com barra de progresso
- Data box visual por dia/mês
- Preço por pessoa
- Botões de detalhe e reserva

### Página da Sessão
- Todos os detalhes (local, duração, dificuldade, nível)
- O que está incluso e o que levar
- Plano A e Plano B documentados
- Instrutores responsáveis
- Card lateral sticky com vagas e botão de inscrição
- Integração WhatsApp para lista de espera

### Fluxo de Inscrição (3 etapas)
- **Etapa 1:** Dados pessoais (nome, email, telefone, CPF)
- **Etapa 2:** Contato de emergência obrigatório
- **Etapa 3:** Saúde/experiência (opcional) + aceites legais
- Aceites obrigatórios: ciência de risco, termo responsabilidade, cancelamento
- Aceite opcional: autorização de imagem
- Token único gerado para área do cliente
- Validação client-side com máscaras (CPF, telefone)
- Página de confirmação com próximos passos

### Área do Cliente
- Dados completos da sessão (data, hora, local)
- Contador de dias para a aventura
- Status da inscrição em tempo real
- Abas: Minha Sessão | O que Levar | Local | Avisos
- Checklist interativo para preparação
- Histórico de mensagens da equipe
- Botão direto WhatsApp
- Suporte a impressão de comprovante

### Painel Administrativo
**Dashboard:**
- 4 KPIs principais (sessões, inscrições, próximas, receita)
- Tabela de últimas inscrições
- Tabela de próximas sessões

**Gestão de Sessões:**
- Lista com lotação visual (barra de progresso)
- Status, preço, vagas
- Formulário completo de criação (nome, tipo, dificuldade, data, local, duração, vagas, preço, incluso, levar, plano A e B)
- Vinculação com instrutores

**Gestão de Inscritos:**
- Filtro por sessão
- Atualização de status em tempo real via API
- Controle de presença (presente/ausente)
- Status de pagamento
- Link direto para WhatsApp do participante
- Link para área do cliente

**Checklist Operacional:**
- 5 fases: Antes, Recepção, Execução, Encerramento, Pós
- 27 itens padrão auto-gerados por sessão
- Toggle individual com registro de quem completou
- Progresso geral com porcentagem
- Exportação/impressão em PDF

**Gestão de Instrutores:**
- Cards visuais com foto, bio, certificações
- Modal de cadastro rápido
- Especialidades e filosofia de trabalho

**Central WhatsApp:**
- 6 templates de mensagem (confirmação, D-5, D-2, D-1, dia, pós)
- Preview de cada template
- Envio em lote por sessão (requer integração API)
- Histórico de mensagens enviadas

---

## 🗄️ Modelos de Dados

| Tabela | Descrição |
|--------|-----------|
| `sessions` | Sessões de trilha/rapel/combo |
| `instructors` | Equipe de guias |
| `registrations` | Inscrições dos participantes |
| `checklists` | Itens de checklist operacional por sessão |
| `incidents` | Registro de ocorrências |
| `whatsapp_messages` | Log de mensagens enviadas |
| `testimonials` | Depoimentos de participantes |
| `admin_users` | Usuários do sistema administrativo |
| `legal_acceptances` | Aceites legais com IP e timestamp |

---

## 🎨 Identidade Visual

**Paleta (extraída do Painel de Marca oficial):**
- Azul Profundo: `#1B3A5C` — cor principal (Pantone 349 C)
- Verde Aventura: `#396644` — natureza
- Amarelo Sol: `#F6BE42` — energia/CTA (Pantone 123 C)
- Areia/Bege: `#C7A576` — tons de terra (Pantone 465 C)
- Grafite: `#555555` — texto

**Tipografia:**
- Display: Cloud Soft + Georgia (títulos)
- UI: Inter (interface)

---

## ⚙️ Tecnologias

- **Framework:** Hono 4.x (Edge-first)
- **Build:** Vite + @hono/vite-build
- **Deploy:** Cloudflare Pages
- **Database:** Cloudflare D1 (SQLite na edge)
- **Frontend:** HTML/CSS/JS puro (sem framework)
- **Ícones:** Font Awesome 6.4
- **Fontes:** Google Fonts (Inter)
- **Process Manager:** PM2 (ambiente de sandbox)

---

## 🚀 Deploy para Produção (Cloudflare Pages)

```bash
# 1. Criar banco D1
npx wrangler d1 create rota-horizonte-production

# 2. Adicionar database_id no wrangler.jsonc

# 3. Build e deploy
npm run build
npx wrangler pages deploy dist --project-name rota-horizonte
```

---

## 📱 Automação WhatsApp (Próximo Passo)

Integrar com Evolution API, Zapi ou Twilio para envio automático:
- Confirmação imediata após inscrição
- D-5: engajamento
- D-2: instruções práticas  
- D-1: lembrete final
- Dia do evento: alerta de saída
- Pós-evento: agradecimento + feedback

---

## 🔮 Melhorias Futuras

- [ ] Integração com gateway de pagamento (Stripe/PagSeguro)
- [ ] Autenticação segura para admin (JWT)
- [ ] App mobile (React Native/Flutter)
- [ ] Galeria de fotos por sessão (R2 Storage)
- [ ] Sistema de avaliações pós-evento
- [ ] Integração WhatsApp Business API
- [ ] Relatórios exportáveis em PDF/Excel
- [ ] Sistema de cupons e descontos
- [ ] Multi-tenancy (múltiplas operadoras)
- [ ] PWA com notificações push

---

## 📅 Última Atualização
Março 2026 — v1.0.0
