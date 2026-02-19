// Active menu highlighting (fallback if you forget aria-current)
(function () {
  const path = location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('nav a[data-page]').forEach(a => {
    if (a.getAttribute('data-page') === path) a.setAttribute('aria-current', 'page');
  });
})();
