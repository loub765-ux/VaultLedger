# Especificações Técnicas: Backend e Banco de Dados - VaultLedger

Este documento detalha os requisitos técnicos, a arquitetura da API e o esquema do banco de dados necessários para a implementação real do ecossistema VaultLedger.

## 1. Stack Tecnológica Recomendada
* **Linguagem:** TypeScript
* **Runtime:** Node.js (v18+)
* **Framework Web:** Express.js ou NestJS
* **Banco de Dados:** PostgreSQL (Relacional)
* **ORM:** Prisma ou TypeORM
* **Autenticação:** Passport.js com estratégia JWT

## 2. Requisitos de Banco de Dados (Schema)

### Tabela: `users`
* `id`: UUID (Primary Key)
* `name`: VarChar(100)
* `email`: VarChar(150) (Unique, Indexed)
* `password_hash`: Text
* `avatar_url`: Text (Nullable)
* `phone`: VarChar(20) (Nullable)
* `address`: Text (Nullable)
* `created_at`: Timestamp

### Tabela: `categories`
* `id`: UUID (Primary Key)
* `user_id`: UUID (Foreign Key -> users.id)
* `name`: VarChar(50)
* `color`: VarChar(7) (Hex Code)

### Tabela: `transactions`
* `id`: UUID (Primary Key)
* `user_id`: UUID (Foreign Key -> users.id)
* `category_id`: UUID (Foreign Key -> categories.id)
* `description`: VarChar(200)
* `amount`: Decimal(15, 2)
* `type`: Enum ('income', 'expense')
* `date`: Date
* `created_at`: Timestamp

### Tabela: `goals`
* `id`: UUID (Primary Key)
* `user_id`: UUID (Foreign Key -> users.id)
* `title`: VarChar(100)
* `target_amount`: Decimal(15, 2)
* `current_amount`: Decimal(15, 2)
* `color`: VarChar(7)
* `deadline`: Date (Nullable)

### Tabela: `events` (Agenda)
* `id`: UUID (Primary Key)
* `user_id`: UUID (Foreign Key -> users.id)
* `title`: VarChar(100)
* `date`: Date
* `type`: Enum ('bill', 'income', 'goal', 'reminder')
* `color`: VarChar(20)

## 3. Requisitos de API (Principais Endpoints)

### Autenticação (`/api/auth`)
* `POST /register`: Criação de conta e hashing de senha.
* `POST /login`: Validação de credenciais e emissão de Token JWT.
* `POST /logout`: Invalidação de refresh tokens (se aplicável).

### Perfil (`/api/profile`)
* `GET /`: Retorna dados do usuário autenticado.
* `PATCH /`: Atualização parcial de dados (nome, telefone, etc).
* `POST /avatar`: Upload de imagem para Object Storage.

### Transações (`/api/transactions`)
* `GET /`: Listagem com filtros (data, categoria, tipo, busca).
* `POST /`: Criação de nova transação.
* `PUT /:id`: Edição completa.
* `DELETE /:id`: Exclusão lógica ou física.

### Metas e Agenda
* Endpoints CRUD similares para `/api/goals` e `/api/events`.

## 4. Requisitos Não-Funcionais
* **Segurança:** Implementação de CORS restritivo, Helmet.js para headers de segurança e Rate Limiting para evitar ataques de força bruta.
* **Consistência:** Transações bancárias devem usar o tipo `Decimal` ou `Cents (Integer)` para evitar erros de arredondamento de ponto flutuante.
* **Performance:** Indexação em campos de busca frequente (`user_id`, `date`, `email`).
* **Logs:** Registro de atividades críticas e erros para auditoria.

## 5. Instruções de Deploy
1. Configurar variáveis de ambiente (`.env`) incluindo `DATABASE_URL` e `JWT_SECRET`.
2. Executar migrações do banco de dados.
3. Configurar um servidor Nginx como Reverse Proxy.
4. Habilitar SSL/TLS via Let's Encrypt.
