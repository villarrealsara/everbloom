/* ============================================================
   EVERBLOOM - JavaScript del front-end (AA4-EV03)
   1. Ayudas   2. Menú responsivo   3. Mensajes   4. Validación
   5. Catálogo   6. Acciones de formularios y botones   7. Pedido
   ============================================================ */
(function () {
  'use strict';

  /* ---------- 1. Ayudas ---------- */
  var enPages = location.pathname.indexOf('/pages/') !== -1;
  var rutas = {
    inicio: enPages ? '../index.html' : 'index.html',
    login: enPages ? 'login.html' : 'pages/login.html',
    pedido: enPages ? 'realizar-pedido.html' : 'pages/realizar-pedido.html',
    confirmado: enPages ? 'pedido-confirmado.html' : 'pages/pedido-confirmado.html'
  };
  function ir(destino, espera) {
    setTimeout(function () { window.location.href = rutas[destino]; }, espera || 0);
  }
  function $(id) { return document.getElementById(id); }
  function guardar(clave, valor) { try { localStorage.setItem(clave, valor); } catch (e) { /* sin almacenamiento */ } }
  function leer(clave, defecto) { try { return localStorage.getItem(clave) || defecto; } catch (e) { return defecto; } }

  /* ---------- 2. Menú responsivo ---------- */
  function iniciarMenu() {
    var boton = document.querySelector('.hamburger');
    var menu = $('navLinks');
    if (!boton || !menu) { return; }
    function cerrar() {
      menu.classList.remove('open');
      boton.setAttribute('aria-expanded', 'false');
      boton.setAttribute('aria-label', 'Abrir menú');
    }
    boton.addEventListener('click', function () {
      var abierto = menu.classList.toggle('open');
      boton.setAttribute('aria-expanded', abierto ? 'true' : 'false');
      boton.setAttribute('aria-label', abierto ? 'Cerrar menú' : 'Abrir menú');
    });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') { cerrar(); } });
    window.addEventListener('resize', function () { if (window.innerWidth > 900) { cerrar(); } });
    menu.addEventListener('click', function (e) { if (e.target.tagName === 'A') { cerrar(); } });
  }

  /* ---------- 3. Mensajes de retroalimentación ---------- */
  function mensaje(texto, tipo) {
    var area = $('mensajes');
    if (!area) {
      area = document.createElement('div');
      area.id = 'mensajes';
      area.className = 'toast-area';
      area.setAttribute('role', 'status');
      area.setAttribute('aria-live', 'polite');
      document.body.appendChild(area);
    }
    var t = document.createElement('div');
    t.className = 'toast toast-' + (tipo || 'info');
    t.textContent = texto;
    area.appendChild(t);
    setTimeout(function () { if (t.parentNode) { t.parentNode.removeChild(t); } }, 4000);
  }

  /* ---------- 4. Validación de formularios ---------- */
  function ponerError(campo, texto) {
    var id = campo.id + '-error';
    var aviso = $(id);
    if (!aviso) {
      aviso = document.createElement('small');
      aviso.id = id;
      aviso.className = 'field-error';
      campo.parentNode.appendChild(aviso);
    }
    aviso.textContent = texto;
    campo.setAttribute('aria-invalid', 'true');
    campo.setAttribute('aria-describedby', id);
  }
  function quitarError(campo) {
    var aviso = $(campo.id + '-error');
    if (aviso) { aviso.textContent = ''; }
    campo.removeAttribute('aria-invalid');
  }
  function validarCampo(campo) {
    var valor = campo.value.trim();
    var nombre = campo.labels && campo.labels[0] ? campo.labels[0].textContent.replace('*', '').replace('(opcional)', '').trim().toLowerCase() : 'este campo';
    if (campo.required && valor === '') { ponerError(campo, 'Escribe ' + nombre + '.'); return false; }
    if (valor === '') { quitarError(campo); return true; }
    if (campo.type === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(valor)) {
      ponerError(campo, 'Escribe un correo válido, por ejemplo correo@ejemplo.com.'); return false;
    }
    if (campo.type === 'tel' && !/^[0-9+\s-]{7,15}$/.test(valor)) {
      ponerError(campo, 'El teléfono debe tener entre 7 y 15 números.'); return false;
    }
    if (campo.minLength > 0 && valor.length < campo.minLength) {
      ponerError(campo, 'Debe tener mínimo ' + campo.minLength + ' caracteres.'); return false;
    }
    if (campo.dataset.igual && campo.value !== $(campo.dataset.igual).value) {
      ponerError(campo, 'Las contraseñas no coinciden.'); return false;
    }
    quitarError(campo);
    return true;
  }
  function validarFormulario(form) {
    var campos = form.querySelectorAll('input, textarea');
    var primero = null;
    campos.forEach(function (c) {
      if (!validarCampo(c) && !primero) { primero = c; }
    });
    if (primero) {
      primero.focus();
      mensaje('Revisa los campos marcados en rojo.', 'error');
      return false;
    }
    return true;
  }
  function iniciarFormularios() {
    document.querySelectorAll('form[data-form]').forEach(function (form) {
      form.querySelectorAll('input, textarea').forEach(function (c) {
        c.addEventListener('blur', function () { validarCampo(c); });
        c.addEventListener('input', function () { if (c.getAttribute('aria-invalid') === 'true') { validarCampo(c); } });
      });
      form.addEventListener('submit', function (e) {
        e.preventDefault();
        if (!validarFormulario(form)) { return; }
        acciones[form.dataset.form](form);
      });
    });
  }

  /* ---------- 6. Acciones de cada formulario y botón ---------- */
  var acciones = {
    login: function () {
      mensaje('¡Bienvenida a EverBloom!', 'ok');
      ir('inicio', 900);
    },
    registro: function () {
      mensaje('Cuenta creada correctamente. Ahora inicia sesión.', 'ok');
      ir('login', 1200);
    },
    recuperar1: function () {
      $('step1').style.display = 'none';
      $('step2').style.display = 'block';
      mensaje('Código verificado. Escribe tu nueva contraseña.', 'ok');
      $('newPass').focus();
    },
    recuperar2: function () {
      mensaje('¡Contraseña actualizada correctamente!', 'ok');
      ir('login', 1200);
    },
    pedido: function () {
      guardar('eb_nombre', $('clienteName').value.trim());
      guardar('eb_email', $('clienteEmail').value.trim());
      guardar('eb_tel', $('clienteTel').value.trim());
      guardar('eb_dir', $('clienteDir').value.trim());
      guardar('eb_numPedido', 'EVB-' + Math.floor(10000 + Math.random() * 90000));
      mensaje('Pedido realizado. Te llevamos a la confirmación.', 'ok');
      ir('confirmado', 900);
    }
  };

  function iniciarBotones() {
    document.querySelectorAll('[data-accion]').forEach(function (b) {
      b.addEventListener('click', function () {
        var a = b.dataset.accion;
        if (a === 'cancelar') {
          if (window.confirm('¿Deseas cancelar el pedido?')) { mensaje('Pedido cancelado.', 'info'); ir('inicio', 600); }
        } else if (a === 'atras') {
          history.back();
        } else if (a === 'ver-pedido') {
          mensaje('Tu pedido ' + leer('eb_numPedido', '') + ' está en preparación.', 'ok');
        }
      });
    });
    var img = document.querySelector('img[data-respaldo]');
    if (img) {
      img.addEventListener('error', function () {
        img.style.display = 'none';
        $(img.dataset.respaldo).style.display = 'block';
      });
    }
  }

  /* ---------- 5. Catálogo (buscador y botones Ordenar) ---------- */
  function iniciarCatalogo() {
    var buscador = $('buscador');
    var grilla = $('productsGrid');
    if (buscador && grilla) {
      buscador.addEventListener('input', function () {
        var texto = buscador.value.trim().toLowerCase();
        var visibles = 0;
        grilla.querySelectorAll('.product-card').forEach(function (c) {
          var coincide = c.dataset.name.indexOf(texto) !== -1;
          c.style.display = coincide ? '' : 'none';
          if (coincide) { visibles++; }
        });
        var aviso = $('sinResultados');
        if (visibles === 0 && !aviso) {
          aviso = document.createElement('p');
          aviso.id = 'sinResultados';
          aviso.className = 'sin-resultados';
          aviso.textContent = 'No encontramos flores con ese nombre.';
          grilla.appendChild(aviso);
        } else if (visibles > 0 && aviso) {
          aviso.parentNode.removeChild(aviso);
        }
      });
    }
    document.querySelectorAll('button[data-nombre]').forEach(function (b) {
      b.addEventListener('click', function () {
        guardar('eb_producto', b.dataset.nombre);
        guardar('eb_precio', b.dataset.precio);
        ir('pedido');
      });
    });
  }

  /* ---------- 7. Datos en las pantallas de pedido ---------- */
  function ponerTexto(id, texto) { var e = $(id); if (e) { e.textContent = texto; } }
  function iniciarPedido() {
    if ($('sumProducto')) {
      var pr = leer('eb_precio', '$45.00');
      ponerTexto('sumProducto', leer('eb_producto', 'Ramo Premium Everbloom'));
      ponerTexto('sumPrecio', pr);
      ponerTexto('sumTotal', pr);
    }
    if ($('numPedido')) {
      var fecha = new Date().toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' });
      ponerTexto('numPedido', '#' + leer('eb_numPedido', 'EVB-00000'));
      ponerTexto('fechaPedido', fecha);
      ponerTexto('dNombre', leer('eb_nombre', '—'));
      ponerTexto('dEmail', leer('eb_email', '—'));
      ponerTexto('dTel', leer('eb_tel', '—'));
      ponerTexto('dDir', leer('eb_dir', '—'));
      ponerTexto('dProducto', leer('eb_producto', '—'));
      ponerTexto('dPrecio', leer('eb_precio', '—'));
    }
  }

  document.addEventListener('DOMContentLoaded', function () {
    iniciarMenu();
    iniciarFormularios();
    iniciarBotones();
    iniciarCatalogo();
    iniciarPedido();
  });
})();
