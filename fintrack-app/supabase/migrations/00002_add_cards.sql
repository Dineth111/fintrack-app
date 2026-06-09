-- Create payment_cards table
create table if not exists public.payment_cards (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  card_holder_name text not null,
  card_provider text not null, -- 'Visa', 'Mastercard', 'Amex', 'Discover', etc.
  card_number_last_4 text not null check (length(card_number_last_4) = 4),
  expiry_date text not null, -- e.g., '12/29'
  color text default '#2563eb' not null, -- Hex color or gradient config
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.payment_cards enable row level security;

-- Policies for payment_cards
create policy "Users can view own cards" on public.payment_cards
  for select using ( auth.uid() = user_id );

create policy "Users can insert own cards" on public.payment_cards
  for insert with check ( auth.uid() = user_id );

create policy "Users can update own cards" on public.payment_cards
  for update using ( auth.uid() = user_id );

create policy "Users can delete own cards" on public.payment_cards
  for delete using ( auth.uid() = user_id );

-- Update transactions table to optionally link to a card
alter table public.transactions add column if not exists card_id uuid references public.payment_cards(id) on delete set null;
