-- Sincroniza o administrador padrão no banco de dados do Supabase.
-- Execute este script após atualizar as credenciais no painel de autenticação.

-- Remove o administrador antigo, caso ainda exista.
delete from public.users where email = 'admin@conselhoreal.com';

-- Garante que o novo administrador exista com o papel correto.
insert into public.users (name, email, role)
values ('Henrique Versuri', 'versurih@gmail.com', 'ADM')
on conflict (email) do update
set name = excluded.name,
    role = excluded.role;
