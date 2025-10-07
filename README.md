<!-- markdownlint-disable MD033 MD041 -->
<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Conselho Real – 7 Encruzas & Brilhantina

Aplicação React que apresenta informações institucionais, agenda, área restrita para membros e galeria de registros do terreiro Conselho Real.

## Executar localmente

**Pré-requisitos:** Node.js 18 ou superior.

1. Instalar dependências:
   `npm install`
2. Iniciar o servidor de desenvolvimento:
   `npm run dev`

O projeto utiliza Vite. O servidor padrão é exposto em <http://localhost:3000>.

### Credenciais de teste

- **Admin:** `versurih@gmail.com` / `reidas7ebrilhantina`
- **Membro:** `membro@conselhoreal.com` / `visitante123`

## Conectar ao Supabase

1. **Crie um projeto** no [Supabase](https://supabase.com/) e copie a URL pública e a `anon key`.
2. **Configure as variáveis de ambiente** criando um arquivo `.env.local` na raiz do projeto:

   ```env
   VITE_SUPABASE_URL=https://seu-projeto.supabase.co
   VITE_SUPABASE_ANON_KEY=chave-anonima
   ```

3. **Execute o script SQL** localizado em `supabase/schema.sql` dentro do editor SQL do Supabase (ou utilize a CLI) para criar as tabelas, políticas básicas e a função RPC necessária pelo front-end.
4. **Sincronize o administrador padrão** executando `supabase/seed_admin.sql`. O script remove o antigo `admin@conselhoreal.com` e garante que `versurih@gmail.com` esteja presente com papel `ADM`.
5. **Crie um bucket de Storage** chamado `gallery`, defina-o como público e habilite upload anônimo ou via RLS conforme a necessidade do projeto. As imagens da galeria são persistidas nesse bucket e a tabela `gallery_images` armazena apenas metadados e a URL pública.
6. **Ajuste as políticas** de acordo com a estratégia de autenticação desejada. O arquivo gera políticas permissivas para acelerar os testes; restrinja-as antes de ir a produção.
7. **Sincronize o front-end**: sempre que o Supabase estiver configurado, os serviços em `supabase/dataService.ts` passam a buscar e salvar dados remotamente, mantendo os mocks apenas como fallback local.

> **Importante:** crie também um usuário de autenticação (Auth &rarr; Users) no Supabase com o e-mail `versurih@gmail.com` e senha `reidas7ebrilhantina`. A aplicação utiliza `signInWithPassword` quando o backend está ativo.
<!-- markdownlint-enable MD033 MD041 -->
