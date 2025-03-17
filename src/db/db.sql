-- Crear la base de datos
CREATE DATABASE IF NOT EXISTS appplantes3;
USE appplantes3;

-- Crear tabla usuaris
CREATE TABLE usuaris (
  id INT NOT NULL AUTO_INCREMENT,
  nom VARCHAR(100) DEFAULT NULL,
  correu VARCHAR(100) DEFAULT NULL,
  contrasenya VARCHAR(100) DEFAULT NULL,
  edat INT DEFAULT NULL,
  nacionalitat VARCHAR(50) DEFAULT NULL,
  codiPostal VARCHAR(20) DEFAULT NULL,
  imatgePerfil VARCHAR(255) DEFAULT NULL,
  btc DECIMAL(10,2) NOT NULL DEFAULT '1000.00',
  PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Crear tabla items
CREATE TABLE items (
  id INT NOT NULL AUTO_INCREMENT,
  nom VARCHAR(100) NOT NULL,
  descripcio TEXT,
  tipus ENUM('cura', 'millora', 'atac', 'defensa', 'bebida', 'comida') NOT NULL,
  efecte VARCHAR(100) DEFAULT NULL,
  imatge VARCHAR(255) NOT NULL,
  preu DECIMAL(10,2) NOT NULL DEFAULT '0.00',
  PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Crear tabla batalles
CREATE TABLE batalles (
  id INT NOT NULL AUTO_INCREMENT,
  jugador1_id INT NOT NULL,
  jugador2_id INT NOT NULL,
  guanyador_id INT DEFAULT NULL,
  data_hora TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY jugador1_id (jugador1_id),
  KEY jugador2_id (jugador2_id),
  KEY guanyador_id (guanyador_id),
  CONSTRAINT batalles_ibfk_1 FOREIGN KEY (jugador1_id) REFERENCES usuaris (id) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT batalles_ibfk_2 FOREIGN KEY (jugador2_id) REFERENCES usuaris (id) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT batalles_ibfk_3 FOREIGN KEY (guanyador_id) REFERENCES usuaris (id) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Crear tabla inventari
CREATE TABLE inventari (
  id INT NOT NULL AUTO_INCREMENT,
  usuari_id INT NOT NULL,
  item_id INT NOT NULL,
  quantitat INT NOT NULL DEFAULT '1',
  PRIMARY KEY (id),
  KEY usuari_id (usuari_id),
  KEY item_id (item_id),
  CONSTRAINT inventari_ibfk_1 FOREIGN KEY (usuari_id) REFERENCES usuaris (id) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT inventari_ibfk_2 FOREIGN KEY (item_id) REFERENCES items (id) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Crear tabla plantas
CREATE TABLE plantas (
  id INT NOT NULL AUTO_INCREMENT,
  usuari_id INT NOT NULL,
  nom VARCHAR(100) NOT NULL,
  tipus VARCHAR(50) NOT NULL,
  nivell INT NOT NULL,
  atac INT NOT NULL,
  defensa INT NOT NULL,
  velocitat INT NOT NULL,
  habilitat_especial VARCHAR(100) DEFAULT NULL,
  energia INT NOT NULL,
  estat VARCHAR(50) DEFAULT 'actiu',
  raritat VARCHAR(50) NOT NULL,
  ultima_actualitzacio TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  imatge VARCHAR(255) NOT NULL,
  PRIMARY KEY (id),
  KEY usuari_id (usuari_id),
  CONSTRAINT fk_plantas_usuaris FOREIGN KEY (usuari_id) REFERENCES usuaris (id) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Crear tabla logros
CREATE TABLE logros (
  id INT NOT NULL AUTO_INCREMENT,
  nom VARCHAR(100) NOT NULL,
  descripcio TEXT,
  recompensa VARCHAR(100) DEFAULT NULL,
  PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Crear tabla logros_usuaris
CREATE TABLE logros_usuaris (
  usuari_id INT NOT NULL,
  logro_id INT NOT NULL,
  data_obtencio TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (usuari_id, logro_id),
  KEY logro_id (logro_id),
  CONSTRAINT logros_usuaris_ibfk_1 FOREIGN KEY (usuari_id) REFERENCES usuaris (id) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT logros_usuaris_ibfk_2 FOREIGN KEY (logro_id) REFERENCES logros (id) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Crear tabla missatges
CREATE TABLE missatges (
  id INT NOT NULL AUTO_INCREMENT,
  remitent_id INT NOT NULL,
  destinatari_id INT NOT NULL,
  missatge TEXT NOT NULL,
  data_envio TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY remitent_id (remitent_id),
  KEY destinatari_id (destinatari_id),
  CONSTRAINT missatges_ibfk_1 FOREIGN KEY (remitent_id) REFERENCES usuaris (id) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT missatges_ibfk_2 FOREIGN KEY (destinatari_id) REFERENCES usuaris (id) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Crear tabla items_usuaris
CREATE TABLE items_usuaris (
  usuari_id INT NOT NULL,
  item_id INT NOT NULL,
  quantitat INT NOT NULL DEFAULT '1',
  PRIMARY KEY (usuari_id, item_id),
  KEY item_id (item_id),
  CONSTRAINT items_usuaris_ibfk_1 FOREIGN KEY (usuari_id) REFERENCES usuaris (id) ON DELETE CASCADE,
  CONSTRAINT items_usuaris_ibfk_2 FOREIGN KEY (item_id) REFERENCES items (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

