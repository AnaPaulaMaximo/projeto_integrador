# Casos de Uso Detalhados - SoftGroup

Este documento contém a especificação detalhada dos Casos de Uso do sistema **SoftGroup**, mapeados a partir do diagrama UML (`CasosDeUso.puml`) e em total consonância com as telas de Front-end desenvolvidas para os perfis de **Colaborador**, **Liderança** e **Administrador**.

---

## 1. Autenticar no Sistema (UC_Login)

### Ator Principal:
- Colaborador, Liderança, Administrador

### Objetivo:
Garantir o acesso seguro e personalizado à plataforma, identificando o nível de permissão (perfil) do usuário.

### Pré-Condições:
- O usuário deve possuir uma conta ativa cadastrada no sistema.

### Fluxo Principal:
1. O usuário acessa a página inicial do sistema.
2. O sistema apresenta a tela de Login com a opção de autenticação corporativa ("Entrar com Google").
3. O usuário clica em "Entrar com Google".
4. O sistema valida as credenciais com o provedor de identidade corporativo.
5. O sistema identifica o perfil do usuário (Colaborador, Líder ou Admin).
6. O sistema redireciona o usuário para o painel correspondente ao seu perfil.

### Fluxos Alternativos:

**1a - Usuário sem conta cadastrada**
- 1a.1 - O sistema exibe um alerta informando que a conta não foi encontrada no banco corporativo.
- 1a.2 - O sistema exibe a mensagem: "Não tem uma conta corporativa? Entre em contato com o RH".

### Pós-Condições:
- Sessão iniciada com sucesso; usuário navega com o nível de permissão adequado.

---

## 2. Visualizar seu Desempenho (UC_Desempenho)

### Ator Principal:
- Colaborador

### Objetivo:
Acompanhar o próprio desempenho em Soft Skills por meio de pontuações, gráficos de evolução histórica e recomendações de PDI.

### Pré-Condições:
- Usuário deve estar logado no sistema com perfil de Colaborador.
- Um ciclo de avaliações deve ter sido finalizado ou ter dados parciais liberados.

### Fluxo Principal:
1. O usuário acessa a aba "Dashboard" no menu lateral.
2. O sistema renderiza os resultados do último ciclo consolidado (Autoavaliação, Avaliação do Líder e Média 360°).
3. O sistema exibe o gráfico de "Evolução Histórica" (gráfico de linhas/barras mostrando o avanço semestral).
4. O sistema exibe os cards com os KPIs de "Média Global", "Percentil" e "Status de Desempenho".
5. O sistema exibe a seção do Plano de Desenvolvimento Individual (PDI) com pontos de atenção e cursos sugeridos.

### Fluxos Alternativos:

**2a - Usuário sem avaliações prévias no sistema**
- 2a.1 - O sistema identifica que não há dados consolidados anteriores.
- 2a.2 - O sistema exibe uma mensagem: "Nenhum resultado anterior disponível. Participe do ciclo ativo!"
- 2a.3 - O gráfico de evolução histórica permanece vazio ou exibe um estado padrão neutro.

### Pós-Condições:
- O colaborador visualiza de forma clara os seus gaps de competência e seu progresso individual.

---

## 3. Realizar Autoavaliação (UC_Auto)

### Ator Principal:
- Colaborador

### Objetivo:
Permitir que o colaborador faça sua própria avaliação qualitativa e quantitativa a respeito de suas competências de Soft Skills no ciclo ativo.

### Pré-Condições:
- Usuário deve estar logado no sistema com perfil de Colaborador.
- Deve haver um ciclo de avaliações ativo com pendência de autoavaliação para o usuário.

### Fluxo Principal:
1. O usuário clica na aba "Avaliações" no menu de navegação.
2. O sistema exibe as avaliações ativas e tarefas pendentes.
3. O usuário seleciona o formulário de "Autoavaliação" correspondente ao ciclo atual.
4. O sistema exibe o questionário estruturado com as Soft Skills ativas (Comunicação, Resiliência, Liderança, etc.).
5. O usuário seleciona sua pontuação (escala de 1 a 10) para cada habilidade e insere comentários justificativos.
6. O usuário clica em "Enviar".
7. O sistema salva as respostas no banco de dados e exibe um toast de confirmação.

### Fluxos Alternativos:

**3a - Usuário deseja salvar como rascunho para continuar depois**
- 3a.1 - O usuário preenche parcialmente o formulário e clica em "Salvar Rascunho".
- 3a.2 - O sistema salva o progresso e mantém a tarefa com o status "Em Andamento".

**3b - Prazo do ciclo expirado**
- 3b.1 - O sistema detecta que a data limite do ciclo foi ultrapassada.
- 3b.2 - O botão de responder é desativado e o sistema exibe a mensagem "Prazo expirado".

### Pós-Condições:
- A Autoavaliação do colaborador é salva, e o status da tarefa é alterado para "Concluído".

---

## 4. Realizar Avaliação (360°) (UC_360)

### Ator Principal:
- Colaborador

### Objetivo:
Avaliar os colegas de equipe (pares) de maneira confidencial nas competências de Soft Skills exigidas para as funções corporativas.

### Pré-Condições:
- Usuário deve estar logado no sistema com perfil de Colaborador.
- Um ciclo 360° deve estar ativo, e o RH deve ter selecionado os pares para avaliação mútua.

### Fluxo Principal:
1. O usuário clica em "Avaliações" no menu lateral.
2. O sistema exibe a lista de avaliações pendentes, incluindo a tarefa "Avaliar [Nome do Par]".
3. O usuário seleciona o colega a ser avaliado.
4. O sistema abre o formulário confidencial de avaliação 360°.
5. O usuário atribui pontuações e redige feedbacks construtivos sobre as competências do par.
6. O usuário clica em "Enviar".
7. O sistema processa o envio anonimamente para fins estatísticos e exibe um toast de confirmação.

### Fluxos Alternativos:

**4a - Preenchimento incompleto de campos obrigatórios**
- 4a.1 - O usuário tenta enviar a avaliação sem preencher a nota de alguma Soft Skill obrigatória.
- 4a.2 - O sistema exibe um alerta indicando os campos faltantes e impede o envio até que sejam respondidos.

### Pós-Condições:
- Avaliação 360° registrada; o status da pendência é atualizado para concluído.

---

## 5. Avaliar Subordinados (UC_Aval_Lider)

### Ator Principal:
- Liderança

### Objetivo:
Permitir que os gestores façam as avaliações de desempenho formais de seus liderados diretos e elaborem as diretrizes de PDI.

### Pré-Condições:
- O usuário deve estar logado com perfil de Liderança.
- O ciclo de avaliação deve estar ativo no sistema.

### Fluxo Principal:
1. O líder clica em "Avaliações" no menu lateral.
2. O sistema exibe a lista de membros sob sua gestão direta e seus respectivos status de preenchimento.
3. O líder seleciona um colaborador (ex: "Ricardo Mendonça") com status pendente e clica em "Avaliar".
4. O sistema abre o painel de avaliação do líder contendo os critérios das Soft Skills estabelecidas.
5. O líder insere as notas para cada habilidade do colaborador.
6. O líder redige o feedback final e sugere ações de desenvolvimento no Plano de Desenvolvimento Individual (PDI) (ex: cursos, workshops).
7. O líder clica em "Enviar Avaliação".
8. O sistema atualiza os dashboards da equipe e exibe uma notificação de sucesso.

### Fluxos Alternativos:

**5a - Edição de avaliação já enviada (Dentro do prazo)**
- 5a.1 - O líder deseja ajustar uma nota já enviada enquanto o ciclo está aberto.
- 5a.2 - O líder acessa o perfil do colaborador, clica em "Editar Avaliação", faz os ajustes necessários e reenvia.
- 5a.3 - O sistema atualiza o registro correspondente no banco.

### Pós-Condições:
- A avaliação do líder é consolidada e fica disponível para a composição da Média Final do colaborador.

---

## 6. Visualizar Dashboard da Equipe (UC_Dash)

### Ator Principal:
- Liderança, Administrador

### Objetivo:
Apresentar uma visão analítica consolidada do time sob gestão, facilitando a identificação de talentos e o mapeamento de gargalos de Soft Skills.

### Pré-Condições:
- Usuário deve estar logado com perfil de Liderança ou Administrador.

### Fluxo Principal:
1. O usuário acessa o menu principal e clica em "Colaboradores" (líder) ou "Dashboard" (líder/admin).
2. O sistema exibe o painel contendo o gráfico de radar "Mapeamento de Soft Skills da Equipe" (Média do Time vs. Benchmark).
3. O sistema exibe o card de "Distribuição de Desempenho" (divisão dos colaboradores entre: Excepcional, Esperado, Desenvolvimento, Abaixo).
4. O sistema renderiza a tabela de classificação (Ranking) do grupo.

### Fluxos Alternativos:

**6a - Gestão de Múltiplas Equipes**
- 6a.1 - O líder possui mais de uma equipe subordinada.
- 6a.2 - O líder utiliza o seletor "Selecionar Equipe" no cabeçalho.
- 6a.3 - O sistema recarrega dinamicamente todos os gráficos e rankings para refletir os dados da equipe selecionada.

### Pós-Condições:
- O gestor visualiza os indicadores coletivos em tempo real.

---

## 7. Consultar Ranking do Grupo (UC_Ranking)

### Ator Principal:
- Liderança

### Objetivo:
Visualizar a classificação ordinal dos membros da equipe com base em suas médias de desempenho final (Autoavaliação + Líder + Média 360°).

### Pré-Condições:
- Usuário deve estar logado com perfil de Liderança.

### Fluxo Principal:
1. O líder acessa a tela de "Colaboradores" ou "Dashboard da Equipe".
2. O sistema renderiza a tabela de classificação exibindo:
   - Posição ordinal (ex: 1º, 2º, 3º).
   - Nome e cargo do colaborador com sua foto.
   - Notas individuais de Autoavaliação, Avaliação do Líder e Avaliação 360°.
   - Média Final calculada.
3. O líder clica no link "Ver PDI" para acessar o PDI detalhado do colaborador.

### Fluxos Alternativos:

**7a - Empate na Média Final**
- 7a.1 - Dois ou mais colaboradores obtêm a mesma Média Final.
- 7a.2 - O sistema os exibe na mesma posição nominal e ordena por ordem alfabética ou prioriza a nota do Líder como critério de desempate.

### Pós-Condições:
- O líder analisa o posicionamento e a performance comparativa do seu time.

---

## 8. Gerenciar Usuários e Equipes (UC_Users)

### Ator Principal:
- Administrador

### Objetivo:
Permitir a criação, edição, visualização e inativação de contas de colaboradores e a estruturação de equipes dentro do sistema.

### Pré-Condições:
- Usuário deve estar logado com perfil de Administrador.

### Fluxo Principal:
1. O administrador acessa a tela de "Colaboradores" no menu lateral.
2. O sistema exibe a lista corporativa de usuários.
3. O administrador clica em "Adicionar Usuário".
4. O sistema exibe o formulário de cadastro (Nome, Cargo, E-mail corporativo, Equipe/Departamento).
5. O administrador insere os dados solicitados e clica em "Salvar".
6. O sistema insere o novo colaborador no banco de dados e exibe uma notificação de sucesso.

### Fluxos Alternativos:

**8a - Edição de dados do colaborador**
- 8a.1 - O administrador localiza o usuário na tabela e clica em "Editar".
- 8a.2 - O sistema abre os campos de formulário pré-preenchidos.
- 8a.3 - O administrador altera os dados (ex: promoção de cargo) e clica em "Salvar".

**8b - Inativação/Remoção de Colaborador**
- 8b.1 - O administrador clica no botão de remoção rápida ou menu contextual do colaborador.
- 8b.2 - O sistema exibe modal de confirmação: "Tem certeza que deseja apagar os registros permanentemente?".
- 8b.3 - O administrador confirma, e o sistema inativa a conta corporativa.

### Pós-Condições:
- Os registros cadastrais de usuários e equipes são devidamente atualizados.

---

## 9. Configurar Soft Skills e Critérios (UC_Skills)

### Ator Principal:
- Administrador

### Objetivo:
Definir quais competências de comportamento (Soft Skills) farão parte dos ciclos de avaliação do ano vigente e estabelecer critérios globais.

### Pré-Condições:
- Usuário deve estar logado com perfil de Administrador.

### Fluxo Principal:
1. O administrador acessa a página de "Configurações".
2. O administrador clica na aba "Gerenciar Soft Skills".
3. O sistema exibe as Soft Skills atualmente mapeadas (Liderança, Comunicação, Resiliência, Trabalho em Equipe, Inovação).
4. O administrador pode editar as definições existentes ou adicionar uma nova competência inserindo nome e descrição curta explicativa.
5. O administrador configura as notas de Benchmark exigidas para cada competência.
6. O administrador clica em "Salvar Configurações".
7. O sistema aplica os novos parâmetros globalmente para os próximos formulários de avaliações.

### Pós-Condições:
- Os formulários e gráficos passam a responder às novas definições de soft skills.

---

## 10. Definir Níveis de Proficiência (Cores) (UC_Cores)

### Ator Principal:
- Administrador

### Objetivo:
Estabelecer a escala visual de cores baseada em notas de proficiência (Regra SAGA), aplicada para facilitar a visualização de relatórios corporativos.

### Pré-Condições:
- Usuário deve estar logado com perfil de Administrador.
- Vinculado diretamente ao caso de uso "Configurar Soft Skills e Critérios" (`<<include>>`).

### Fluxo Principal:
1. Dentro do painel de Configurações, o administrador visualiza a escala cromática de desempenho.
2. O administrador insere as faixas de valores para cada tag de desempenho:
   - **Excepcional / Excelente**: Média final >= 9.0 (Tag Verde / Azul)
   - **Esperado**: Média final entre 8.0 e 8.9 (Tag Verde)
   - **Em Desenvolvimento**: Média final entre 7.0 e 7.9 (Tag Amarela)
   - **Abaixo do Esperado**: Média final < 7.0 (Tag Vermelha)
3. O administrador clica em "Salvar Alterações".
4. O sistema atualiza dinamicamente as classes de estilização CSS dos emblemas no sistema inteiro.

### Pós-Condições:
- As tabelas e indicadores de performance passam a renderizar as cores conforme a nova parametrização.

---

## 11. Gerenciar Ciclos de Avaliação (UC_Ciclos)

### Ator Principal:
- Administrador

### Objetivo:
Cadastrar, abrir, agendar, prorrogar ou fechar os ciclos de avaliação de desempenho corporativos.

### Pré-Condições:
- Usuário deve estar logado com perfil de Administrador.

### Fluxo Principal:
1. O administrador acessa a página inicial "Dashboard" ou a página de "Avaliações".
2. Na seção "Tabela de Gestão de Ciclos", o administrador clica em "Novo Ciclo" ou "Novo Ciclo de Avaliação".
3. O sistema abre uma janela modal solicitando:
   - Nome do Ciclo (Ex: Q3 2026 / Novos Talentos)
   - Data de Início
   - Data Final
4. O administrador preenche as datas e clica em "Salvar".
5. O sistema registra o ciclo como "Agendado" (ou "Em Aberto" se a data atual coincidir).
6. O sistema chama o processo de notificações automáticas (`<<include>> UC_Notif`).

### Fluxos Alternativos:

**11a - Fechamento Manual Antecipado (Travar Respostas)**
- 11a.1 - O administrador clica no menu de três pontos ao lado do ciclo ativo na tabela.
- 11a.2 - Seleciona a opção "Travar Respostas".
- 11a.3 - O sistema muda o status do ciclo para "Concluído/Fechado" e bloqueia novos envios nos portais dos colaboradores.

### Pós-Condições:
- O ciclo é criado e seu status é atualizado de acordo com o cronograma estabelecido.

---

## 12. Notificar Pendências (UC_Notif)

### Ator Principal:
- Administrador

### Objetivo:
Enviar lembretes por e-mail ou sistema interno aos colaboradores que possuem avaliações ativas pendentes, elevando a adesão das campanhas.

### Pré-Condições:
- Usuário deve estar logado com perfil de Administrador.
- O ciclo de avaliação deve estar em andamento com colaboradores pendentes de resposta.

### Fluxo Principal:
1. O administrador acessa o painel de controle e observa a listagem de pendências ativas.
2. O administrador clica no botão "Lembrar Alvos" ou "Lembrar Time" (ou o sistema automatizado dispara ao abrir/prorrogar um ciclo).
3. O sistema compila a lista de e-mails corporativos dos usuários com avaliações pendentes.
4. O sistema dispara os e-mails com as informações de prazos e links diretos para preenchimento.
5. O sistema exibe um toast na tela confirmando o envio bem-sucedido.

### Pós-Condições:
- Os colaboradores inadimplentes são notificados e alertas visuais são fixados nos seus painéis individuais.

---

## 13. Exportar Relatório (PDF/Excel) (UC_Export)

### Ator Principal:
- Administrador, Liderança

### Objetivo:
Exportar os dashboards consolidados e relatórios em formato físico de documento (PDF, Excel, CSV) para armazenamento offline ou apresentações.

### Pré-Condições:
- Usuário deve estar autenticado com permissão adequada (Líder ou Admin).
- Estende o caso de uso "Visualizar Dashboard da Equipe" (`<<extend>> UC_Dash`).

### Fluxo Principal:
1. O usuário está visualizando a tabela de classificação da equipe ou a tela de Relatórios Gerais.
2. O usuário seleciona o formato de exportação desejado clicando em "Exportar CSV" ou "Exportar Relatório PDF".
3. O sistema compila os dados filtrados em tela.
4. O sistema gera a estrutura do arquivo em background.
5. O sistema disponibiliza o download direto do documento no navegador do usuário e exibe uma notificação toast de conclusão.

### Pós-Condições:
- O arquivo contendo as notas e métricas é salvo na máquina local do usuário.
