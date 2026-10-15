# EVERBLOOM - Modulo de Productos (CRUD con MySQL)

Evidencia GA7-220501096-AA2-EV01 - Codificacion de modulos del software
Aprendiz: Sara Julieth Villarreal Ortiz - Ficha 3235896 - Instructor: Edicson Nino Arevalo

## Que hace este proyecto
Es el modulo de **Productos** del proyecto EVERBLOOM. Se conecta a la base de datos
MySQL `everbloom` y permite **crear, consultar, actualizar y eliminar** productos
(arreglos florales).

## Nota sobre el lenguaje (homologacion)
La guia permite homologar la evidencia con el lenguaje de programacion backend elegido
para el proyecto. EVERBLOOM se programa en **JavaScript (Node.js)**, por eso:

| La guia pide (Java)              | En este proyecto (JavaScript)                         |
|----------------------------------|-------------------------------------------------------|
| Driver JDBC de MySQL (.jar)      | Libreria `mysql2` (se instala con npm install)        |
| Clase de conexion JDBC           | `src/conexiones/conexion.js`                          |
| Clases del modelo                | `src/modelos/producto.js` (clase Producto)            |
| Metodos del CRUD                 | Funciones en `src/servicios/producto-servicio.js`     |
| Paquetes                         | Carpetas dentro de `src/`                             |

## Estructura
```
everbloom/
  base-datos/
    everbloom.sql          Script de la base de datos (18 tablas)
    datos-prueba.sql       3 categorias para probar
  src/
    configuraciones/base-datos.js   Datos de conexion (leidos del archivo .env)
    conexiones/conexion.js          Conexion a MySQL
    modelos/producto.js             Clase Producto
    servicios/producto-servicio.js  CRUD: crear, consultar, actualizar, eliminar
    pruebas/probar-crud.js          Prueba automatica del CRUD
    menu-productos.js               Menu en la terminal
  .env.ejemplo             Ejemplo de datos de conexion
  package.json
```

## Como ejecutarlo
1. Instalar Node.js (version 20 o mayor) y tener MySQL funcionando.
2. En MySQL Workbench, abrir y ejecutar `base-datos/everbloom.sql` y luego
   `base-datos/datos-prueba.sql`.
3. Copiar `.env.ejemplo` con el nombre `.env` y escribir la clave de MySQL.
4. En la terminal, dentro de la carpeta del proyecto:
   ```
   npm install
   npm run probar     (prueba automatica del CRUD)
   npm run menu       (menu para usar el CRUD a mano)
   ```

## Estandares de codificacion usados
Definidos en la evidencia GA7-220501096-AA1-EV02:
- Nombres de variables y funciones en camelCase y en espanol (`nombreProducto`, `crearProducto`).
- Clases con mayuscula inicial y en singular (`Producto`), una por archivo.
- Funciones que empiezan con un verbo (`consultarProductos`, `eliminarProducto`).
- Archivos y carpetas en minuscula con guiones; carpetas que agrupan, en plural.
- Constantes en MAYUSCULA (`CONFIGURACION_BD`), `const` por defecto, comillas simples,
  punto y coma, dos espacios de sangria, comentarios que explican el para que.
- Columnas de la base de datos en guion bajo (`nombre_producto`) y en el codigo en
  camelCase (`nombreProducto`).

## Repositorio
El enlace del repositorio esta en el archivo `ENLACE_REPOSITORIO.txt`.
