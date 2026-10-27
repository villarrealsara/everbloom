# EVERBLOOM - Modulo de Productos

Aprendiz: Sara Julieth Villarreal Ortiz - Ficha 3235896 - Instructor: Edicson Nino Arevalo

Este proyecto tiene el modulo de **Productos** de EVERBLOOM, con conexion a MySQL
(base de datos `everbloom`) y las operaciones **crear, consultar, actualizar y eliminar**.

| Evidencia | Que incluye |
|-----------|-------------|
| GA7-220501096-AA2-EV01 Codificacion de modulos del software | Conexion a MySQL, CRUD y menu en la terminal |
| GA7-220501096-AA2-EV02 Modulos de software codificados y probados | Version web: formularios HTML, metodos GET y POST y paginas dinamicas |

## Nota sobre el lenguaje (homologacion)
La guia permite homologar las evidencias con el lenguaje de programacion backend elegido.
EVERBLOOM se programa en **JavaScript (Node.js)**, por eso cada pieza de Java se cambio
por su equivalente:

| La guia pide (Java)                 | En este proyecto (JavaScript)                                   |
|-------------------------------------|-----------------------------------------------------------------|
| Driver JDBC de MySQL                | Libreria `mysql2`                                               |
| Clase de conexion JDBC              | `src/conexiones/conexion.js`                                    |
| Clases del modelo                   | `src/modelos/producto.js`                                       |
| Metodos del CRUD                    | Funciones de `src/servicios/producto-servicio.js`               |
| Paquetes                            | Carpetas dentro de `src/`                                       |
| Servidor Tomcat                     | Servidor Node.js con Express (`src/servidor.js`)                |
| Formulario HTML con method="post"   | `src/vistas/formulario-producto.js`                             |
| Servlet con doGet y doPost          | Rutas GET y POST en `src/rutas/producto-rutas.js`               |
| request.getParameter()              | `peticion.body` (datos del formulario) y `peticion.query` (parametros de la direccion) |
| Paginas JSP                         | Vistas en `src/vistas/` (HTML que se arma con los datos de la base) |

## Estructura
```
everbloom/
  base-datos/
    everbloom.sql          Script de la base de datos (18 tablas)
    datos-prueba.sql       3 categorias para probar
  publico/
    css/styles.css, css/modulo.css   Estilos (styles.css es el del prototipo AA4-EV03, sin cambios)
    js/main.js                       Menu responsivo del prototipo
    img/                             Imagenes del prototipo (banner, productos, verificado)
  src/
    configuraciones/base-datos.js   Datos de conexion (leidos del archivo .env)
    conexiones/conexion.js          Conexion a MySQL
    modelos/producto.js             Clase Producto
    servicios/
      producto-servicio.js          CRUD de productos
      categoria-servicio.js         Consulta de categorias
    rutas/producto-rutas.js         Rutas GET y POST (equivale al Servlet)
    vistas/                         Paginas HTML (equivale a las paginas JSP)
      pagina-base.js, lista-productos.js, formulario-producto.js, resultado.js, ayudas-html.js
    servidor.js                     Crea la aplicacion web
    iniciar-servidor.js             Arranca el servidor
    menu-productos.js               Menu en la terminal (EV01)
    pruebas/
      probar-crud.js                Prueba del CRUD (EV01)
      probar-web.js                 Prueba del flujo web (EV02)
  .env.ejemplo, .gitignore, package.json
```

## Como ejecutarlo
1. Instalar Node.js (version 20 o mayor) y tener MySQL funcionando.
2. En MySQL Workbench, ejecutar `base-datos/everbloom.sql` y luego `base-datos/datos-prueba.sql`.
3. Copiar `.env.ejemplo` con el nombre `.env` y escribir la clave de MySQL.
4. En la terminal, dentro de la carpeta del proyecto:
   ```
   npm install
   npm run probar        (prueba del CRUD, EV01)
   npm run menu          (menu en la terminal, EV01)
   npm run probar-web    (prueba del flujo web, EV02)
   npm run web           (arranca la pagina web)
   ```
5. Con `npm run web` activo, abrir **http://localhost:3000** en el navegador.
   Para detener el servidor, pulsar Ctrl + C.

## Rutas de la pagina web
| Metodo | Direccion                    | Que hace                                              |
|--------|------------------------------|-------------------------------------------------------|
| GET    | /productos                   | Lista de productos. Con `?busqueda=texto` busca por nombre |
| GET    | /productos/nuevo             | Formulario para un producto nuevo                     |
| POST   | /productos                   | Recibe el formulario y guarda el producto             |
| GET    | /productos/:id/editar        | Formulario con los datos del producto                 |
| POST   | /productos/:id/actualizar    | Recibe el formulario y guarda los cambios             |
| POST   | /productos/:id/eliminar      | Elimina el producto                                   |

## Estandares de codificacion usados
Definidos en la evidencia GA7-220501096-AA1-EV02:
- Variables y funciones en camelCase y en espanol (`nombreProducto`, `crearProducto`).
- Clases con mayuscula inicial y en singular (`Producto`), una por archivo.
- Funciones que empiezan con un verbo (`consultarProductos`, `eliminarProducto`).
- Archivos y carpetas en minuscula con guiones; carpetas que agrupan, en plural.
- Constantes en MAYUSCULA, `const` por defecto, comillas simples, punto y coma, dos espacios.
- Columnas de la base de datos en guion bajo (`nombre_producto`) y en el codigo en camelCase.

## Repositorio
El enlace del repositorio esta en `ENLACE_REPOSITORIO.txt`.
