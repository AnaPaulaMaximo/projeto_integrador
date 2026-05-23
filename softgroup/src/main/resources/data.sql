-- ============================================================
-- Seed minimo - SoftGroup
-- Este arquivo roda depois do schema.sql.
--
-- E-mail do administrador demo: admin@softgroup.com
-- O INSERT abaixo cria o admin se ele ainda nao existir.
-- ============================================================

INSERT INTO usuario (nome, email, cargo, tipo_perfil, status)
SELECT 'Admin Sistema', 'admin@softgroup.com', 'Administrador', 'ADMIN', 'ATIVO'
WHERE NOT EXISTS (
    SELECT 1
    FROM usuario
    WHERE email = 'admin@softgroup.com'
);
