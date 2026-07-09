import Field from './Field';

export default function CarSelector({ form, setForm, brands, modelOptions, gradeOptions }: any) {
  const models = modelOptions(form.brand || '');
  const grades = gradeOptions(form.brand || '', form.model || '');

  return <>
    <Field label="브랜드 / 品牌">
      <select value={form.brand || ''} onChange={e=>setForm({...form, brand:e.target.value, model:'', grade:''})}>
        <option value="">브랜드 선택 / 选择品牌</option>
        {brands.map((x:string)=><option key={x} value={x}>{x}</option>)}
      </select>
    </Field>
    <Field label="세부모델 / 车型">
      <select value={form.model || ''} onChange={e=>setForm({...form, model:e.target.value, grade:''})} disabled={!form.brand}>
        <option value="">모델 선택 / 选择车型</option>
        {models.map((x:string)=><option key={x} value={x}>{x}</option>)}
      </select>
    </Field>
    <Field label="등급 / 配置">
      <select value={form.grade || ''} onChange={e=>setForm({...form, grade:e.target.value})} disabled={!form.model}>
        <option value="">등급 선택 / 选择配置</option>
        {grades.map((x:string)=><option key={x} value={x}>{x}</option>)}
      </select>
    </Field>
  </>;
}
