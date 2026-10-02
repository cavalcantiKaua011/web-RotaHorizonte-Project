// Rota Horizonte — Frontend JS

// ============ NAVBAR SCROLL ============
(function () {
  const navbar = document.getElementById('navbar');
  if (!navbar) return;
  function updateNavbar() {
    if (window.scrollY > 80) navbar.classList.replace('transparent', 'solid');
    else navbar.classList.replace('solid', 'transparent');
  }
  window.addEventListener('scroll', updateNavbar, { passive: true });
  updateNavbar();
})();

// ============ MOBILE NAV ============
function toggleNav() {
  const links = document.getElementById('navLinks');
  if (links) links.classList.toggle('open');
}

// ============ SMOOTH SCROLL ============
document.addEventListener('DOMContentLoaded', function () {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        // close mobile nav
        const links = document.getElementById('navLinks');
        if (links) links.classList.remove('open');
      }
    });
  });
});

// ============ INTERSECTION OBSERVER (animations) ============
(function () {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

  document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.card, .why-item, .instructor-card, .testimonial-card, .stat-card, .session-list-item').forEach(el => {
      if (!el.style.transition) {
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';
      }
      observer.observe(el);
    });
  });
})();

// ============ COUNTER ANIMATION ============
function animateCounter(el, target, duration = 2000) {
  const start = 0;
  const range = target - start;
  const step = range / (duration / 16);
  let current = start;
  const timer = setInterval(() => {
    current = Math.min(current + step, target);
    el.textContent = Math.floor(current).toLocaleString('pt-BR') + (el.dataset.suffix || '');
    if (current >= target) clearInterval(timer);
  }, 16);
}

(function () {
  const counters = document.querySelectorAll('[data-counter]');
  if (!counters.length) return;
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animateCounter(entry.target, parseInt(entry.target.dataset.counter));
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });
  counters.forEach(c => observer.observe(c));
})();

// ============ FORM VALIDATION HELPERS ============
function validateCPF(cpf) {
  cpf = cpf.replace(/[^\d]/g, '');
  if (cpf.length !== 11 || /^(\d)\1+$/.test(cpf)) return false;
  let sum = 0;
  for (let i = 0; i < 9; i++) sum += parseInt(cpf.charAt(i)) * (10 - i);
  let remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(cpf.charAt(9))) return false;
  sum = 0;
  for (let i = 0; i < 10; i++) sum += parseInt(cpf.charAt(i)) * (11 - i);
  remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  return remainder === parseInt(cpf.charAt(10));
}

// ============ TABS ============
function showTab(id) {
  document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
  const tab = document.getElementById('tab-' + id);
  if (tab) tab.classList.add('active');
  if (event && event.target) event.target.classList.add('active');
}

// ============ MODAL ============
function openModal(id) {
  const m = document.getElementById(id);
  if (m) m.classList.add('open');
}
function closeModal(id) {
  const m = document.getElementById(id);
  if (m) m.classList.remove('open');
}
// Close on overlay click
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.modal-overlay').forEach(overlay => {
    overlay.addEventListener('click', function (e) {
      if (e.target === this) this.classList.remove('open');
    });
  });
});

// ============ NOTIFICATION TOAST ============
function showToast(message, type = 'success') {
  const toast = document.createElement('div');
  toast.className = `alert alert-${type}`;
  toast.style.cssText = 'position:fixed;bottom:20px;left:50%;transform:translateX(-50%);z-index:9999;min-width:300px;box-shadow:0 4px 20px rgba(0,0,0,0.2);animation:fadeInUp 0.3s ease';
  const icons = { success: 'check-circle', error: 'exclamation-circle', warning: 'exclamation-triangle', info: 'info-circle' };
  toast.innerHTML = `<i class="fas fa-${icons[type] || 'info-circle'} alert-icon"></i><span>${message}</span>`;
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 4000);
}

// ============ ADMIN STATUS UPDATE ============
async function updateStatus(id, status) {
  try {
    const response = await fetch('/api/registrations/' + id + '/status', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    });
    if (response.ok) showToast('Status atualizado!', 'success');
    else showToast('Erro ao atualizar status', 'error');
  } catch (e) {
    showToast('Erro de conexão', 'error');
  }
}

// ============ PRINT STYLES (checklist) ============
window.addEventListener('beforeprint', () => {
  document.body.classList.add('printing');
});
window.addEventListener('afterprint', () => {
  document.body.classList.remove('printing');
});

// ============ SESSION FILTER (URL params) ============
document.addEventListener('DOMContentLoaded', () => {
  // Highlight active filter
  const url = new URL(window.location.href);
  const tipo = url.searchParams.get('tipo');
  const nivel = url.searchParams.get('nivel');
  if (tipo || nivel) {
    document.querySelectorAll('.filter-btn').forEach(btn => {
      const href = btn.getAttribute('href');
      if (href && tipo && href.includes('tipo=' + tipo)) btn.classList.add('active');
      if (href && nivel && href.includes('nivel=' + nivel)) btn.classList.add('active');
    });
  }
});

// ============ COUNTDOWN TIMER ============
function initCountdowns() {
  document.querySelectorAll('[data-countdown]').forEach(el => {
    const targetDate = new Date(el.dataset.countdown);
    function update() {
      const now = new Date();
      const diff = targetDate - now;
      if (diff <= 0) { el.textContent = 'Hoje!'; return; }
      const days = Math.floor(diff / 86400000);
      const hours = Math.floor((diff % 86400000) / 3600000);
      el.innerHTML = `<strong>${days}</strong> dias <strong>${hours}</strong>h`;
    }
    update();
    setInterval(update, 60000);
  });
}
document.addEventListener('DOMContentLoaded', initCountdowns);

// ============ MOBILE SIDEBAR (admin) ============
function toggleSidebar() {
  const sidebar = document.getElementById('sidebar');
  if (sidebar) sidebar.classList.toggle('open');
}
