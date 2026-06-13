-- Resumes table
create table if not exists public.resumes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  name text not null default 'My Resume',
  template_id text not null default 'classic',
  sections jsonb not null default '{"personal":{},"education":{"entries":[]},"skills":{"languages":[],"frameworks":[],"databases":[],"tools":[],"cloud":[],"other":[]},"projects":{"entries":[]},"experience":{"entries":[]},"achievements":{"entries":[]}}'::jsonb,
  target_jd text,
  jd_analysis jsonb,
  ats_score jsonb,
  section_order text[] not null default array['personal','education','skills','projects','experience','achievements'],
  current_section text not null default 'personal',
  version int not null default 1,
  is_archived boolean not null default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.resumes enable row level security;

create policy "Users can CRUD own resumes"
  on public.resumes for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create index idx_resumes_user_id on public.resumes(user_id);
create index idx_resumes_updated_at on public.resumes(updated_at);

-- Resume messages (chat history per resume)
create table if not exists public.resume_messages (
  id uuid primary key default gen_random_uuid(),
  resume_id uuid not null references public.resumes(id) on delete cascade,
  role text not null check (role in ('user','assistant','system')),
  content text not null,
  section text not null,
  created_at timestamptz default now()
);

alter table public.resume_messages enable row level security;

create policy "Users can CRUD own resume messages"
  on public.resume_messages for all
  using (
    exists (
      select 1 from public.resumes
      where resumes.id = resume_messages.resume_id
        and resumes.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.resumes
      where resumes.id = resume_messages.resume_id
        and resumes.user_id = auth.uid()
    )
  );

create index idx_resume_messages_resume_id on public.resume_messages(resume_id);
