// Database initialization and helper functions
export const DB_SCHEMA = `
CREATE TABLE IF NOT EXISTS sessions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK(type IN ('trilha', 'rapel', 'combo')),
  difficulty TEXT NOT NULL CHECK(difficulty IN ('iniciante', 'intermediario', 'avancado')),
  date TEXT NOT NULL,
  time TEXT NOT NULL,
  location TEXT NOT NULL,
  location_maps TEXT,
  duration TEXT NOT NULL,
  max_spots INTEGER NOT NULL,
  price REAL NOT NULL,
  description TEXT,
  included TEXT,
  what_to_bring TEXT,
  plan_a TEXT,
  plan_b TEXT,
  status TEXT NOT NULL DEFAULT 'aberta' CHECK(status IN ('aberta', 'quase_lotada', 'lotada', 'lista_espera', 'cancelada', 'concluida')),
  instructor_ids TEXT DEFAULT '[]',
  image_url TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS instructors (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  photo_url TEXT,
  bio TEXT,
  experience_years INTEGER,
  certifications TEXT,
  specialties TEXT,
  philosophy TEXT,
  active INTEGER DEFAULT 1,
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS registrations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  session_id INTEGER NOT NULL,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  cpf TEXT NOT NULL,
  emergency_contact TEXT NOT NULL,
  emergency_phone TEXT NOT NULL,
  previous_experience TEXT,
  physical_restrictions TEXT,
  notes TEXT,
  status TEXT NOT NULL DEFAULT 'pendente' CHECK(status IN ('pendente', 'confirmado', 'aguardando_pagamento', 'cancelado', 'lista_espera', 'presente', 'ausente')),
  accepted_terms INTEGER DEFAULT 0,
  accepted_cancellation INTEGER DEFAULT 0,
  accepted_image INTEGER DEFAULT 0,
  accepted_risk INTEGER DEFAULT 0,
  payment_status TEXT DEFAULT 'pendente' CHECK(payment_status IN ('pendente', 'pago', 'reembolsado', 'isento')),
  payment_amount REAL,
  payment_date TEXT,
  token TEXT UNIQUE,
  whatsapp_sent INTEGER DEFAULT 0,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (session_id) REFERENCES sessions(id)
);

CREATE TABLE IF NOT EXISTS checklists (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  session_id INTEGER NOT NULL,
  phase TEXT NOT NULL CHECK(phase IN ('antes', 'recepcao', 'execucao', 'encerramento', 'pos')),
  item TEXT NOT NULL,
  completed INTEGER DEFAULT 0,
  completed_by TEXT,
  completed_at TEXT,
  notes TEXT,
  order_index INTEGER DEFAULT 0,
  FOREIGN KEY (session_id) REFERENCES sessions(id)
);

CREATE TABLE IF NOT EXISTS incidents (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  session_id INTEGER NOT NULL,
  description TEXT NOT NULL,
  severity TEXT NOT NULL CHECK(severity IN ('leve', 'moderado', 'grave')),
  action_taken TEXT,
  reported_by TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (session_id) REFERENCES sessions(id)
);

CREATE TABLE IF NOT EXISTS whatsapp_messages (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  registration_id INTEGER,
  session_id INTEGER,
  phone TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL,
  status TEXT DEFAULT 'pendente' CHECK(status IN ('pendente', 'enviado', 'erro')),
  sent_at TEXT,
  error_msg TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (registration_id) REFERENCES registrations(id),
  FOREIGN KEY (session_id) REFERENCES sessions(id)
);

CREATE TABLE IF NOT EXISTS testimonials (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  photo_url TEXT,
  text TEXT NOT NULL,
  rating INTEGER DEFAULT 5,
  session_type TEXT,
  approved INTEGER DEFAULT 0,
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS admin_users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role TEXT DEFAULT 'admin' CHECK(role IN ('admin', 'instructor', 'operator')),
  name TEXT NOT NULL,
  active INTEGER DEFAULT 1,
  last_login TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS legal_acceptances (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  registration_id INTEGER NOT NULL,
  term_type TEXT NOT NULL,
  ip_address TEXT,
  user_agent TEXT,
  accepted_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (registration_id) REFERENCES registrations(id)
);

CREATE INDEX IF NOT EXISTS idx_sessions_date ON sessions(date);
CREATE INDEX IF NOT EXISTS idx_sessions_status ON sessions(status);
CREATE INDEX IF NOT EXISTS idx_registrations_session ON registrations(session_id);
CREATE INDEX IF NOT EXISTS idx_registrations_email ON registrations(email);
CREATE INDEX IF NOT EXISTS idx_registrations_token ON registrations(token);
CREATE INDEX IF NOT EXISTS idx_checklists_session ON checklists(session_id);
`;

export const SEED_DATA = `
INSERT OR IGNORE INTO admin_users (username, password_hash, role, name) VALUES 
  ('admin', '$2a$10$placeholder_hash_admin', 'admin', 'Administrador'),
  ('guia1', '$2a$10$placeholder_hash_guia1', 'instructor', 'Carlos Montanha');

INSERT OR IGNORE INTO instructors (id, name, bio, experience_years, certifications, specialties, philosophy) VALUES 
  (1, 'Carlos Montanha', 'Apaixonado por montanhas desde os 16 anos, Carlos liderou mais de 500 expedições com zero incidentes graves. Formado em Educação Física com especialização em esportes de aventura.', 12, 'ACMG Level 3, Wilderness First Responder, Guia de Montanha CBME', 'Trilhas técnicas, Rapel, Escalada esportiva', 'Segurança não é uma limitação — é o que nos permite ir mais longe.'),
  (2, 'Ana Trilheira', 'Bióloga e guia certificada, Ana combina conhecimento científico com amor pela natureza. Especialista em ecoturismo e trilhas de longa distância, ela transforma cada caminhada em uma aula de vida.', 8, 'Guia de Ecoturismo IBAMA, Primeiros Socorros em Ambiente Selvagem, WAFA', 'Ecoturismo, Trilhas longas, Flora e Fauna', 'Cada trilha é única. Meu papel é garantir que você chegue ao fim transformado.'),
  (3, 'Roberto Vértice', 'Ex-atleta de escalada, Roberto traz a precisão técnica do esporte competitivo para o turismo de aventura. Com foco em rapel e escalada, ele é referência em segurança vertical na região.', 15, 'Instrutor de Rapel CBME, Resgate em Montanha, ACMG Advanced Rock', 'Rapel técnico, Escalada, Resgate vertical', 'Vencer o medo da altura começa com confiar no equipamento — e em quem está ao seu lado.');

INSERT OR IGNORE INTO sessions (id, name, type, difficulty, date, time, location, duration, max_spots, price, description, included, what_to_bring, plan_a, plan_b, status, instructor_ids) VALUES 
  (1, 'Trilha do Mirante das Águias', 'trilha', 'iniciante', '2026-04-05', '07:00', 'Serra da Canastra - MG', '6 horas', 15, 180.00, 'Uma jornada de 8km pelo coração da Serra da Canastra, com vista privilegiada do mirante e contato com a fauna local. Ideal para iniciantes e famílias.', 'Guia especializado, kit de segurança, lanche da manhã, seguro de aventura', 'Tênis de trilha ou bota, mochila 20L, água 2L, protetor solar, repelente, lanche extra, capa de chuva', 'Saída 07h do ponto de encontro, trilha completa 8km, parada para fotos no mirante, retorno 13h.', 'Em caso de chuva forte: trilha alternativa de 4km no interior da mata, protegida. Cancelamento com reembolso total se impossível realizar.', 'aberta', '[1,2]'),
  (2, 'Rapel das Cachoeiras', 'rapel', 'intermediario', '2026-04-12', '08:00', 'Chapada dos Veadeiros - GO', '5 horas', 10, 250.00, 'Descida técnica de 40 metros em cachoeira com piscina natural ao fim. Uma experiência que mistura adrenalina pura com a beleza da Chapada dos Veadeiros.', 'Equipamento completo de rapel, capacete, luvas, guia técnico especializado, seguro, lanche', 'Roupa de banho sob a roupa, tênis fechado, protetor solar, água 1.5L, documentos', 'Briefing de segurança 30min, rapel em grupos de 2, tempo livre na piscina natural, retorno ao ponto base.', 'Nível da água muito alto: prática em parede seca adjacente com mesmo nível técnico. Cancelamento total com reembolso se necessário.', 'quase_lotada', '[3]'),
  (3, 'Expedição Combo: Trilha + Rapel', 'combo', 'intermediario', '2026-04-19', '06:30', 'Parque Estadual do Ibitipoca - MG', '8 horas', 8, 380.00, 'A experiência completa da Rota Horizonte! 10km de trilha técnica culminando em um rapel de 25m. Para quem quer viver tudo de uma vez.', 'Guias especializados, todos equipamentos, almoço no campo, seguro aventura, certificado de conclusão', 'Bota de trilha (obrigatório), mochila 30L, água 3L, protetor solar, repelente, kit lanche extra, capa de chuva', 'Saída 6h30, trilha técnica 10km, almoço no campo, rapel 25m, retorno 14h30 com certificado.', 'Chuva moderada: mantemos trilha com redução de percurso. Tempestade: cancelamento com 100% de crédito para próxima turma.', 'aberta', '[1,3]');

INSERT OR IGNORE INTO testimonials (name, text, rating, session_type, approved) VALUES 
  ('Mariana S.', 'Nunca pensei que conseguiria! A equipe da Rota Horizonte me fez acreditar que era possível. O rapel foi a experiência mais intensa da minha vida — e já quero voltar!', 5, 'rapel', 1),
  ('Pedro L.', 'Profissionalismo impecável do início ao fim. Senti segurança em cada passo. A trilha do Mirante é simplesmente espetacular. Recomendo para toda a família.', 5, 'trilha', 1),
  ('Carla M.', 'Fiz a expedição combo e foi transformador. Carlos e Roberto são guias excepcionais. Saí de lá com mais confiança em mim mesma do que entrei.', 5, 'combo', 1),
  ('João V.', 'Minha empresa levou o time para a trilha como team building. Resultado: a melhor experiência de integração que já tivemos. Comunicação da equipe é perfeita.', 5, 'trilha', 1),
  ('Fernanda C.', 'Tinha muito medo de altura. O Roberto foi paciente, técnico e encorajador. Desci aqueles 40 metros sorrindo. Isso não tem preço.', 5, 'rapel', 1);
`;

export function generateToken(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let token = '';
  for (let i = 0; i < 32; i++) {
    token += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return token;
}

export function getStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    aberta: 'Aberta',
    quase_lotada: 'Quase Lotada',
    lotada: 'Lotada',
    lista_espera: 'Lista de Espera',
    cancelada: 'Cancelada',
    concluida: 'Concluída',
    pendente: 'Pendente',
    confirmado: 'Confirmado',
    aguardando_pagamento: 'Aguardando Pagamento',
    presente: 'Presente',
    ausente: 'Ausente',
    pago: 'Pago',
    reembolsado: 'Reembolsado',
  };
  return labels[status] || status;
}

export function getTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    trilha: 'Trilha',
    rapel: 'Rapel',
    combo: 'Trilha + Rapel',
  };
  return labels[type] || type;
}

export function getDifficultyLabel(diff: string): string {
  const labels: Record<string, string> = {
    iniciante: 'Iniciante',
    intermediario: 'Intermediário',
    avancado: 'Avançado',
  };
  return labels[diff] || diff;
}
