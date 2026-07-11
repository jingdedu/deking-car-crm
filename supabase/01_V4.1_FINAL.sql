-- DeKing CRM V4.1 FINAL
-- 在 Supabase SQL Editor 整段运行一次。不会删除 car_models_v3。
create extension if not exists pgcrypto;

create table if not exists public.customers (
 id uuid primary key default gen_random_uuid(), customer_no text, name text, phone text, wechat text, kakao text,
 source text, brand text, model text, grade text, budget numeric, year_request text, mileage_request bigint,
 color text, loan text, probability text, status text default '新客户', last_contact date, next_contact date,
 memo text, created_at timestamptz default now()
);
create table if not exists public.vehicle_search (
 id uuid primary key default gen_random_uuid(), customer_id uuid references public.customers(id) on delete cascade,
 record_date date default current_date, auction_place text, brand text, model text, grade text, year int, mileage bigint,
 color text, vehicle_ref text, market_price numeric, expected_price numeric, customer_max_price numeric,
 auction_date date, result text default '待确认', final_price numeric, feedback text, memo text, created_at timestamptz default now()
);
create table if not exists public.deals (
 id uuid primary key default gen_random_uuid(), customer_id uuid references public.customers(id) on delete set null,
 deal_date date default current_date, brand text, model text, grade text, year int, deal_price numeric default 0,
 broker_fee numeric default 0, car_profit numeric default 0, loan_fee numeric default 0, insurance_fee numeric default 0,
 extra_profit numeric default 0, expense numeric default 0, total_profit numeric default 0, delivery_date date,
 after_sales_reminder text, memo text, created_at timestamptz default now()
);

alter table public.customers add column if not exists year_request text;
alter table public.customers add column if not exists mileage_request bigint;
alter table public.customers add column if not exists color text;
alter table public.customers add column if not exists loan text;
alter table public.vehicle_search add column if not exists record_date date default current_date;
alter table public.vehicle_search add column if not exists grade text;
alter table public.vehicle_search add column if not exists vehicle_ref text;
alter table public.vehicle_search add column if not exists customer_max_price numeric;
alter table public.vehicle_search add column if not exists result text default '待确认';
alter table public.vehicle_search add column if not exists final_price numeric;
alter table public.deals add column if not exists expense numeric default 0;
alter table public.deals add column if not exists total_profit numeric default 0;
alter table public.deals add column if not exists after_sales_reminder text;

create index if not exists idx_customers_next_contact on public.customers(next_contact);
create index if not exists idx_vehicle_search_auction_date on public.vehicle_search(auction_date);
create index if not exists idx_deals_deal_date on public.deals(deal_date);
create index if not exists idx_car_models_v3_brand_model on public.car_models_v3(brand,model);

create or replace function public.get_car_brands()
returns table(brand text) language sql stable security definer set search_path=public as $$
 select distinct cm.brand::text from public.car_models_v3 cm where cm.brand is not null and btrim(cm.brand)<>'' order by 1;
$$;
create or replace function public.get_car_models(p_brand text)
returns table(model text) language sql stable security definer set search_path=public as $$
 select distinct cm.model::text from public.car_models_v3 cm where cm.brand=p_brand and cm.model is not null and btrim(cm.model)<>'' order by 1;
$$;
create or replace function public.get_car_grades(p_brand text,p_model text)
returns table(grade text) language sql stable security definer set search_path=public as $$
 select distinct coalesce(nullif(cm.grade,''),concat_ws(' ',cm.model_year::text,cm.engine,cm.drivetrain,cm.trim))::text
 from public.car_models_v3 cm where cm.brand=p_brand and cm.model=p_model
 and coalesce(nullif(cm.grade,''),concat_ws(' ',cm.model_year::text,cm.engine,cm.drivetrain,cm.trim))<>''
 order by 1;
$$;
grant execute on function public.get_car_brands() to anon,authenticated;
grant execute on function public.get_car_models(text) to anon,authenticated;
grant execute on function public.get_car_grades(text,text) to anon,authenticated;

alter table public.customers enable row level security;
alter table public.vehicle_search enable row level security;
alter table public.deals enable row level security;
drop policy if exists "v41 customers access" on public.customers;
drop policy if exists "v41 vehicle access" on public.vehicle_search;
drop policy if exists "v41 deals access" on public.deals;
create policy "v41 customers access" on public.customers for all to anon,authenticated using (true) with check (true);
create policy "v41 vehicle access" on public.vehicle_search for all to anon,authenticated using (true) with check (true);
create policy "v41 deals access" on public.deals for all to anon,authenticated using (true) with check (true);

select count(*) as car_rows,count(distinct brand) as brands,min(model_year) as min_year,max(model_year) as max_year from public.car_models_v3;
