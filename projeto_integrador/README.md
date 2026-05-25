# SoftGroup

Sistema de Gerenciamento de Avaliações Comportamentais (Soft Skills) — projeto integrador SENAI-CIC.

Permite **autoavaliação**, **avaliação da liderança** e **avaliação 360°** entre colegas de equipe, com classificação em quatro níveis (Azul / Verde / Amarelo / Vermelho), histórico de ciclos, ranking, dashboards visuais e relatórios exportáveis em PDF, Excel e CSV.

---

## 1. Estrutura

```
pi/
├─ softgroup/             # backend Spring Boot 4 (Java 17)
└─ projeto_integrador/    # frontend estático (HTML/CSS/JS vanilla + Chart.js)
```

O backend serve o frontend automaticamente — basta rodar a API e abrir o navegador em `http://localhost:8080/`.

---

## 2. Requisitos

- Java 17+
- Maven (ou usar o `mvnw` que vem no projeto)
- Navegador moderno (Chrome, Edge, Firefox)
- Opcional: PostgreSQL 14+ (se não quiser usar o H2 embutido)

---

## 3. Como rodar (modo demo, sem instalação de banco)

Por padrão o projeto usa **H2 em arquivo** salvo em `softgroup/.data/softgroup.mv.db`. Os dados persistem entre execuções.

### Windows (PowerShell ou cmd)

```cmd
cd softgroup
.\mvnw.cmd spring-boot:run
```

### Linux / macOS

```bash
cd softgroup
./mvnw spring-boot:run
```

A aplicação sobe em `http://localhost:8080/`. O `data.sql` carrega automaticamente:

| E-mail                    | Perfil      | Acesso |
|---------------------------|-------------|--------|
| `admin@softgroup.com`     | ADMIN       | Gestão geral |
| `lider@softgroup.com`     | LIDER       | Equipes Alpha e Beta |
| `ana@softgroup.com`       | COLABORADOR | Equipe Alpha |
| `bruno@softgroup.com`     | COLABORADOR | Equipe Alpha |
| `carla@softgroup.com`     | COLABORADOR | Equipe Beta |
| `diego@softgroup.com`     | COLABORADOR | Equipe Beta |

Acesse `http://localhost:8080/` → tela de login → digite um dos e-mails acima → clique em **Entrar**. Não há senha (modo demo).

---

## 4. Como rodar com PostgreSQL

```bash
export SPRING_DATASOURCE_URL=jdbc:postgresql://localhost:5432/softgroup
export SPRING_DATASOURCE_USERNAME=postgres
export SPRING_DATASOURCE_PASSWORD=sua_senha
export SPRING_DATASOURCE_DRIVER_CLASS_NAME=org.postgresql.Driver
export SPRING_JPA_DATABASE_PLATFORM=org.hibernate.dialect.PostgreSQLDialect
export H2_CONSOLE=false
./mvnw spring-boot:run
```

O `softgroup/src/main/resources/db/schema.sql` contém o DDL para criar o banco manualmente, se preferir.

---

## 5. Habilitar login com Google (opcional)

A forma mais prática é usar um arquivo `.env` na pasta `softgroup/`. O Spring carrega ele automaticamente (linha `spring.config.import=optional:file:./.env[.properties]` em `application.properties`).

```bash
cd softgroup
cp .env.example .env          # Linux/macOS
copy .env.example .env        # Windows
```

Abra o `.env` e preencha (use a forma canônica `spring.profiles.active`, minúsculo com pontos — `SPRING_PROFILES_ACTIVE` só funciona como env var do shell, não em arquivo `.env`):

```properties
GOOGLE_CLIENT_ID=seu-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=seu-secret
spring.profiles.active=oauth
```

Depois é só rodar normalmente:

```bash
./mvnw spring-boot:run
```

O arquivo `.env` está no `.gitignore` — **nunca commite**. Sem o profile `oauth`, o OAuth fica desligado e o botão exibe erro — use o login por e-mail (modo demo).

---

## 6. Fluxo de demonstração (ponta a ponta)

1. **Login como admin** (`admin@softgroup.com`) →
   - cria usuário em **Colaboradores** ou edita um existente
   - associa a uma equipe
   - cria/abre/fecha ciclos em **Avaliações**
   - cadastra Soft Skills em **Configurações**
   - vê o ranking pré-visualizado em **Relatórios** e **exporta em PDF / Excel / CSV**
2. **Login como colaborador** (`ana@softgroup.com`) →
   - vê o próprio dashboard em **Dashboard**
   - registra autoavaliação em **Avaliações**
   - registra avaliação 360° de um colega da mesma equipe
   - exporta o relatório individual em PDF/Excel/CSV
3. **Login como líder** (`lider@softgroup.com`) →
   - vê o ranking da equipe em **Equipe**
   - registra avaliação de liderança sobre seus liderados
   - exporta o relatório da equipe
4. Ao **fechar um ciclo** pelo admin, novas avaliações são bloqueadas com `400`.

---

## 7. Endpoints principais (referência rápida)

| Método | URL | Quem pode |
|---|---|---|
| `POST` | `/api/auth/login` | qualquer |
| `POST` | `/api/auth/logout` | qualquer |
| `GET`  | `/api/me` | autenticado |
| `GET`  | `/api/usuarios` | ADMIN |
| `GET`  | `/api/usuarios/me/colegas` | autenticado |
| `GET`  | `/api/equipes/minhas` | autenticado |
| `GET`  | `/api/softskills` | autenticado |
| `GET`  | `/api/ciclos`, `/api/ciclos/atual` | autenticado |
| `POST` | `/api/avaliacoes` | autenticado (regras de tipo aplicadas) |
| `GET`  | `/api/avaliacoes/pendentes/ciclo/{id}` | ADMIN, LIDER |
| `GET`  | `/api/dashboard/meu/ciclo/{id}` | autenticado |
| `GET`  | `/api/dashboard/colaborador/{id}/ciclo/{id}` | ADMIN, LIDER |
| `GET`  | `/api/ranking/ciclo/{id}` | ADMIN, LIDER |
| `GET`  | `/api/ranking/ciclo/{id}/equipe/{id}` | autenticado |

---

## 8. Testes

```bash
cd softgroup
./mvnw test
```

Cobertura atual:
- `SoftgroupApplicationTests` — smoke (contexto sobe).
- `AuthControllerTest` — login válido, inválido, vazio; `/api/me` sem sessão.
- `PermissaoControllerTest` — 401 sem sessão, 403 colaborador em endpoints de admin, 200 admin em endpoints de admin.
- `AvaliacaoFlowTest` — fluxo de leituras (`ciclos`, `softskills`, `colegas`, `equipes/minhas`) por colaborador autenticado.

---

## 9. Tecnologias

- **Backend**: Spring Boot 4.0.4, Spring Security, Spring Data JPA, Lombok, H2/PostgreSQL.
- **Frontend**: HTML/CSS/JS vanilla, Chart.js, FontAwesome, Inter font, jsPDF + AutoTable, SheetJS.
- **Auth**: sessão (cookie `JSESSIONID`) + OAuth2 Google opcional.

---

## 10. Conceitos do domínio

- **Soft Skill** — competência comportamental cadastrada pelo admin (ex: Comunicação, Liderança).
- **Nível de avaliação** — quatro faixas fixas (Azul ≥ 76, Verde 51–75, Amarelo 26–50, Vermelho 0–25).
- **Ciclo** — período avaliativo com data de início/fim e status `ABERTO` ou `FECHADO`. Avaliações novas só entram em ciclos abertos.
- **Tipo de avaliação**:
  - `AUTO` — feita pelo próprio colaborador.
  - `LIDER` — feita pelo líder ou admin sobre alguém da equipe.
  - `360` — feita entre colegas da mesma equipe; pode ser anônima.
- **Ranking** — média geral por colaborador no ciclo, ordenada do maior para o menor.
- **Dashboard** — comparação auto × líder × 360 por soft skill + histórico dos últimos ciclos.
