-- Create table to store user won prizes
create table public.user_prizes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  prize_id integer references public.roulette_prizes(id) on delete set null,
  prize_label text not null,
  prize_color text not null,
  won_at timestamp with time zone default timezone('utc'::text, now()) not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.user_prizes enable row level security;

-- Policy: Users can view their own won prizes
create policy "Users can view their own prizes"
on public.user_prizes
for select
to authenticated
using (auth.uid() = user_id);

-- Policy: System can insert prizes for authenticated users
create policy "Authenticated users can insert their prizes"
on public.user_prizes
for insert
to authenticated
with check (auth.uid() = user_id);

-- Policy: Admins can view all won prizes
create policy "Admins can view all prizes"
on public.user_prizes
for select
to authenticated
using (public.has_role(auth.uid(), 'admin'));

-- Create index for better query performance
create index idx_user_prizes_user_id on public.user_prizes(user_id);
create index idx_user_prizes_won_at on public.user_prizes(won_at desc);