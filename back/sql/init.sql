CREATE DATABASE IF NOT EXISTS blob_tower_defense
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE blob_tower_defense;

CREATE TABLE joueur (
  id_joueur       INT AUTO_INCREMENT PRIMARY KEY,
  pseudo          VARCHAR(50)  NOT NULL UNIQUE,
  email           VARCHAR(150) NOT NULL UNIQUE,
  mdp_hash        VARCHAR(255) NOT NULL,
  created_at      DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE niveau (
  id_niveau        INT AUTO_INCREMENT PRIMARY KEY,
  nom              VARCHAR(100) NOT NULL,
  nb_vagues_total  SMALLINT     NOT NULL,
  difficulte       SMALLINT     NOT NULL,
  carte_json       JSON
);

CREATE TABLE partie (
  id_partie       INT AUTO_INCREMENT PRIMARY KEY,
  id_joueur       INT          NOT NULL,
  id_niveau       INT          NOT NULL,
  date_debut      DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  date_fin        DATETIME,
  statut          VARCHAR(20)  NOT NULL DEFAULT 'en_cours',
  vies_restantes  SMALLINT     NOT NULL DEFAULT 20,
  CONSTRAINT fk_partie_joueur FOREIGN KEY (id_joueur) REFERENCES joueur(id_joueur),
  CONSTRAINT fk_partie_niveau FOREIGN KEY (id_niveau) REFERENCES niveau(id_niveau)
);

CREATE TABLE score (
  id_score        INT AUTO_INCREMENT PRIMARY KEY,
  id_partie       INT NOT NULL UNIQUE,
  points          INT NOT NULL DEFAULT 0,
  blobs_elimines  INT NOT NULL DEFAULT 0,
  or_depense      INT NOT NULL DEFAULT 0,
  vagues_passees  SMALLINT NOT NULL DEFAULT 0,
  CONSTRAINT fk_score_partie FOREIGN KEY (id_partie) REFERENCES partie(id_partie)
);

CREATE TABLE vague (
  id_vague        INT AUTO_INCREMENT PRIMARY KEY,
  id_partie       INT         NOT NULL,
  numero_vague    SMALLINT    NOT NULL,
  statut          VARCHAR(20) NOT NULL DEFAULT 'en_attente',
  blobs_restants  INT         NOT NULL DEFAULT 0,
  CONSTRAINT fk_vague_partie FOREIGN KEY (id_partie) REFERENCES partie(id_partie)
);

CREATE TABLE blob_type (
  id_blob_type    INT AUTO_INCREMENT PRIMARY KEY,
  nom             VARCHAR(50)   NOT NULL,
  pv_base         INT           NOT NULL,
  vitesse         DECIMAL(5,2)  NOT NULL,
  recompense_or   SMALLINT      NOT NULL,
  capacite_spec   VARCHAR(50)
);

CREATE TABLE composition_vague (
  id_vague        INT      NOT NULL,
  id_blob_type    INT      NOT NULL,
  quantite        SMALLINT NOT NULL,
  delai_spawn     DECIMAL(5,2),
  PRIMARY KEY (id_vague, id_blob_type),
  CONSTRAINT fk_cv_vague     FOREIGN KEY (id_vague)     REFERENCES vague(id_vague),
  CONSTRAINT fk_cv_blob_type FOREIGN KEY (id_blob_type) REFERENCES blob_type(id_blob_type)
);

CREATE TABLE tour_type (
  id_tour_type     INT AUTO_INCREMENT PRIMARY KEY,
  nom              VARCHAR(50)  NOT NULL,
  degats_base      INT          NOT NULL,
  portee           DECIMAL(5,2) NOT NULL,
  vitesse_attaque  DECIMAL(5,2) NOT NULL,
  cout_or          SMALLINT     NOT NULL
);

CREATE TABLE tour_placee (
  id_tour_placee  INT AUTO_INCREMENT PRIMARY KEY,
  id_partie       INT      NOT NULL,
  id_tour_type    INT      NOT NULL,
  pos_x           SMALLINT NOT NULL,
  pos_y           SMALLINT NOT NULL,
  niveau_upgrade  SMALLINT NOT NULL DEFAULT 1,
  actif           TINYINT(1) NOT NULL DEFAULT 1,
  CONSTRAINT fk_tp_partie    FOREIGN KEY (id_partie)    REFERENCES partie(id_partie),
  CONSTRAINT fk_tp_tour_type FOREIGN KEY (id_tour_type) REFERENCES tour_type(id_tour_type)
);

-- Données de référence : types de blobs
INSERT INTO blob_type (nom, pv_base, vitesse, recompense_or, capacite_spec) VALUES
  ('Blob vert',   50,  1.00, 10, NULL),
  ('Blob rouge',  30,  2.00, 15, 'rapide'),
  ('Blob noir',  120,  0.75, 25, 'armure'),
  ('Blob roi',   500,  0.50, 100, 'boss');

-- Données de référence : types de tours
INSERT INTO tour_type (nom, degats_base, portee, vitesse_attaque, cout_or) VALUES
  ('Archer',     25, 3.00, 1.00, 50),
  ('Magicien',   60, 2.50, 0.60, 120),
  ('Catapulte',  90, 4.00, 0.30, 200);