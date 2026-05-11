-- Use one shared MindCET workspace for all users and all services.
-- This keeps the existing workspace-based RLS model, but prevents each Google
-- account from getting a separate service catalog.

do $$
declare
  shared_workspace_id uuid;
begin
  select id
    into shared_workspace_id
    from public.workspaces
   where name = 'MindCET'
   order by created_at asc
   limit 1;

  if shared_workspace_id is null then
    insert into public.workspaces (name, default_currency)
    values ('MindCET', 'USD')
    returning id into shared_workspace_id;
  end if;

  -- Prevent unique(workspace_id, email) conflicts when old personal
  -- workspaces contain the same connected Gmail account.
  delete from public.email_accounts ea
  using (
    select id,
           row_number() over (
             partition by lower(email)
             order by (provider_refresh_token is not null) desc, created_at desc
           ) as row_number
      from public.email_accounts
  ) ranked
  where ea.id = ranked.id
    and ranked.row_number > 1;

  -- Prevent unique(workspace_id, source_email_id) conflicts for invoices
  -- imported from the same Gmail message in more than one old workspace.
  delete from public.invoices invoice
  using (
    select id,
           row_number() over (
             partition by source_email_id
             order by created_at desc
           ) as row_number
      from public.invoices
     where source_email_id is not null
  ) ranked
  where invoice.id = ranked.id
    and ranked.row_number > 1;

  update public.services
     set workspace_id = shared_workspace_id
   where workspace_id <> shared_workspace_id;

  update public.invoices
     set workspace_id = shared_workspace_id
   where workspace_id <> shared_workspace_id;

  update public.reminders
     set workspace_id = shared_workspace_id
   where workspace_id <> shared_workspace_id;

  update public.email_accounts
     set workspace_id = shared_workspace_id
   where workspace_id <> shared_workspace_id;

  update public.profiles
     set workspace_id = shared_workspace_id,
         role = case when role = 'owner' then role else 'member' end
   where workspace_id <> shared_workspace_id;
end $$;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare
  shared_workspace_id uuid;
begin
  select id
    into shared_workspace_id
    from public.workspaces
   where name = 'MindCET'
   order by created_at asc
   limit 1;

  if shared_workspace_id is null then
    insert into public.workspaces (name, default_currency)
    values ('MindCET', 'USD')
    returning id into shared_workspace_id;
  end if;

  insert into public.profiles (id, workspace_id, display_name, avatar_url, role)
  values (
    new.id,
    shared_workspace_id,
    coalesce(new.raw_user_meta_data->>'full_name', new.email),
    new.raw_user_meta_data->>'avatar_url',
    'member'
  );

  return new;
end;
$$;
