-- DeKing CRM Professional V4.0 基础表结构
-- 如果你之前已经建好表，可以不运行。缺表时再运行。

create extension if not exists "pgcrypto";

create table if not exists customers (
  id uuid primary key default gen_random_uuid(),
  customer_no text,
  name text,
  phone text,
  wechat text,
  kakao text,
  source text,
  brand text,
  model text,
  grade text,
  budget numeric,
  status text,
  probability text,
  last_contact date,
  next_contact date,
  memo text,
  created_at timestamp default now()
);

create table if not exists vehicle_search (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid,
  auction_place text,
  brand text,
  model text,
  grade text,
  year integer,
  mileage numeric,
  color text,
  condition text,
  start_price numeric,
  expected_price numeric,
  market_price numeric,
  auction_date date,
  feedback text,
  memo text,
  created_at timestamp default now()
);

create table if not exists auctions (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid,
  auction_date date,
  auction_place text,
  max_bid numeric,
  final_price numeric,
  result text,
  memo text,
  created_at timestamp default now()
);

create table if not exists deals (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid,
  deal_date date,
  brand text,
  model text,
  grade text,
  deal_price numeric,
  broker_fee numeric,
  loan_fee numeric,
  insurance_fee numeric,
  extra_profit numeric,
  car_profit numeric,
  delivery_date date,
  memo text,
  created_at timestamp default now()
);

create table if not exists follow_logs (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid,
  contact_date date,
  method text,
  content text,
  next_contact date,
  memo text,
  created_at timestamp default now()
);

alter table customers enable row level security;
alter table vehicle_search enable row level security;
alter table auctions enable row level security;
alter table deals enable row level security;
alter table follow_logs enable row level security;

drop policy if exists "public all customers" on customers;
drop policy if exists "public all vehicle_search" on vehicle_search;
drop policy if exists "public all auctions" on auctions;
drop policy if exists "public all deals" on deals;
drop policy if exists "public all follow_logs" on follow_logs;

create policy "public all customers" on customers for all to anon, authenticated using (true) with check (true);
create policy "public all vehicle_search" on vehicle_search for all to anon, authenticated using (true) with check (true);
create policy "public all auctions" on auctions for all to anon, authenticated using (true) with check (true);
create policy "public all deals" on deals for all to anon, authenticated using (true) with check (true);
create policy "public all follow_logs" on follow_logs for all to anon, authenticated using (true) with check (true);
