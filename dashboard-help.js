/* Accessible explanations for the student application table. */
(() => {
  'use strict';
  const container = document.querySelector('.table-wrap');
  if (!container) return;
  container.addEventListener('click', event => {
    const button = event.target.closest('.cb-help');
    if (!button) return;
    const cell = button.closest('th');
    if (!cell) return;
    const open = button.getAttribute('aria-expanded') === 'true';
    container.querySelectorAll('.cb-help').forEach(other => {
      other.setAttribute('aria-expanded','false');
      other.closest('th')?.querySelector('.cb-help-panel')?.remove();
    });
    if (open) return;
    const explanation = document.createElement('div');
    explanation.className = 'cb-help-panel';
    explanation.setAttribute('role','status');
    explanation.textContent = button.dataset.help;
    cell.appendChild(explanation);
    button.setAttribute('aria-expanded','true');
  });
  document.addEventListener('keydown', event => {
    if (event.key !== 'Escape') return;
    container.querySelectorAll('.cb-help-panel').forEach(el=>el.remove());
    container.querySelectorAll('.cb-help').forEach(el=>el.setAttribute('aria-expanded','false'));
  });
})();
