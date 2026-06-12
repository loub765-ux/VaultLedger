# Modelo de Dados e Especificação de Banco de Dados - VaultLedger

Este documento detalha a arquitetura de persistência de dados recomendada para o VaultLedger, focando em integridade financeira, segurança e escalabilidade.

## 1. Arquitetura de Persistência
Embora o protótipo atual opere em um ambiente controlado, uma implementação de produção deve utilizar um **Banco de Dados Relacional (RDBMS)**, preferencialmente **PostgreSQL**, devido ao seu suporte robusto a transações ACID, que são críticas para dados financeiros.

## 2. Diagrama de Entidade-Relacionamento (Conceitual)
* **Usuário (1:N) Transações:** Um usuário possui múltiplas movimentações.
* **Usuário (1:N) Categorias:** Um usuário define suas próprias categorias.
* **Usuário (1:N) Metas:** Um usuário gerencia seus objetivos financeiros.
* **Categoria (1:N) Transações:** Cada transação pertence a uma categoria específica.

## 3. Dicionário de Dados

### Tabela: `usuarios` (User Profiles)
Responsável por armazenar dados de identidade e configurações de perfil.
| Campo | Tipo | Restrições | Descrição |
|-------|------|------------|-----------|
| `id` | UUID | PK, Auto | Identificador único universal. |
| `nome` | VARCHAR(100) | NOT NULL | Nome completo do usuário. |
| `email` | VARCHAR(150) | UNIQUE, INDEX | E-mail para autenticação. |
| `senha_hash`| TEXT | NOT NULL | Hash seguro (BCrypt/Argon2). |
| `avatar_url`| TEXT | NULL | Link para imagem de perfil. |
| `telefone` | VARCHAR(20) | NULL | Contato telefônico. |
| `criado_em` | TIMESTAMP | DEFAULT NOW | Data de registro. |

### Tabela: `transacoes` (Financial Records)
O coração da plataforma, registrando todo o fluxo de caixa.
| Campo | Tipo | Restrições | Descrição |
|-------|------|------------|-----------|
| `id` | UUID | PK, Auto | Identificador da transação. |
| `usuario_id`| UUID | FK (usuarios.id) | Proprietário do registro. |
| `cat_id` | UUID | FK (categorias.id)| Vínculo com categoria. |
| `descricao` | VARCHAR(255) | NOT NULL | Detalhamento da transação. |
| `valor` | DECIMAL(15,2)| NOT NULL | Montante (positivo ou negativo).|
| `tipo` | ENUM | 'receita', 'despesa'| Clasificação do fluxo. |
| `data_trans`| DATE | NOT NULL | Data em que ocorreu. |

### Tabela: `metas` (Financial Goals)
Monitoramento de objetivos de poupança.
| Campo | Tipo | Restrições | Descrição |
|-------|------|------------|-----------|
| `id` | UUID | PK | Identificador da meta. |
| `usuario_id`| UUID | FK (usuarios.id) | Dono da meta. |
| `titulo` | VARCHAR(100) | NOT NULL | Nome do objetivo. |
| `alvo` | DECIMAL(15,2)| NOT NULL | Valor pretendido. |
| `atual` | DECIMAL(15,2)| DEFAULT 0 | Valor já poupado. |
| `cor_hexa` | VARCHAR(7) | DEFAULT '#EAB308'| Identificação visual. |

## 4. Integridade e Segurança
* **Precisão Decimal:** Nunca utilize tipos `Float` ou `Double` para valores financeiros. Utilize sempre `Decimal(15,2)` ou armazene em centavos (Integer) para evitar erros de arredondamento.
* **Soft Delete:** Para transações, recomenda-se o uso de uma coluna `deleted_at` em vez de exclusão física, permitindo auditoria e recuperação de dados.
* **Índices:** Aplicar índices em `usuario_id` e `data_trans` para garantir que as consultas de dashboard e relatórios sejam instantâneas mesmo com milhões de registros.

## 5. Estratégia de Cache
Para uma performance otimizada (SaaS), os totais de saldo e progresso de metas devem ser cacheados em uma camada de memória (ex: Redis), sendo invalidados apenas quando uma nova transação for registrada.
