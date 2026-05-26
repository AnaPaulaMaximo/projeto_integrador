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

-- ============================================================
-- Softskills padrao do sistema.
-- Cada INSERT e idempotente: so insere se ainda nao existir uma
-- softskill com o mesmo nome (uk_softskill_nome).
-- ============================================================

INSERT INTO softskill (nome, descricao)
SELECT 'Comunicacao',
       'Capacidade de transmitir ideias com clareza, ouvir ativamente e adaptar a mensagem ao publico.'
WHERE NOT EXISTS (SELECT 1 FROM softskill WHERE nome = 'Comunicacao');

INSERT INTO softskill (nome, descricao)
SELECT 'Trabalho em Equipe',
       'Colaboracao com colegas para atingir objetivos comuns, respeitando diferentes pontos de vista.'
WHERE NOT EXISTS (SELECT 1 FROM softskill WHERE nome = 'Trabalho em Equipe');

INSERT INTO softskill (nome, descricao)
SELECT 'Lideranca',
       'Habilidade de inspirar, orientar e desenvolver pessoas para entregar resultados consistentes.'
WHERE NOT EXISTS (SELECT 1 FROM softskill WHERE nome = 'Lideranca');

INSERT INTO softskill (nome, descricao)
SELECT 'Proatividade',
       'Antecipar necessidades e tomar iniciativa sem depender exclusivamente de demandas externas.'
WHERE NOT EXISTS (SELECT 1 FROM softskill WHERE nome = 'Proatividade');

INSERT INTO softskill (nome, descricao)
SELECT 'Resolucao de Problemas',
       'Analisar situacoes complexas, identificar causas-raiz e propor solucoes eficazes.'
WHERE NOT EXISTS (SELECT 1 FROM softskill WHERE nome = 'Resolucao de Problemas');

INSERT INTO softskill (nome, descricao)
SELECT 'Adaptabilidade',
       'Ajustar-se a novos cenarios, prioridades e tecnologias mantendo a qualidade da entrega.'
WHERE NOT EXISTS (SELECT 1 FROM softskill WHERE nome = 'Adaptabilidade');

INSERT INTO softskill (nome, descricao)
SELECT 'Empatia',
       'Compreender as emocoes e perspectivas dos outros para construir relacoes de confianca.'
WHERE NOT EXISTS (SELECT 1 FROM softskill WHERE nome = 'Empatia');

INSERT INTO softskill (nome, descricao)
SELECT 'Gestao do Tempo',
       'Priorizar tarefas, respeitar prazos e equilibrar urgencia com importancia.'
WHERE NOT EXISTS (SELECT 1 FROM softskill WHERE nome = 'Gestao do Tempo');

INSERT INTO softskill (nome, descricao)
SELECT 'Pensamento Critico',
       'Avaliar informacoes de forma estruturada, questionar premissas e fundamentar decisoes.'
WHERE NOT EXISTS (SELECT 1 FROM softskill WHERE nome = 'Pensamento Critico');

INSERT INTO softskill (nome, descricao)
SELECT 'Criatividade',
       'Gerar ideias originais e propor abordagens inovadoras para desafios do dia a dia.'
WHERE NOT EXISTS (SELECT 1 FROM softskill WHERE nome = 'Criatividade');

INSERT INTO softskill (nome, descricao)
SELECT 'Inteligencia Emocional',
       'Reconhecer e gerenciar as proprias emocoes e as dos outros em situacoes de pressao.'
WHERE NOT EXISTS (SELECT 1 FROM softskill WHERE nome = 'Inteligencia Emocional');

INSERT INTO softskill (nome, descricao)
SELECT 'Organizacao',
       'Estruturar tarefas, processos e materiais para sustentar uma rotina produtiva.'
WHERE NOT EXISTS (SELECT 1 FROM softskill WHERE nome = 'Organizacao');

INSERT INTO softskill (nome, descricao)
SELECT 'Negociacao',
       'Buscar acordos equilibrados, conciliando interesses divergentes com respeito e clareza.'
WHERE NOT EXISTS (SELECT 1 FROM softskill WHERE nome = 'Negociacao');

INSERT INTO softskill (nome, descricao)
SELECT 'Resiliencia',
       'Recuperar-se de adversidades, manter o foco e aprender com erros e contratempos.'
WHERE NOT EXISTS (SELECT 1 FROM softskill WHERE nome = 'Resiliencia');

INSERT INTO softskill (nome, descricao)
SELECT 'Etica Profissional',
       'Agir com integridade, transparencia e responsabilidade em todas as interacoes.'
WHERE NOT EXISTS (SELECT 1 FROM softskill WHERE nome = 'Etica Profissional');