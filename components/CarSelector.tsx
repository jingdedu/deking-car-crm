'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import Field from './Field';

const koreanPriority = ['현대','기아','제네시스','KG모빌리티','르노코리아','쉐보레'];

function sortBrands(list: string[]) {
  return [...list].sort((a,b)=>{
    const ai = koreanPriority.indexOf(a);
    const bi = koreanPriority.indexOf(b);
    if(ai !== -1 || bi !== -1){
      if(ai === -1) return 1;
      if(bi === -1) return -1;
      return ai - bi;
    }
    return a.localeCompare(b);
  });
}

export default function CarSelector({ form, setForm }: any) {
  const [brands, setBrands] = useState<string[]>([]);
  const [models, setModels] = useState<string[]>([]);
  const [grades, setGrades] = useState<string[]>([]);
  const [brandSearch, setBrandSearch] = useState('');
  const [modelSearch, setModelSearch] = useState('');
  const [gradeSearch, setGradeSearch] = useState('');
  const [loadingModels, setLoadingModels] = useState(false);
  const [loadingGrades, setLoadingGrades] = useState(false);

  useEffect(()=>{
    async function loadBrands(){
      const { data, error } = await supabase.rpc('get_car_brands');
      if(error){
        console.error('get_car_brands error', error);
        setBrands([]);
        return;
      }
      setBrands(sortBrands((data || []).map((x:any)=>x.brand).filter(Boolean)));
    }
    loadBrands();
  },[]);

  useEffect(()=>{
    async function loadModels(){
      setModels([]);
      setGrades([]);
      if(!form.brand) return;
      setLoadingModels(true);
      const { data, error } = await supabase.rpc('get_car_models', { p_brand: form.brand });
      if(error){
        console.error('get_car_models error', error);
        setModels([]);
      }else{
        setModels((data || []).map((x:any)=>x.model).filter(Boolean));
      }
      setLoadingModels(false);
    }
    loadModels();
  },[form.brand]);

  useEffect(()=>{
    async function loadGrades(){
      setGrades([]);
      if(!form.brand || !form.model) return;
      setLoadingGrades(true);
      const { data, error } = await supabase.rpc('get_car_grades', { p_brand: form.brand, p_model: form.model });
      if(error){
        console.error('get_car_grades error', error);
        setGrades([]);
      }else{
        setGrades((data || []).map((x:any)=>x.grade).filter(Boolean));
      }
      setLoadingGrades(false);
    }
    loadGrades();
  },[form.brand, form.model]);

  const brandList = brands.filter(x=>!brandSearch || x.toLowerCase().includes(brandSearch.toLowerCase()));
  const modelList = models.filter(x=>!modelSearch || x.toLowerCase().includes(modelSearch.toLowerCase()));
  const gradeList = grades.filter(x=>!gradeSearch || x.toLowerCase().includes(gradeSearch.toLowerCase()));

  return (
    <>
      <Field label="브랜드 / 品牌">
        <input placeholder="品牌搜索 / 브랜드 검색" value={brandSearch} onChange={e=>setBrandSearch(e.target.value)} style={{marginBottom:6}}/>
        <select value={form.brand || ''} onChange={e=>setForm({...form, brand:e.target.value, model:'', grade:''})}>
          <option value="">브랜드 선택 / 选择品牌</option>
          {brandList.map(x=><option key={x} value={x}>{x}</option>)}
        </select>
      </Field>

      <Field label="세부모델 / 车型">
        <input placeholder="车型搜索 / 모델 검색" value={modelSearch} onChange={e=>setModelSearch(e.target.value)} style={{marginBottom:6}} disabled={!form.brand}/>
        <select value={form.model || ''} onChange={e=>setForm({...form, model:e.target.value, grade:''})} disabled={!form.brand || loadingModels}>
          <option value="">{loadingModels ? '로딩중...' : '모델 선택 / 选择车型'}</option>
          {modelList.map(x=><option key={x} value={x}>{x}</option>)}
        </select>
      </Field>

      <Field label="등급 / 配置">
        <input placeholder="配置搜索 / 등급 검색" value={gradeSearch} onChange={e=>setGradeSearch(e.target.value)} style={{marginBottom:6}} disabled={!form.model}/>
        <select value={form.grade || ''} onChange={e=>setForm({...form, grade:e.target.value})} disabled={!form.model || loadingGrades}>
          <option value="">{loadingGrades ? '로딩중...' : '등급 선택 / 选择配置'}</option>
          {gradeList.slice(0,1000).map(x=><option key={x} value={x}>{x}</option>)}
        </select>
      </Field>
    </>
  );
}
