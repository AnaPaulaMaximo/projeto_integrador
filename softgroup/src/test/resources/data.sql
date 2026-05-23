INSERT INTO usuario (nome, email, cargo, tipo_perfil, status)
SELECT 'Admin Sistema', 'admin@softgroup.com', 'Administrador', 'ADMIN', 'ATIVO'
WHERE NOT EXISTS (SELECT 1 FROM usuario WHERE email = 'admin@softgroup.com');

INSERT INTO usuario (nome, email, cargo, tipo_perfil, status)
SELECT 'Ana Colaboradora', 'ana@softgroup.com', 'Desenvolvedora', 'COLABORADOR', 'ATIVO'
WHERE NOT EXISTS (SELECT 1 FROM usuario WHERE email = 'ana@softgroup.com');

INSERT INTO usuario (nome, email, cargo, tipo_perfil, status)
SELECT 'Bruno Colaborador', 'bruno@softgroup.com', 'Desenvolvedor', 'COLABORADOR', 'ATIVO'
WHERE NOT EXISTS (SELECT 1 FROM usuario WHERE email = 'bruno@softgroup.com');

INSERT INTO equipe (nome)
SELECT 'Equipe Teste'
WHERE NOT EXISTS (SELECT 1 FROM equipe WHERE nome = 'Equipe Teste');

INSERT INTO usuario_equipe (id_usuario, id_equipe)
SELECT u.id_usuario, e.id_equipe
FROM usuario u, equipe e
WHERE u.email IN ('ana@softgroup.com', 'bruno@softgroup.com')
  AND e.nome = 'Equipe Teste'
  AND NOT EXISTS (
      SELECT 1
      FROM usuario_equipe ue
      WHERE ue.id_usuario = u.id_usuario
        AND ue.id_equipe = e.id_equipe
  );

INSERT INTO softskill (nome, descricao)
SELECT 'Comunicacao', 'Capacidade de se expressar com clareza.'
WHERE NOT EXISTS (SELECT 1 FROM softskill WHERE nome = 'Comunicacao');

INSERT INTO ciclo (nome, data_inicio, data_fim, status)
SELECT 'Ciclo Teste', DATE '2026-01-01', DATE '2026-06-30', 'ABERTO'
WHERE NOT EXISTS (SELECT 1 FROM ciclo WHERE nome = 'Ciclo Teste');
