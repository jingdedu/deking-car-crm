'use client';

import { useEffect, useMemo, useState } from 'react';
import { supabase } from '@/lib/supabase';
import Field from './Field';

type Props = {
  form: Record<string, any>;
  setForm: (value: Record<string, any>) => void;
};

const PRIORITY = ['현대','기아','제네시스','KG모빌리티','르노코리아','쉐보레'];

function uniq(values: unknown[]): string[] {
  return Array.from(new Set(values.filter((v): v is string => typeof v === 'string' && v.trim() !== '')));
}

function sortBrands(values: string[]): string[] {
  return [...values].sort((a,b)=>{
    const ai = PRIORITY.indexOf(a);
    const bi = PRIORITY.indexOf(b);
    if(ai !== -1 || bi !== -1){
      if(ai === -1) return 1;
      if(bi === -1) return -1;
      return ai - bi;
    }
    return a.localeCompare(b, 'ko');
  });
}

export default function CarSelector({ form, setForm }: Props) {
  const [brands,setBrands] = useState<string[]>([]);
  const [models,setModels] = useState<string[]>([]);
  const [years,setYears] = useState<number[]>([]);
  const [grades,setGrades] = useState<string[]>([]);

  const [brandSearch,setBrandSearch] = useState('');
  const [modelSearch,setModelSearch] = useState('');
  const [gradeSearch,setGradeSearch] = useState('');

  const [loadingBrands,setLoadingBrands] = useState(false);
  const [loadingModels,setLoadingModels] = useState(false);
  const [loadingYears,setLoadingYears] = useState(false);
  const [loadingGrades,setLoadingGrades] = useState(false);

  useEffect(()=>{
    let active = true;
    (async()=>{
      setLoadingBrands(true);
      const {data,error} = await supabase.rpc('get_car_brands');
      if(!active) return;
      if(error) console.error('get_car_brands error:', error);
      setBrands(error ? [] : sortBrands(uniq((data||[]).map((x:any)=>x.brand))));
      setLoadingBrands(false);
    })();
    return ()=>{active=false};
  },[]);

  useEffect(()=>{
    let active = true;
    setModels([]);
    setYears([]);
    setGrades([]);

    if(!form.brand) return;

    (async()=>{
      setLoadingModels(true);
      const {data,error} = await supabase.rpc('get_car_models',{p_brand:form.brand});
      if(!active) return;
      if(error) console.error('get_car_models error:', error);
      setModels(error ? [] : uniq((data||[]).map((x:any)=>x.model)));
      setLoadingModels(false);
    })();

    return ()=>{active=false};
  },[form.brand]);

  useEffect(()=>{
    let active = true;
    setYears([]);
    setGrades([]);

    if(!form.brand || !form.model) return;

    (async()=>{
      setLoadingYears(true);
      const {data,error} = await supabase.rpc('get_car_years',{
        p_brand:form.brand,
        p_model:form.model
      });
      if(!active) return;
      if(error) console.error('get_car_years error:', error);
      setYears(error ? [] : Array.from(new Set((data||[]).map((x:any)=>Number(x.model_year)).filter(Boolean))));
      setLoadingYears(false);
    })();

    return ()=>{active=false};
  },[form.brand,form.model]);

  useEffect(()=>{
    let active = true;
    setGrades([]);

    if(!form.brand || !form.model || !form.year) return;

    (async()=>{
      setLoadingGrades(true);
      const {data,error} = await supabase.rpc('get_car_grades',{
        p_brand:form.brand,
        p_model:form.model,
        p_year:Number(form.year)
      });
      if(!active) return;
      if(error) console.error('get_car_grades error:', error);
      setGrades(error ? [] : uniq((data||[]).map((x:any)=>x.grade)));
      setLoadingGrades(false);
    })();

    return ()=>{active=false};
  },[form.brand,form.model,form.year]);

  const b = useMemo(()=>brands.filter(x=>x.toLowerCase().includes(brandSearch.toLowerCase())),[brands,brandSearch]);
  const m = useMemo(()=>models.filter(x=>x.toLowerCase().includes(modelSearch.toLowerCase())),[models,modelSearch]);
  const g = useMemo(()=>grades.filter(x=>x.toLowerCase().includes(gradeSearch.toLowerCase())),[grades,gradeSearch]);

  return <>
    <Field label="브랜드 / 品牌">
      <input value={brandSearch} onChange={e=>setBrandSearch(e.target.value)} placeholder="브랜드 검색 / 搜索品牌" style={{marginBottom:6}}/>
      <select value={form.brand||''} disabled={loadingBrands} onChange={e=>setForm({...form,brand:e.target.value,model:'',year:'',grade:''})}>
        <option value="">{loadingBrands?'브랜드 로딩중...':'브랜드 선택 / 选择品牌'}</option>
        {b.map(x=><option key={x} value={x}>{x}</option>)}
      </select>
    </Field>

    <Field label="세부모델 / 车型">
      <input value={modelSearch} onChange={e=>setModelSearch(e.target.value)} placeholder="모델 검색 / 搜索车型" disabled={!form.brand} style={{marginBottom:6}}/>
      <select value={form.model||''} disabled={!form.brand||loadingModels} onChange={e=>setForm({...form,model:e.target.value,year:'',grade:''})}>
        <option value="">{loadingModels?'모델 로딩중...':'모델 선택 / 选择车型'}</option>
        {m.map(x=><option key={x} value={x}>{x}</option>)}
      </select>
    </Field>

    <Field label="연식 / 年份">
      <select value={form.year||''} disabled={!form.model||loadingYears} onChange={e=>setForm({...form,year:e.target.value,grade:''})}>
        <option value="">{loadingYears?'연식 로딩중...':'연식 선택 / 选择年份'}</option>
        {years.map(x=><option key={x} value={x}>{x}</option>)}
      </select>
    </Field>

    <Field label="등급 / 配置">
      <input value={gradeSearch} onChange={e=>setGradeSearch(e.target.value)} placeholder="등급 검색 / 搜索配置" disabled={!form.year} style={{marginBottom:6}}/>
      <select value={form.grade||''} disabled={!form.year||loadingGrades} onChange={e=>setForm({...form,grade:e.target.value})}>
        <option value="">{loadingGrades?'등급 로딩중...':'등급 선택 / 选择配置'}</option>
        {g.map(x=><option key={x} value={x}>{x}</option>)}
      </select>
    </Field>
  </>;
}
