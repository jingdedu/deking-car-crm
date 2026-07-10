-- DeKing CRM Professional V4.1 FULL
-- 品牌 → 车型 → 年份 → 配置 按需查询

create index if not exists idx_car_models_v3_brand_model_year
on car_models_v3 (brand, model, model_year);

create or replace function get_car_brands()
returns table(brand text)
language sql
security definer
set search_path = public
as $$
  select trim(brand) as brand
  from car_models_v3
  where brand is not null and trim(brand) <> ''
  group by trim(brand)
  order by
    case trim(brand)
      when '현대' then 1
      when '기아' then 2
      when '제네시스' then 3
      when 'KG모빌리티' then 4
      when '르노코리아' then 5
      when '쉐보레' then 6
      else 100
    end,
    trim(brand);
$$;

create or replace function get_car_models(p_brand text)
returns table(model text)
language sql
security definer
set search_path = public
as $$
  select trim(model) as model
  from car_models_v3
  where trim(brand) = trim(p_brand)
    and model is not null
    and trim(model) <> ''
  group by trim(model)
  order by trim(model);
$$;

create or replace function get_car_years(p_brand text, p_model text)
returns table(model_year integer)
language sql
security definer
set search_path = public
as $$
  select distinct car_models_v3.model_year
  from car_models_v3
  where trim(brand) = trim(p_brand)
    and trim(model) = trim(p_model)
    and car_models_v3.model_year is not null
  order by car_models_v3.model_year desc;
$$;

create or replace function get_car_grades(
  p_brand text,
  p_model text,
  p_year integer
)
returns table(grade text)
language sql
security definer
set search_path = public
as $$
  select distinct concat_ws(
    ' ',
    model_year,
    nullif(trim(engine),''),
    nullif(trim(drivetrain),''),
    nullif(trim(car_models_v3.trim),'')
  ) as grade
  from car_models_v3
  where trim(brand) = trim(p_brand)
    and trim(model) = trim(p_model)
    and model_year = p_year
  order by grade;
$$;

grant execute on function get_car_brands() to anon, authenticated;
grant execute on function get_car_models(text) to anon, authenticated;
grant execute on function get_car_years(text,text) to anon, authenticated;
grant execute on function get_car_grades(text,text,integer) to anon, authenticated;

select * from get_car_brands();
