// Pagina base: el marco que comparten las paginas con barra de menu.
// Usa la misma hoja de estilos del prototipo de EverBloom (css/styles.css).

/**
 * Arma una pagina completa. "claseCuerpo" decide el diseno (pg-inicio, pg-pedido, pg-confirmado)
 * y "barraMenu" dice si se pone la barra de menu de arriba.
 */
export function paginaBase({ titulo, contenido, claseCuerpo = 'pg-inicio', barraMenu = true, pie = true }) {
  const barra = barraMenu
    ? `  <nav class="navbar" aria-label="Menú principal">
    <div class="navbar-logo">
      <span>EverBloom</span>
    </div>
    <button class="hamburger" type="button" aria-label="Abrir menú" aria-controls="navLinks" aria-expanded="false">
      <span></span><span></span><span></span>
    </button>
    <ul class="navbar-links" id="navLinks">
      <li><a href="/productos"${titulo === 'Productos' ? ' class="active"' : ''}>Inicio</a></li>
      <li><a href="/productos">Catálogo</a></li>
      <li><a href="/productos/nuevo">Nuevo producto</a></li>
    </ul>
  </nav>
`
    : '';
  const piePagina = pie
    ? '  <footer class="footer">2024 - Everbloom © — Política de Privacidad · Términos y Condiciones</footer>\n'
    : '';
  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>EverBloom — ${titulo}</title>
  <link rel="stylesheet" href="/css/styles.css">
  <link rel="stylesheet" href="/css/modulo.css">
</head>
<body class="${claseCuerpo}">
${barra}${contenido}
${piePagina}  <script src="/js/main.js"></script>
</body>
</html>`;
}
