-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- PROFILES (Users)
create table public.profiles (
  id uuid references auth.users not null primary key,
  full_name text,
  avatar_url text,
  email text,
  
  -- Body Measurements (JSONB for flexibility)
  measurements jsonb default '{}'::jsonb,
  
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- PRODUCTS
create table public.products (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  brand text not null,
  price decimal(10, 2) not null,
  original_price decimal(10, 2),
  description text,
  category text not null,
  
  -- Images (Array of URLs)
  images text[] default '{}',
  
  -- AR Features
  model_3d_url text,
  has_ar boolean default false,
  
  -- Status
  is_new boolean default false,
  is_featured boolean default false,
  stock integer default 0,
  
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS POLICIES

-- Profiles: Public read, Owner write
alter table public.profiles enable row level security;

create policy "Public profiles are viewable by everyone."
  on public.profiles for select
  using ( true );

create policy "Users can insert their own profile."
  on public.profiles for insert
  with check ( auth.uid() = id );

create policy "Users can update own profile."
  on public.profiles for update
  using ( auth.uid() = id );

-- Products: Public read, Admin write (mocked as public for now or restricted)
alter table public.products enable row level security;

create policy "Products are viewable by everyone."
  on public.products for select
  using ( true );

-- For now, allow no-one to insert/update products via client (Admin only via dashboard)
-- Or add a policy if you have an admin role system.
