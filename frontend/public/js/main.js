document.addEventListener('DOMContentLoaded', () => {
  const now = new Date().toLocaleString();
  const el = document.getElementById('renderedAt');
  if (el) el.textContent = now;
});
