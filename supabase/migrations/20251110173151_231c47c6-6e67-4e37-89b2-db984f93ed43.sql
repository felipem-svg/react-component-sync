-- Create enum for user roles
create type public.app_role as enum ('admin', 'user');

-- Create user_roles table
create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  role app_role not null default 'user',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique (user_id, role)
);

-- Enable RLS on user_roles
alter table public.user_roles enable row level security;

-- Policy: users can view their own role
create policy "Users can view own role"
on public.user_roles for select
to authenticated
using (auth.uid() = user_id);

-- Create security definer function to check roles
create or replace function public.has_role(_user_id uuid, _role app_role)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.user_roles
    where user_id = _user_id
      and role = _role
  )
$$;

-- Create roulette_prizes table
create table public.roulette_prizes (
  id serial primary key,
  label text not null check (char_length(label) between 1 and 50),
  color text not null,
  position integer not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS on roulette_prizes
alter table public.roulette_prizes enable row level security;

-- Policy: anyone can view prizes (needed for public roulette)
create policy "Anyone can view prizes"
on public.roulette_prizes for select
to anon, authenticated
using (true);

-- Policy: only admins can insert prizes
create policy "Admins can insert prizes"
on public.roulette_prizes for insert
to authenticated
with check (public.has_role(auth.uid(), 'admin'));

-- Policy: only admins can update prizes
create policy "Admins can update prizes"
on public.roulette_prizes for update
to authenticated
using (public.has_role(auth.uid(), 'admin'));

-- Policy: only admins can delete prizes
create policy "Admins can delete prizes"
on public.roulette_prizes for delete
to authenticated
using (public.has_role(auth.uid(), 'admin'));

-- Function to auto-update updated_at timestamp
create or replace function public.update_updated_at_column()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- Trigger for roulette_prizes updated_at
create trigger update_roulette_prizes_updated_at
before update on public.roulette_prizes
for each row
execute function public.update_updated_at_column();

-- Insert default prizes
insert into public.roulette_prizes (label, color, position) values
  ('iPhone 15 Pro', 'bg-gradient-to-br from-purple-500 to-purple-700', 1),
  ('MacBook Air', 'bg-gradient-to-br from-blue-500 to-blue-700', 2),
  ('AirPods Pro', 'bg-gradient-to-br from-green-500 to-green-700', 3),
  ('iPad Mini', 'bg-gradient-to-br from-yellow-500 to-yellow-700', 4),
  ('Apple Watch', 'bg-gradient-to-br from-red-500 to-red-700', 5),
  ('Gift Card $100', 'bg-gradient-to-br from-pink-500 to-pink-700', 6),
  ('Premium Sub', 'bg-gradient-to-br from-orange-500 to-orange-700', 7),
  ('Mystery Box', 'bg-gradient-to-br from-teal-500 to-teal-700', 8);