'use client';

import { useEffect, useMemo, useState } from 'react';
import { supabase } from '@/lib/supabase';
import Field from './Field';

type Props = {
  form: Record<string, any>;
  setForm: (value: Record<string, any>) => void;
  syncYear?: boolean;
};

const PRIORITY = ['현대','기아','제네시스','KG모빌리티','르노코리아','쉐보레'];

function uniqueText(values: unknown[]): string[] {
  return Array.from(
    new Set(
      values.filter(
        (value): value is string =>
          typeof value === 'string' && value.trim().length > 0
      )
    )
  );
}

function sortBrands(values: string[]): string[] {
  return [...values].sort((a, b) => {
    const ai = PRIORITY.indexOf(a);
    const bi = PRIORITY.indexOf(b);

    if (ai !== -1 || bi !== -1) {
      if (ai === -1) return 1;
      if (bi === -1) return -1;
      return ai - bi;
    }

    return a.localeCompare(b, 'ko');
  });
}

function initialYear(form: Record<string, any>): string {
  if (form.year) return String(form.year);
  const match = String(form.grade || '').match(/^\d{4}/);
  return match ? match[0] : '';
}

export default function CarSelector({ form, setForm, syncYear = false }: Props) {
  const [brands, setBrands] = useState<string[]>([]);
  const [models, setModels] = useState<string[]>([]);
  const [years, setYears] = useState<number[]>([]);
  const [grades, setGrades] = useState<string[]>([]);
  const [selectedYear, setSelectedYear] = useState(initialYear(form));

  const [brandSearch, setBrandSearch] = useState('');
  const [modelSearch, setModelSearch] = useState('');
  const [gradeSearch, setGradeSearch] = useState('');

  const [loadingBrands, setLoadingBrands] = useState(false);
  const [loadingModels, setLoadingModels] = useState(false);
  const [loadingYears, setLoadingYears] = useState(false);
  const [loadingGrades, setLoadingGrades] = useState(false);

  useEffect(() => {
    let active = true;

    async function loadBrands() {
      setLoadingBrands(true);
      const { data, error } = await supabase.rpc('get_car_brands');

      if (!active) return;

      if (error) {
        console.error('get_car_brands error:', error);
        setBrands([]);
      } else {
        setBrands(sortBrands(uniqueText((data || []).map((row: any) => row.brand))));
      }

      setLoadingBrands(false);
    }

    loadBrands();
    return () => { active = false; };
  }, []);

  useEffect(() => {
    let active = true;
    setModels([]);
    setYears([]);
    setGrades([]);

    if (!form.brand) return;

    async function loadModels() {
      setLoadingModels(true);
      const { data, error } = await supabase.rpc('get_car_models', {
        p_brand: form.brand,
      });

      if (!active) return;

      if (error) {
        console.error('get_car_models error:', error);
        setModels([]);
      } else {
        setModels(uniqueText((data || []).map((row: any) => row.model)));
      }

      setLoadingModels(false);
    }

    loadModels();
    return () => { active = false; };
  }, [form.brand]);

  useEffect(() => {
    let active = true;
    setYears([]);
    setGrades([]);

    if (!form.brand || !form.model) return;

    async function loadYears() {
      setLoadingYears(true);
      const { data, error } = await supabase.rpc('get_car_years', {
        p_brand: form.brand,
        p_model: form.model,
      });

      if (!active) return;

      if (error) {
        console.error('get_car_years error:', error);
        setYears([]);
      } else {
        const result: number[] = Array.from(
          new Set<number>(
            (data || [])
              .map((row: any) => Number(row.model_year))
              .filter((year: number) => Number.isFinite(year))
          )
        ).sort((a: number, b: number) => b - a);
        setYears(result);

        if (selectedYear && !result.includes(Number(selectedYear))) {
          setSelectedYear('');
        }
      }

      setLoadingYears(false);
    }

    loadYears();
    return () => { active = false; };
  }, [form.brand, form.model]);

  useEffect(() => {
    let active = true;
    setGrades([]);

    if (!form.brand || !form.model || !selectedYear) return;

    async function loadGrades() {
      setLoadingGrades(true);
      const { data, error } = await supabase.rpc('get_car_grades', {
        p_brand: form.brand,
        p_model: form.model,
        p_year: Number(selectedYear),
      });

      if (!active) return;

      if (error) {
        console.error('get_car_grades error:', error);
        setGrades([]);
      } else {
        setGrades(uniqueText((data || []).map((row: any) => row.grade)));
      }

      setLoadingGrades(false);
    }

    loadGrades();
    return () => { active = false; };
  }, [form.brand, form.model, selectedYear]);

  const visibleBrands = useMemo(
    () => brands.filter((item) =>
      item.toLowerCase().includes(brandSearch.trim().toLowerCase())
    ),
    [brands, brandSearch]
  );

  const visibleModels = useMemo(
    () => models.filter((item) =>
      item.toLowerCase().includes(modelSearch.trim().toLowerCase())
    ),
    [models, modelSearch]
  );

  const visibleGrades = useMemo(
    () => grades.filter((item) =>
      item.toLowerCase().includes(gradeSearch.trim().toLowerCase())
    ),
    [grades, gradeSearch]
  );

  function changeBrand(brand: string) {
    setSelectedYear('');
    setModelSearch('');
    setGradeSearch('');

    const next: Record<string, any> = {
      ...form,
      brand,
      model: '',
      grade: '',
    };

    if (syncYear) next.year = '';
    setForm(next);
  }

  function changeModel(model: string) {
    setSelectedYear('');
    setGradeSearch('');

    const next: Record<string, any> = {
      ...form,
      model,
      grade: '',
    };

    if (syncYear) next.year = '';
    setForm(next);
  }

  function changeYear(year: string) {
    setSelectedYear(year);
    setGradeSearch('');

    const next: Record<string, any> = {
      ...form,
      grade: '',
    };

    if (syncYear) next.year = year;
    setForm(next);
  }

  return (
    <>
      <Field label="브랜드 / 品牌">
        <input
          value={brandSearch}
          onChange={(event) => setBrandSearch(event.target.value)}
          placeholder="브랜드 검색 / 搜索品牌"
          style={{ marginBottom: 6 }}
        />
        <select
          value={form.brand || ''}
          disabled={loadingBrands}
          onChange={(event) => changeBrand(event.target.value)}
        >
          <option value="">
            {loadingBrands ? '브랜드 로딩중...' : '브랜드 선택 / 选择品牌'}
          </option>
          {visibleBrands.map((brand) => (
            <option key={brand} value={brand}>{brand}</option>
          ))}
        </select>
      </Field>

      <Field label="세부모델 / 车型">
        <input
          value={modelSearch}
          onChange={(event) => setModelSearch(event.target.value)}
          placeholder="모델 검색 / 搜索车型"
          disabled={!form.brand}
          style={{ marginBottom: 6 }}
        />
        <select
          value={form.model || ''}
          disabled={!form.brand || loadingModels}
          onChange={(event) => changeModel(event.target.value)}
        >
          <option value="">
            {loadingModels ? '모델 로딩중...' : '모델 선택 / 选择车型'}
          </option>
          {visibleModels.map((model) => (
            <option key={model} value={model}>{model}</option>
          ))}
        </select>
      </Field>

      <Field label="연식 / 年份">
        <select
          value={selectedYear}
          disabled={!form.model || loadingYears}
          onChange={(event) => changeYear(event.target.value)}
        >
          <option value="">
            {loadingYears ? '연식 로딩중...' : '연식 선택 / 选择年份'}
          </option>
          {years.map((year) => (
            <option key={year} value={year}>{year}</option>
          ))}
        </select>
      </Field>

      <Field label="등급 / 配置">
        <input
          value={gradeSearch}
          onChange={(event) => setGradeSearch(event.target.value)}
          placeholder="등급 검색 / 搜索配置"
          disabled={!selectedYear}
          style={{ marginBottom: 6 }}
        />
        <select
          value={form.grade || ''}
          disabled={!selectedYear || loadingGrades}
          onChange={(event) => setForm({ ...form, grade: event.target.value })}
        >
          <option value="">
            {loadingGrades ? '등급 로딩중...' : '등급 선택 / 选择配置'}
          </option>
          {visibleGrades.map((grade) => (
            <option key={grade} value={grade}>{grade}</option>
          ))}
        </select>
      </Field>
    </>
  );
}
