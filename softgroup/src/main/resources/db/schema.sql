-- ============================================================
-- Schema corrigido para o banco softgroup
-- Execute este script no PostgreSQL para criar as tabelas
-- ============================================================

CREATE DATABASE softgroup;

\c softgroup;

CREATE TABLE usuario (
    id_usuario   SERIAL PRIMARY KEY,
    nome         VARCHAR(100) NOT NULL,
    email        VARCHAR(100) NOT NULL UNIQUE,
    cargo        VARCHAR(50)  NOT NULL,
    tipo_perfil  VARCHAR(20)  NOT NULL CHECK (tipo_perfil IN ('ADMIN', 'LIDER', 'COLABORADOR')),
    status       VARCHAR(20)  DEFAULT 'ATIVO' CHECK (status IN ('ATIVO', 'INATIVO'))
);

CREATE TABLE equipe (
    id_equipe SERIAL PRIMARY KEY,
    nome      VARCHAR(50) NOT NULL
);

CREATE TABLE usuario_equipe (
    id_usuario INT NOT NULL,
    id_equipe  INT NOT NULL,
    PRIMARY KEY (id_usuario, id_equipe),
    FOREIGN KEY (id_usuario) REFERENCES usuario(id_usuario) ON DELETE CASCADE,
    FOREIGN KEY (id_equipe)  REFERENCES equipe(id_equipe)   ON DELETE CASCADE
);

CREATE TABLE softskill (
    id_softskill SERIAL PRIMARY KEY,
    nome         VARCHAR(100) NOT NULL,
    descricao    TEXT         NOT NULL
);

CREATE TABLE ciclo (
    id_ciclo    SERIAL PRIMARY KEY,
    nome        VARCHAR(100) NOT NULL,
    data_inicio DATE         NOT NULL,
    data_fim    DATE         NOT NULL,
    status      VARCHAR(20)  NOT NULL CHECK (status IN ('ABERTO', 'FECHADO'))
);

-- Níveis de avaliação por faixa de nota (0-100)
CREATE TABLE nivel_avaliacao (
    id_nivelavaliacao SERIAL PRIMARY KEY,
    nome              VARCHAR(20) NOT NULL,
    cor               VARCHAR(20) NOT NULL,
    faixa_min         INT         NOT NULL,
    faixa_max         INT         NOT NULL
);

-- Valores padrão dos níveis
INSERT INTO nivel_avaliacao (nome, cor, faixa_min, faixa_max) VALUES
    ('Acima da Expectativa', 'AZUL',   76, 100),
    ('Dentro da Expectativa','VERDE',  51,  75),
    ('Abaixo da Expectativa','AMARELO', 26,  50),
    ('Crítico',              'VERMELHO', 0,  25);

-- Tabela principal de avaliações
-- id_avaliador = quem avaliou
-- id_avaliado  = quem foi avaliado
CREATE TABLE avaliacao (
    id_avaliacao SERIAL PRIMARY KEY,
    id_avaliador INT          NOT NULL,
    id_avaliado  INT          NOT NULL,
    id_softskill INT          NOT NULL,
    id_ciclo     INT          NOT NULL,
    nota         INT          NOT NULL CHECK (nota BETWEEN 0 AND 100),
    tipo         VARCHAR(20)  NOT NULL CHECK (tipo IN ('AUTO', 'LIDER', '360')),
    anonimato    BOOLEAN      DEFAULT FALSE,
    data         TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_avaliador) REFERENCES usuario(id_usuario)   ON DELETE CASCADE,
    FOREIGN KEY (id_avaliado)  REFERENCES usuario(id_usuario)   ON DELETE CASCADE,
    FOREIGN KEY (id_softskill) REFERENCES softskill(id_softskill),
    FOREIGN KEY (id_ciclo)     REFERENCES ciclo(id_ciclo),
    -- Evita avaliação duplicada do mesmo tipo para o mesmo avaliado/softskill/ciclo
    UNIQUE (id_avaliador, id_avaliado, id_softskill, id_ciclo, tipo)
);
