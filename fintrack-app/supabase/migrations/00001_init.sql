-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Create profiles table
create table public.users_profiles (
  id uuid references auth.users(id) on delete cascade not null primary key,
  display_name text,
  currency text default 'LKR' not null,
  monthly_budget numeric(12,2),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create categories table
create table public.categories (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id) on delete cascade, -- null means it is a default category
  name text not null,
  emoji text,
  color text,
  is_default boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create transactions table
create table public.transactions (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  amount numeric(12,2) not null check (amount > 0),
  type text not null check (type in ('income', 'expense')),
  category_id uuid references public.categories(id) on delete set null,
  description text,
  transaction_date date not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS Setup
alter table public.users_profiles enable row level security;
alter table public.categories enable row level security;
alter table public.transactions enable row level security;

-- Policies for users_profiles
create policy "Users can view own profile"
  on public.users_profiles for select
  using ( auth.uid() = id );

create policy "Users can insert own profile"
  on public.users_profiles for insert
  with check ( auth.uid() = id );

create policy "Users can update own profile"
  on public.users_profiles for update
  using ( auth.uid() = id );

-- Policies for categories
create policy "Users can view default categories or their own"
  on public.categories for select
  using ( user_id is null or auth.uid() = user_id );

create policy "Users can insert own categories"
  on public.categories for insert
  with check ( auth.uid() = user_id );

create policy "Users can update own categories"
  on public.categories for update
  using ( auth.uid() = user_id );

create policy "Users can delete own categories"
  on public.categories for delete
  using ( auth.uid() = user_id );

-- Policies for transactions
create policy "Users can view own transactions"
  on public.transactions for select
  using ( auth.uid() = user_id );

create policy "Users can insert own transactions"
  on public.transactions for insert
  with check ( auth.uid() = user_id );

create policy "Users can update own transactions"
  on public.transactions for update
  using ( auth.uid() = user_id );

create policy "Users can delete own transactions"
  on public.transactions for delete
  using ( auth.uid() = user_id );

-- Seed Default Categories
insert into public.categories (name, emoji, color, is_default) values
  ('Food', '🍔', '#ef4444', true),
  ('Transport', '🚗', '#3b82f6', true),
  ('Rent', '🏠', '#10b981', true),
  ('Health', '💊', '#f59e0b', true),
  ('Entertainment', '🎮', '#8b5cf6', true),
  ('Salary', '💼', '#14b8a6', true),
  ('Other', '📦', '#64748b', true);

-- Functions and Triggers
-- Create a trigger function to automatically create a user profile
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.users_profiles (id, display_name)
  values (new.id, new.raw_user_meta_data->>'display_name');
  return new;
end;
$$ language plpgsql security definer;

-- Trigger to call the function on user creation
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Trigger to update updated_at on transactions
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger on_transaction_updated
  before update on public.transactions
  for each row execute procedure public.handle_updated_at();

create trigger on_profile_updated
  before update on public.users_profiles
  for each row execute procedure public.handle_updated_at();
