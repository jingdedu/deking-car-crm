import Field from './Field';
export default function CarSelector({ form, setForm, brands, modelOptions, gradeOptions }: any) {
  return <>
    <Field label="브랜드 / 品牌"><select value={form.brand||''} onChange={e=>setForm({...form,brand:e.target.value,model:'',grade:''})}><option value="">선택</option>{brands.map((x:string)=><option key={x}>{x}</option>)}</select></Field>
    <Field label="세부모델 / 车型"><select value={form.model||''} onChange={e=>setForm({...form,model:e.target.value,grade:''})}><option value="">선택</option>{modelOptions(form.brand).map((x:string)=><option key={x}>{x}</option>)}</select></Field>
    <Field label="등급 / 配置"><select value={form.grade||''} onChange={e=>setForm({...form,grade:e.target.value})}><option value="">선택</option>{gradeOptions(form.brand,form.model).map((x:string)=><option key={x}>{x}</option>)}</select></Field>
  </>;
}
