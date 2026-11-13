create extension if not exists pgcrypto;
create type public."RequestStatus" as enum ('NEW', 'CONTACTED', 'IN_PROGRESS', 'CLOSED', 'CANCELLED');

create table public."AdminUser" (
  id text primary key default gen_random_uuid()::text, email text not null unique,
  "passwordHash" text not null, active boolean not null default true,
  "createdAt" timestamptz not null default now(), "updatedAt" timestamptz not null default now()
);
create table public."Professional" (
  id text primary key default gen_random_uuid()::text, name text not null, specialty text not null,
  phone text not null, email text, city text not null, zones text not null, qualifications text not null,
  verified boolean not null default false, available boolean not null default true, notes text not null default '',
  "createdAt" timestamptz not null default now(), "updatedAt" timestamptz not null default now()
);
create table public."ProjectRequest" (
  id text primary key default gen_random_uuid()::text, reference text not null unique,
  "submissionKey" text not null unique, "professionalType" text not null, "workType" text not null,
  "buildingType" text not null, city text not null, district text not null, budget text not null,
  name text not null, phone text not null, description text not null, "consentAt" timestamptz not null default now(),
  status public."RequestStatus" not null default 'NEW',
  "professionalId" text references public."Professional"(id) on delete set null on update cascade,
  "notificationSentAt" timestamptz, "createdAt" timestamptz not null default now(), "updatedAt" timestamptz not null default now()
);
create table public."RequestActivity" (
  id text primary key default gen_random_uuid()::text,
  "requestId" text not null references public."ProjectRequest"(id) on delete cascade on update cascade,
  "adminId" text references public."AdminUser"(id) on delete set null on update cascade,
  message text not null, "createdAt" timestamptz not null default now(), "updatedAt" timestamptz not null default now()
);
create table public."RateLimit" (key text primary key, count integer not null default 1, "expiresAt" timestamptz not null);

create index "Professional_city_specialty_idx" on public."Professional"(city, specialty);
create index "ProjectRequest_city_district_workType_status_idx" on public."ProjectRequest"(city, district, "workType", status);
create index "ProjectRequest_createdAt_idx" on public."ProjectRequest"("createdAt");
create index "RequestActivity_requestId_createdAt_idx" on public."RequestActivity"("requestId", "createdAt");

alter table public."AdminUser" enable row level security;
alter table public."Professional" enable row level security;
alter table public."ProjectRequest" enable row level security;
alter table public."RequestActivity" enable row level security;
alter table public."RateLimit" enable row level security;
revoke all on public."AdminUser", public."Professional", public."ProjectRequest", public."RequestActivity", public."RateLimit" from anon, authenticated;
grant all on public."AdminUser", public."Professional", public."ProjectRequest", public."RequestActivity", public."RateLimit" to service_role;

create or replace function public.check_rate_limit(p_key text, p_limit integer)
returns boolean language plpgsql security definer set search_path = '' as $$
declare next_count integer;
begin
  insert into public."RateLimit" (key,count,"expiresAt") values (p_key,1,now()+interval '15 minutes')
  on conflict (key) do update set
    count=case when public."RateLimit"."expiresAt" < now() then 1 else public."RateLimit".count+1 end,
    "expiresAt"=case when public."RateLimit"."expiresAt" < now() then now()+interval '15 minutes' else public."RateLimit"."expiresAt" end
  returning count into next_count;
  return next_count <= p_limit;
end; $$;

create or replace function public.submit_project_request(p_request jsonb,p_submission_key text,p_reference text)
returns setof public."ProjectRequest" language plpgsql security definer set search_path = '' as $$
declare saved public."ProjectRequest";
begin
  insert into public."ProjectRequest" (reference,"submissionKey","professionalType","workType","buildingType",city,district,budget,name,phone,description)
  values (p_reference,p_submission_key,p_request->>'professionalType',p_request->>'workType',p_request->>'buildingType',p_request->>'city',p_request->>'district',p_request->>'budget',p_request->>'name',p_request->>'phone',coalesce(p_request->>'description',''))
  on conflict ("submissionKey") do nothing returning * into saved;
  if saved.id is null then
    select * into saved from public."ProjectRequest" where "submissionKey"=p_submission_key;
  else
    insert into public."RequestActivity" ("requestId",message) values (saved.id,'Demande reçue');
  end if;
  return next saved;
end; $$;

create or replace function public.update_project_request(p_id text,p_status public."RequestStatus",p_professional_id text,p_admin_id text,p_note text)
returns void language plpgsql security definer set search_path = '' as $$
declare old_status public."RequestStatus"; old_professional_id text; entry text;
begin
  select status,"professionalId" into old_status,old_professional_id from public."ProjectRequest" where id=p_id for update;
  if not found then raise exception 'Request not found'; end if;
  update public."ProjectRequest" set status=p_status,"professionalId"=nullif(p_professional_id,''),"updatedAt"=now() where id=p_id;
  if old_status is distinct from p_status then
    insert into public."RequestActivity" ("requestId","adminId",message) values (p_id,p_admin_id,'Statut : '||old_status::text||' → '||p_status::text);
  end if;
  if old_professional_id is distinct from nullif(p_professional_id,'') then
    insert into public."RequestActivity" ("requestId","adminId",message) values (p_id,p_admin_id,'Attribution : '||coalesce(nullif(p_professional_id,''),'aucun'));
  end if;
  entry:=nullif(trim(p_note),'');
  if entry is not null then insert into public."RequestActivity" ("requestId","adminId",message) values (p_id,p_admin_id,'Note : '||entry); end if;
end; $$;
revoke all on function public.check_rate_limit(text,integer) from public,anon,authenticated;
revoke all on function public.submit_project_request(jsonb,text,text) from public,anon,authenticated;
revoke all on function public.update_project_request(text,public."RequestStatus",text,text,text) from public,anon,authenticated;
grant execute on function public.check_rate_limit(text,integer) to service_role;
grant execute on function public.submit_project_request(jsonb,text,text) to service_role;
grant execute on function public.update_project_request(text,public."RequestStatus",text,text,text) to service_role;

-- Public health probe: contains no user data and permits only this fixed-row read.
create table public.heartbeat (id smallint primary key check (id=1));
insert into public.heartbeat(id) values (1);
alter table public.heartbeat enable row level security;
grant select on public.heartbeat to anon,authenticated;
create policy "Public read of non-sensitive heartbeat row" on public.heartbeat for select to anon,authenticated using (true);
