-- =====================================================================
-- EVERBLOOM - Script de la base de datos (MySQL 8.0)
-- Evidencia GA6-220501096-AA2-EV03 - Script bases de datos del proyecto
-- Aprendiz: Sara Julieth Villarreal Ortiz - Ficha 3235896
-- Contiene: 18 tablas con llaves primarias, llaves foraneas, valores unicos,
-- campos obligatorios, valores por defecto y validaciones (CHECK).
-- =====================================================================

DROP DATABASE IF EXISTS everbloom;
CREATE DATABASE everbloom CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci;
USE everbloom;

-- roles: Perfiles con los que se entra al sistema (administradora, cliente, operador).
CREATE TABLE roles (
  id_rol INT NOT NULL AUTO_INCREMENT,
  nombre_rol VARCHAR(50) NOT NULL,
  descripcion VARCHAR(200) NULL,
  CONSTRAINT pk_roles PRIMARY KEY (id_rol),
  CONSTRAINT uq_roles_nombre_rol UNIQUE (nombre_rol)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- usuarios: Personas que entran al sistema con correo y contraseña.
CREATE TABLE usuarios (
  id_usuario INT NOT NULL AUTO_INCREMENT,
  id_rol INT NOT NULL,
  nombres VARCHAR(100) NOT NULL,
  apellidos VARCHAR(100) NOT NULL,
  correo VARCHAR(150) NOT NULL,
  contrasena VARCHAR(255) NOT NULL,
  telefono VARCHAR(20) NULL,
  estado BOOLEAN NOT NULL DEFAULT TRUE,
  fecha_registro DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT pk_usuarios PRIMARY KEY (id_usuario),
  CONSTRAINT uq_usuarios_correo UNIQUE (correo),
  CONSTRAINT fk_usuarios_roles FOREIGN KEY (id_rol) REFERENCES roles (id_rol) ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- clientes: Datos adicionales de los usuarios que compran.
CREATE TABLE clientes (
  id_cliente INT NOT NULL AUTO_INCREMENT,
  id_usuario INT NOT NULL,
  fecha_nacimiento DATE NULL,
  CONSTRAINT pk_clientes PRIMARY KEY (id_cliente),
  CONSTRAINT uq_clientes_id_usuario UNIQUE (id_usuario),
  CONSTRAINT fk_clientes_usuarios FOREIGN KEY (id_usuario) REFERENCES usuarios (id_usuario) ON UPDATE CASCADE ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- paises: Países.
CREATE TABLE paises (
  id_pais INT NOT NULL AUTO_INCREMENT,
  nombre_pais VARCHAR(100) NOT NULL,
  CONSTRAINT pk_paises PRIMARY KEY (id_pais),
  CONSTRAINT uq_paises_nombre_pais UNIQUE (nombre_pais)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- departamentos: Departamentos de cada país.
CREATE TABLE departamentos (
  id_departamento INT NOT NULL AUTO_INCREMENT,
  id_pais INT NOT NULL,
  nombre_departamento VARCHAR(100) NOT NULL,
  CONSTRAINT pk_departamentos PRIMARY KEY (id_departamento),
  CONSTRAINT fk_departamentos_paises FOREIGN KEY (id_pais) REFERENCES paises (id_pais) ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ciudades: Ciudades de cada departamento.
CREATE TABLE ciudades (
  id_ciudad INT NOT NULL AUTO_INCREMENT,
  id_departamento INT NOT NULL,
  nombre_ciudad VARCHAR(100) NOT NULL,
  CONSTRAINT pk_ciudades PRIMARY KEY (id_ciudad),
  CONSTRAINT fk_ciudades_departamentos FOREIGN KEY (id_departamento) REFERENCES departamentos (id_departamento) ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- direcciones: Direcciones guardadas por cada usuario.
CREATE TABLE direcciones (
  id_direccion INT NOT NULL AUTO_INCREMENT,
  id_usuario INT NOT NULL,
  id_ciudad INT NOT NULL,
  direccion VARCHAR(200) NOT NULL,
  codigo_postal VARCHAR(20) NULL,
  CONSTRAINT pk_direcciones PRIMARY KEY (id_direccion),
  CONSTRAINT fk_direcciones_usuarios FOREIGN KEY (id_usuario) REFERENCES usuarios (id_usuario) ON UPDATE CASCADE ON DELETE RESTRICT,
  CONSTRAINT fk_direcciones_ciudades FOREIGN KEY (id_ciudad) REFERENCES ciudades (id_ciudad) ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- categorias: Tipos de arreglos (rosas, girasoles, ramos, etc.).
CREATE TABLE categorias (
  id_categoria INT NOT NULL AUTO_INCREMENT,
  nombre_categoria VARCHAR(100) NOT NULL,
  descripcion VARCHAR(200) NULL,
  CONSTRAINT pk_categorias PRIMARY KEY (id_categoria),
  CONSTRAINT uq_categorias_nombre_categoria UNIQUE (nombre_categoria)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- productos: Arreglos florales del catálogo.
CREATE TABLE productos (
  id_producto INT NOT NULL AUTO_INCREMENT,
  id_categoria INT NOT NULL,
  nombre_producto VARCHAR(150) NOT NULL,
  descripcion TEXT NULL,
  precio DECIMAL(10,2) NOT NULL,
  imagen VARCHAR(255) NULL,
  estado_producto BOOLEAN NOT NULL DEFAULT TRUE,
  CONSTRAINT pk_productos PRIMARY KEY (id_producto),
  CONSTRAINT fk_productos_categorias FOREIGN KEY (id_categoria) REFERENCES categorias (id_categoria) ON UPDATE CASCADE ON DELETE RESTRICT,
  CONSTRAINT ck_productos_precio CHECK (precio >= 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- inventario: Cantidad disponible de cada producto.
CREATE TABLE inventario (
  id_inventario INT NOT NULL AUTO_INCREMENT,
  id_producto INT NOT NULL,
  cantidad INT NOT NULL DEFAULT 0,
  fecha_actualizacion DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT pk_inventario PRIMARY KEY (id_inventario),
  CONSTRAINT uq_inventario_id_producto UNIQUE (id_producto),
  CONSTRAINT fk_inventario_productos FOREIGN KEY (id_producto) REFERENCES productos (id_producto) ON UPDATE CASCADE ON DELETE CASCADE,
  CONSTRAINT ck_inventario_cantidad CHECK (cantidad >= 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- empaques: Tipos de empaque para el regalo.
CREATE TABLE empaques (
  id_empaque INT NOT NULL AUTO_INCREMENT,
  nombre_empaque VARCHAR(100) NOT NULL,
  precio_extra DECIMAL(10,2) NOT NULL DEFAULT 0,
  CONSTRAINT pk_empaques PRIMARY KEY (id_empaque),
  CONSTRAINT uq_empaques_nombre_empaque UNIQUE (nombre_empaque),
  CONSTRAINT ck_empaques_precio_extra CHECK (precio_extra >= 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- pedidos: Pedidos hechos por los clientes.
CREATE TABLE pedidos (
  id_pedido INT NOT NULL AUTO_INCREMENT,
  id_usuario INT NOT NULL,
  fecha_pedido DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  estado_pedido VARCHAR(30) NOT NULL DEFAULT 'Pendiente',
  CONSTRAINT pk_pedidos PRIMARY KEY (id_pedido),
  CONSTRAINT fk_pedidos_usuarios FOREIGN KEY (id_usuario) REFERENCES usuarios (id_usuario) ON UPDATE CASCADE ON DELETE RESTRICT,
  CONSTRAINT ck_pedidos_estado_pedido CHECK (estado_pedido IN ('Pendiente','En proceso','Enviado','Entregado'))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- detalle_pedido: Productos de cada pedido y su personalización.
CREATE TABLE detalle_pedido (
  id_detalle INT NOT NULL AUTO_INCREMENT,
  id_pedido INT NOT NULL,
  id_producto INT NOT NULL,
  id_empaque INT NULL,
  cantidad INT NOT NULL DEFAULT 1,
  precio_unitario DECIMAL(10,2) NOT NULL,
  color VARCHAR(50) NULL,
  mensaje_tarjeta VARCHAR(255) NULL,
  CONSTRAINT pk_detalle_pedido PRIMARY KEY (id_detalle),
  CONSTRAINT fk_detalle_pedido_pedidos FOREIGN KEY (id_pedido) REFERENCES pedidos (id_pedido) ON UPDATE CASCADE ON DELETE CASCADE,
  CONSTRAINT fk_detalle_pedido_productos FOREIGN KEY (id_producto) REFERENCES productos (id_producto) ON UPDATE CASCADE ON DELETE RESTRICT,
  CONSTRAINT fk_detalle_pedido_empaques FOREIGN KEY (id_empaque) REFERENCES empaques (id_empaque) ON UPDATE CASCADE ON DELETE RESTRICT,
  CONSTRAINT ck_detalle_pedido_cantidad CHECK (cantidad > 0),
  CONSTRAINT ck_detalle_pedido_precio_unitario CHECK (precio_unitario >= 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- metodos_pago: Formas de pago (transferencia, contraentrega).
CREATE TABLE metodos_pago (
  id_metodo INT NOT NULL AUTO_INCREMENT,
  nombre_metodo VARCHAR(50) NOT NULL,
  tipo_metodo VARCHAR(50) NULL,
  CONSTRAINT pk_metodos_pago PRIMARY KEY (id_metodo),
  CONSTRAINT uq_metodos_pago_nombre_metodo UNIQUE (nombre_metodo)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- pagos: Pago de cada pedido.
CREATE TABLE pagos (
  id_pago INT NOT NULL AUTO_INCREMENT,
  id_pedido INT NOT NULL,
  id_metodo INT NOT NULL,
  estado_pago VARCHAR(30) NOT NULL DEFAULT 'Pendiente',
  fecha_pago DATETIME NULL,
  CONSTRAINT pk_pagos PRIMARY KEY (id_pago),
  CONSTRAINT uq_pagos_id_pedido UNIQUE (id_pedido),
  CONSTRAINT fk_pagos_pedidos FOREIGN KEY (id_pedido) REFERENCES pedidos (id_pedido) ON UPDATE CASCADE ON DELETE RESTRICT,
  CONSTRAINT fk_pagos_metodos_pago FOREIGN KEY (id_metodo) REFERENCES metodos_pago (id_metodo) ON UPDATE CASCADE ON DELETE RESTRICT,
  CONSTRAINT ck_pagos_estado_pago CHECK (estado_pago IN ('Pendiente','Pagado','Rechazado'))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- entregas: Entrega de cada pedido.
CREATE TABLE entregas (
  id_entrega INT NOT NULL AUTO_INCREMENT,
  id_pedido INT NOT NULL,
  id_direccion INT NOT NULL,
  fecha_entrega DATE NOT NULL,
  estado_entrega VARCHAR(30) NOT NULL DEFAULT 'Programada',
  CONSTRAINT pk_entregas PRIMARY KEY (id_entrega),
  CONSTRAINT uq_entregas_id_pedido UNIQUE (id_pedido),
  CONSTRAINT fk_entregas_pedidos FOREIGN KEY (id_pedido) REFERENCES pedidos (id_pedido) ON UPDATE CASCADE ON DELETE RESTRICT,
  CONSTRAINT fk_entregas_direcciones FOREIGN KEY (id_direccion) REFERENCES direcciones (id_direccion) ON UPDATE CASCADE ON DELETE RESTRICT,
  CONSTRAINT ck_entregas_estado_entrega CHECK (estado_entrega IN ('Programada','En camino','Entregada'))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- tipos_reporte: Clases de reporte (ventas, inventario, pedidos).
CREATE TABLE tipos_reporte (
  id_tipo_reporte INT NOT NULL AUTO_INCREMENT,
  nombre_reporte VARCHAR(100) NOT NULL,
  CONSTRAINT pk_tipos_reporte PRIMARY KEY (id_tipo_reporte),
  CONSTRAINT uq_tipos_reporte_nombre_reporte UNIQUE (nombre_reporte)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- reportes: Reportes que genera la administradora.
CREATE TABLE reportes (
  id_reporte INT NOT NULL AUTO_INCREMENT,
  id_usuario INT NOT NULL,
  id_tipo_reporte INT NOT NULL,
  fecha_generacion DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT pk_reportes PRIMARY KEY (id_reporte),
  CONSTRAINT fk_reportes_usuarios FOREIGN KEY (id_usuario) REFERENCES usuarios (id_usuario) ON UPDATE CASCADE ON DELETE RESTRICT,
  CONSTRAINT fk_reportes_tipos_reporte FOREIGN KEY (id_tipo_reporte) REFERENCES tipos_reporte (id_tipo_reporte) ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
