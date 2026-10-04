# Guia de Integração com Backend - VaultLedger

Este guia explica como transformar o VaultLedger de um protótipo local para uma aplicação conectada a um banco de dados real.

## 1. Estrutura do Código (`js/api.js`)

O arquivo `js/api.js` foi atualizado para suportar chamadas de API reais. Procure por esta configuração no topo do arquivo:

```javascript
const USE_REAL_API = false; // Mude para true quando seu backend estiver pronto
const API_BASE_URL = 'https://sua-api.com/api'; // URL do seu servidor
```

### Como funciona:
Quando `USE_REAL_API` for `true`, as funções (como `getTransactions`, `loginUser`, etc.) deixarão de ler do navegador e passarão a fazer requisições `fetch()` para o seu servidor.

---

## 2. Estrutura do Banco de Dados Sugerida

Para suportar as funcionalidades atuais, seu banco de dados deve ter as seguintes tabelas:

### Tabela: `users`
- `id`: UUID ou Integer (Primary Key)
- `name`: String
- `email`: String (Unique)
- `password`: String (Hashed)
- `currency`: String (BRL, USD, EUR)
- `avatar`: String (URL)

### Tabela: `transactions`
- `id`: UUID (PK)
- `user_id`: FK -> users.id
- `description`: String
- `amount`: Decimal/Float
- `category`: String
- `type`: String ('income' ou 'expense')
- `date`: Date/Timestamp

### Tabela: `goals`
- `id`: UUID (PK)
- `user_id`: FK -> users.id
- `title`: String
- `target`: Decimal
- `current`: Decimal
- `color`: String (Hex)

---

## 3. Sugestões de Tecnologia Backend

### Opção A: Supabase (Mais fácil/rápido)
1. Crie um projeto em [supabase.com](https://supabase.com).
2. Use o SQL Editor deles para criar as tabelas acima.
3. No arquivo `js/api.js`, em vez de `fetch`, você pode instalar o `@supabase/supabase-js`.
4. Ele gerencia o login e a segurança automaticamente.

### Opção B: Node.js + Express + Prisma
1. Crie um servidor Node.js.
2. Use **JWT (JSON Web Tokens)** para autenticação.
3. Use o **Prisma ORM** para conectar com um banco PostgreSQL.
4. Garanta que o CORS esteja habilitado no servidor para permitir requisições do seu domínio frontend.

---

## 4. Próximos Passos de Segurança

1. **Tokens:** Atualmente o Token é salvo no `localStorage`. Em produção, considere usar `HttpOnly Cookies` para evitar ataques XSS.
2. **Validação:** Nunca confie nos dados enviados pelo frontend (como o ID do usuário). Sempre valide o dono do recurso no backend usando o token de autenticação.
3. **Senhas:** Nunca salve senhas em texto puro. Use bibliotecas como `bcrypt` para gerar hashes das senhas no servidor.

---

*Este guia foi gerado para auxiliar na transição do VaultLedger para uma escala de produção.*
