'use client';
import {useEffect,useMemo,useState} from 'react';
import {supabase} from '@/lib/supabase';
type R=Record<string,any>;
const today=()=>new Date().toISOString().slice(0,10);
const money=(v:any)=>Number(v||0).toLocaleString();
const pages=[['dash','📊','工作台'],['customers','👥','客户管理'],['cars','🔍','找车竞拍'],['deals','💰','成交利润'],['quote','🧾','报价单']];
const statusList=['新客户','已联系','找车中','已推荐','待竞拍','已成交','暂停','无效'];
const sourceList=['抖音','小红书','直播','微信','Kakao','朋友介绍','其他'];
const resultList=['待确认','准备竞拍','未中标','已中标','放弃'];
function F({label,children}:{label:string,children:any}){return <div className="field"><label>{label}</label>{children}</div>}
function Table({h,rows}:{h:string[],rows:any[][]}){return <div className="tablewrap"><table className="table"><thead><tr>{h.map(x=><th key={x}>{x}</th>)}</tr></thead><tbody>{rows.map((r,i)=><tr key={i}>{r.map((x,j)=><td key={j}>{x}</td>)}</tr>)}</tbody></table></div>}
function VehicleSelector({form,setForm,brands}:{form:R,setForm:(v:R)=>void,brands:string[]}){
 const [models,setModels]=useState<string[]>([]);
 const [loadingModels,setLoadingModels]=useState(false);

 useEffect(()=>{
  let active=true;
  setModels([]);
  if(!form.brand)return;
  setLoadingModels(true);
  supabase.rpc('get_car_models',{p_brand:form.brand}).then(({data,error})=>{
   if(!active)return;
   if(error){
    console.error('get_car_models:',error);
    setModels([]);
   }else{
    setModels((data||[]).map((x:any)=>x.model).filter(Boolean));
   }
   setLoadingModels(false);
  });
  return()=>{active=false};
 },[form.brand]);

 return <>
  <F label="品牌 / 브랜드">
   <select value={form.brand||''} onChange={e=>setForm({...form,brand:e.target.value,model:'',grade:''})}>
    <option value="">选择品牌</option>
    {brands.map(x=><option key={x} value={x}>{x}</option>)}
   </select>
  </F>
  <F label="车型 / 세부모델">
   <select value={form.model||''} disabled={!form.brand||loadingModels} onChange={e=>setForm({...form,model:e.target.value,grade:''})}>
    <option value="">{loadingModels?'车型加载中...':'选择车型'}</option>
    {models.map(x=><option key={x} value={x}>{x}</option>)}
   </select>
  </F>
  <F label="配置 / 等级 / 트림">
   <input
    value={form.grade||''}
    onChange={e=>setForm({...form,grade:e.target.value})}
    placeholder="按车辆广告填写，例如：1.6 가솔린 프레스티지"
   />
  </F>
 </>;
}
export default function Home(){
 const [page,setPage]=useState('dash'),[loading,setLoading]=useState(true),[customers,setCustomers]=useState<R[]>([]),[cars,setCars]=useState<R[]>([]),[deals,setDeals]=useState<R[]>([]),[modal,setModal]=useState<any>(null),[search,setSearch]=useState('');
 const [brands,setBrands]=useState<string[]>([]);
 async function load(){setLoading(true);const[c,v,d,b]=await Promise.all([supabase.from('customers').select('*').order('created_at',{ascending:false}),supabase.from('vehicle_search').select('*').order('created_at',{ascending:false}),supabase.from('deals').select('*').order('deal_date',{ascending:false}),supabase.rpc('get_car_brands')]);setCustomers(c.data||[]);setCars(v.data||[]);setDeals(d.data||[]);setBrands((b.data||[]).map((x:any)=>x.brand));setLoading(false)}
 useEffect(()=>{load();const ch=supabase.channel('deking-v41').on('postgres_changes',{event:'*',schema:'public',table:'customers'},load).on('postgres_changes',{event:'*',schema:'public',table:'vehicle_search'},load).on('postgres_changes',{event:'*',schema:'public',table:'deals'},load).subscribe();return()=>{supabase.removeChannel(ch)}},[]);
 const due=customers.filter(c=>c.next_contact&&c.next_contact<=today()&&!['已成交','无效'].includes(c.status));
 const month=today().slice(0,7),monthDeals=deals.filter(d=>(d.deal_date||'').slice(0,7)===month),monthProfit=monthDeals.reduce((s,d)=>s+Number(d.total_profit??(Number(d.broker_fee||0)+Number(d.car_profit||0)+Number(d.loan_fee||0)+Number(d.insurance_fee||0)+Number(d.extra_profit||0)-Number(d.expense||0))),0);
 const findName=(id:any)=>customers.find(c=>c.id===id)?.name||'';
 function CustomerForm({item}:{item?:R}){
  const [f,setF]=useState<R>(item||{customer_no:'',name:'',phone:'',wechat:'',source:'抖音',brand:'',model:'',grade:'',budget:'',year_request:'',mileage_request:'',color:'',loan:'待确认',probability:'B-中',status:'新客户',last_contact:today(),next_contact:today(),memo:''});
  async function save(){if(!f.name?.trim())return alert('请输入客户姓名');const obj={...f,budget:f.budget?Number(f.budget):null,mileage_request:f.mileage_request?Number(f.mileage_request):null};const r=item?.id?await supabase.from('customers').update(obj).eq('id',item.id):await supabase.from('customers').insert(obj);if(r.error)return alert(r.error.message);setModal(null);load()}
  async function del(){if(item?.id&&confirm('确认删除这个客户？')){const r=await supabase.from('customers').delete().eq('id',item.id);if(r.error)return alert(r.error.message);setModal(null);load()}}
  return <><div className="grid"><F label="客户编号 / 고객번호"><input value={f.customer_no||''} onChange={e=>setF({...f,customer_no:e.target.value})}/></F><F label="姓名 / 고객명"><input value={f.name||''} onChange={e=>setF({...f,name:e.target.value})}/></F><F label="电话 / 연락처"><input value={f.phone||''} onChange={e=>setF({...f,phone:e.target.value})}/></F><F label="微信 / Kakao"><input value={f.wechat||''} onChange={e=>setF({...f,wechat:e.target.value})}/></F><F label="来源 / 유입경로"><select value={f.source||''} onChange={e=>setF({...f,source:e.target.value})}>{sourceList.map(x=><option key={x}>{x}</option>)}</select></F>
  <VehicleSelector form={f} setForm={setF} brands={brands}/>
  <F label="预算（万韩元）"><input type="number" value={f.budget||''} onChange={e=>setF({...f,budget:e.target.value})}/></F><F label="年份要求"><input value={f.year_request||''} onChange={e=>setF({...f,year_request:e.target.value})}/></F><F label="公里数要求"><input type="number" value={f.mileage_request||''} onChange={e=>setF({...f,mileage_request:e.target.value})}/></F><F label="颜色"><input value={f.color||''} onChange={e=>setF({...f,color:e.target.value})}/></F><F label="贷款"><select value={f.loan||''} onChange={e=>setF({...f,loan:e.target.value})}>{['是','否','待确认'].map(x=><option key={x}>{x}</option>)}</select></F><F label="意向等级"><select value={f.probability||''} onChange={e=>setF({...f,probability:e.target.value})}>{['A-高','B-中','C-低'].map(x=><option key={x}>{x}</option>)}</select></F><F label="状态"><select value={f.status||''} onChange={e=>setF({...f,status:e.target.value})}>{statusList.map(x=><option key={x}>{x}</option>)}</select></F><F label="最后联系"><input type="date" value={f.last_contact||''} onChange={e=>setF({...f,last_contact:e.target.value})}/></F><F label="下次联系"><input type="date" value={f.next_contact||''} onChange={e=>setF({...f,next_contact:e.target.value})}/></F><F label="备注"><textarea value={f.memo||''} onChange={e=>setF({...f,memo:e.target.value})}/></F></div><div className="toolbar" style={{marginTop:14}}><button className="btn" onClick={save}>保存 / 저장</button>{item?.id&&<button className="btn red" onClick={del}>删除</button>}</div></>
 }
 function CarForm({item}:{item?:R}){
  const [f,setF]=useState<R>(item||{customer_id:customers[0]?.id||'',record_date:today(),auction_place:'Glovis',brand:'',model:'',grade:'',year:'',mileage:'',color:'',vehicle_ref:'',market_price:'',expected_price:'',customer_max_price:'',auction_date:today(),result:'待确认',final_price:'',feedback:'',memo:''});
  async function save(){if(!f.customer_id)return alert('请选择客户');const nums=['year','mileage','market_price','expected_price','customer_max_price','final_price'];let o={...f};nums.forEach(k=>o[k]=o[k]?Number(o[k]):null);const r=item?.id?await supabase.from('vehicle_search').update(o).eq('id',item.id):await supabase.from('vehicle_search').insert(o);if(r.error)return alert(r.error.message);setModal(null);load()}
  async function del(){if(item?.id&&confirm('确认删除这条找车记录？')){const r=await supabase.from('vehicle_search').delete().eq('id',item.id);if(r.error)return alert(r.error.message);setModal(null);load()}}
  return <><div className="grid"><F label="客户"><select value={f.customer_id||''} onChange={e=>setF({...f,customer_id:e.target.value})}>{customers.map(c=><option key={c.id} value={c.id}>{c.name} / {c.phone}</option>)}</select></F><F label="日期"><input type="date" value={f.record_date||''} onChange={e=>setF({...f,record_date:e.target.value})}/></F><F label="竞买场"><input value={f.auction_place||''} onChange={e=>setF({...f,auction_place:e.target.value})}/></F>
  <VehicleSelector form={f} setForm={setF} brands={brands}/>
  <F label="年份"><input type="number" value={f.year||''} onChange={e=>setF({...f,year:e.target.value})}/></F><F label="公里数"><input type="number" value={f.mileage||''} onChange={e=>setF({...f,mileage:e.target.value})}/></F><F label="颜色"><input value={f.color||''} onChange={e=>setF({...f,color:e.target.value})}/></F><F label="车辆链接/编号"><input value={f.vehicle_ref||''} onChange={e=>setF({...f,vehicle_ref:e.target.value})}/></F><F label="预计市场价（万）"><input type="number" value={f.market_price||''} onChange={e=>setF({...f,market_price:e.target.value})}/></F><F label="建议最高价（万）"><input type="number" value={f.expected_price||''} onChange={e=>setF({...f,expected_price:e.target.value})}/></F><F label="客户最高价（万）"><input type="number" value={f.customer_max_price||''} onChange={e=>setF({...f,customer_max_price:e.target.value})}/></F><F label="竞拍日期"><input type="date" value={f.auction_date||''} onChange={e=>setF({...f,auction_date:e.target.value})}/></F><F label="结果"><select value={f.result||''} onChange={e=>setF({...f,result:e.target.value})}>{resultList.map(x=><option key={x}>{x}</option>)}</select></F><F label="成交价（万）"><input type="number" value={f.final_price||''} onChange={e=>setF({...f,final_price:e.target.value})}/></F><F label="客户反馈/下一步"><input value={f.feedback||''} onChange={e=>setF({...f,feedback:e.target.value})}/></F><F label="备注"><textarea value={f.memo||''} onChange={e=>setF({...f,memo:e.target.value})}/></F></div><div className="toolbar" style={{marginTop:14}}><button className="btn" onClick={save}>保存</button>{item?.id&&<button className="btn red" onClick={del}>删除</button>}</div></>
 }
 function DealForm({item}:{item?:R}){
  const [f,setF]=useState<R>(item||{customer_id:customers[0]?.id||'',deal_date:today(),model:'',year:'',deal_price:'',broker_fee:'',car_profit:'',loan_fee:'',insurance_fee:'',extra_profit:'',expense:'',delivery_date:'',after_sales_reminder:'',memo:''});
  const total=Number(f.broker_fee||0)+Number(f.car_profit||0)+Number(f.loan_fee||0)+Number(f.insurance_fee||0)+Number(f.extra_profit||0)-Number(f.expense||0);
  async function save(){if(!f.customer_id)return alert('请选择客户');let o={...f,total_profit:total};['year','deal_price','broker_fee','car_profit','loan_fee','insurance_fee','extra_profit','expense'].forEach(k=>o[k]=o[k]?Number(o[k]):0);const r=item?.id?await supabase.from('deals').update(o).eq('id',item.id):await supabase.from('deals').insert(o);if(r.error)return alert(r.error.message);await supabase.from('customers').update({status:'已成交'}).eq('id',f.customer_id);setModal(null);load()}
  async function del(){if(item?.id&&confirm('确认删除成交记录？')){const r=await supabase.from('deals').delete().eq('id',item.id);if(r.error)return alert(r.error.message);setModal(null);load()}}
  return <><div className="grid"><F label="客户"><select value={f.customer_id||''} onChange={e=>setF({...f,customer_id:e.target.value})}>{customers.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}</select></F><F label="成交日期"><input type="date" value={f.deal_date||''} onChange={e=>setF({...f,deal_date:e.target.value})}/></F><F label="车型"><input value={f.model||''} onChange={e=>setF({...f,model:e.target.value})}/></F><F label="年份"><input type="number" value={f.year||''} onChange={e=>setF({...f,year:e.target.value})}/></F><F label="成交价（万）"><input type="number" value={f.deal_price||''} onChange={e=>setF({...f,deal_price:e.target.value})}/></F><F label="代拍服务费"><input type="number" value={f.broker_fee||''} onChange={e=>setF({...f,broker_fee:e.target.value})}/></F><F label="车辆利润"><input type="number" value={f.car_profit||''} onChange={e=>setF({...f,car_profit:e.target.value})}/></F><F label="贷款返点"><input type="number" value={f.loan_fee||''} onChange={e=>setF({...f,loan_fee:e.target.value})}/></F><F label="保险返点"><input type="number" value={f.insurance_fee||''} onChange={e=>setF({...f,insurance_fee:e.target.value})}/></F><F label="其他收入"><input type="number" value={f.extra_profit||''} onChange={e=>setF({...f,extra_profit:e.target.value})}/></F><F label="支出/优惠"><input type="number" value={f.expense||''} onChange={e=>setF({...f,expense:e.target.value})}/></F><F label="总利润"><input value={total} readOnly/></F><F label="交车日期"><input type="date" value={f.delivery_date||''} onChange={e=>setF({...f,delivery_date:e.target.value})}/></F><F label="售后提醒"><input value={f.after_sales_reminder||''} onChange={e=>setF({...f,after_sales_reminder:e.target.value})}/></F><F label="备注"><textarea value={f.memo||''} onChange={e=>setF({...f,memo:e.target.value})}/></F></div><div className="toolbar" style={{marginTop:14}}><button className="btn" onClick={save}>保存</button>{item?.id&&<button className="btn red" onClick={del}>删除</button>}</div></>
 }
 function Quote(){
  const [f,setF]=useState<R>({customer_id:'',name:'',phone:'',model:'',year:'',mileage:'',color:'',expected:'',fee:'',auction_place:'Glovis',valid_until:'',memo:''});
  function pick(id:string){const c=customers.find(x=>x.id===id);setF({...f,customer_id:id,name:c?.name||'',phone:c?.phone||'',model:[c?.brand,c?.model,c?.grade].filter(Boolean).join(' ')})}
  const total=Number(f.expected||0)+Number(f.fee||0);
  const fields=[['客户姓名','고객명',f.name],['电话','연락처',f.phone],['车型','차종',f.model],['年份','연식',f.year],['公里数','주행거리',f.mileage],['颜色','색상',f.color],['预计成交价(万韩元)','예상 낙찰가(만원)',money(f.expected)],['代拍服务费(万韩元)','대행 수수료(만원)',money(f.fee)],['预计总价(万韩元)','예상 총액(만원)',money(total)],['竞买场','경매장',f.auction_place],['有效期','유효기간',f.valid_until],['备注','메모',f.memo]];
  return <><div className="card no-print"><h2>报价内容 <span className="muted">견적 입력</span></h2><div className="grid"><F label="选择客户"><select value={f.customer_id} onChange={e=>pick(e.target.value)}><option value="">请选择</option>{customers.map(c=><option key={c.id} value={c.id}>{c.name} / {c.phone}</option>)}</select></F>{[['name','客户姓名'],['phone','电话'],['model','车型'],['year','年份'],['mileage','公里数'],['color','颜色'],['expected','预计成交价（万）'],['fee','代拍服务费（万）'],['auction_place','竞买场'],['valid_until','有效期'],['memo','备注']].map(([k,l])=><F key={k} label={l}><input type={['expected','fee'].includes(k)?'number':k==='valid_until'?'date':'text'} value={f[k]||''} onChange={e=>setF({...f,[k]:e.target.value})}/></F>)}</div><div className="toolbar" style={{marginTop:14}}><button className="btn" onClick={()=>window.print()}>打印 / 保存 PDF</button></div></div><div className="card quote"><h2>德King 韩国二手车代拍报价单 / 견적서</h2><table><tbody><tr><td>中文项目</td><td>한국어</td><td>填写内容</td></tr>{fields.map(x=><tr key={x[0]}><td>{x[0]}</td><td>{x[1]}</td><td>{x[2]}</td></tr>)}</tbody></table><p className="muted">本报价为代拍参考价，最终金额以实际成交价、车辆检查及实际费用为准。<br/>본 견적은 입찰 대행 참고 견적이며 최종 금액은 실제 낙찰가, 차량 확인 및 실비 기준으로 확정됩니다.</p></div></>
 }
 function content(){
  if(!process.env.NEXT_PUBLIC_SUPABASE_URL)return <div className="notice">请先在 Vercel 设置 NEXT_PUBLIC_SUPABASE_URL 和 NEXT_PUBLIC_SUPABASE_ANON_KEY。</div>;
  if(loading)return <div className="card">正在读取数据...</div>;
  if(page==='dash')return <><div className="kpis"><div className="kpi"><span>今日待联系</span><b>{due.length}</b></div><div className="kpi"><span>找车中</span><b>{customers.filter(c=>c.status==='找车中').length}</b></div><div className="kpi"><span>今日竞拍</span><b>{cars.filter(v=>v.auction_date===today()).length}</b></div><div className="kpi"><span>本月成交</span><b>{monthDeals.length}</b></div><div className="kpi"><span>本月利润（万）</span><b>{money(monthProfit)}</b></div></div><div className="card"><h2>今日优先联系客户 / 오늘 우선 연락</h2><Table h={['姓名','电话','需求车型','预算','状态','下次联系','备注','管理']} rows={due.map(c=>[c.name,c.phone,[c.brand,c.model].filter(Boolean).join(' '),money(c.budget),c.status,<span className="due">{c.next_contact}</span>,c.memo,<button className="btn gray" onClick={()=>setModal({title:'修改客户',body:<CustomerForm item={c}/>})}>修改</button>])}/></div><div className="card"><h2>使用方法</h2><p>每天只看这里：先联系到期客户，再处理竞拍，成交后记利润。金额统一：万韩元 / 만원。</p></div></>;
  if(page==='customers'){const q=search.toLowerCase(),list=customers.filter(c=>!q||JSON.stringify(c).toLowerCase().includes(q));return <div className="card"><h2>客户管理 / 고객관리</h2><div className="toolbar"><input className="search" placeholder="姓名、电话、车型搜索" value={search} onChange={e=>setSearch(e.target.value)}/><button className="btn" onClick={()=>setModal({title:'新客户',body:<CustomerForm/>})}>+ 新客户</button></div><Table h={['编号','姓名','电话','来源','需求车型','预算','意向','状态','下次联系','管理']} rows={list.map(c=>[c.customer_no,c.name,c.phone,c.source,[c.brand,c.model,c.grade].filter(Boolean).join(' '),money(c.budget),c.probability,c.status,c.next_contact,<button className="btn gray" onClick={()=>setModal({title:'修改客户',body:<CustomerForm item={c}/>})}>修改</button>])}/></div>}
  if(page==='cars')return <div className="card"><h2>找车 + 竞拍 / 차량검색·입찰</h2><div className="toolbar"><button className="btn" onClick={()=>setModal({title:'新增找车竞拍',body:<CarForm/>})}>+ 新增记录</button></div><Table h={['客户','日期','竞买场','车型/配置','年份','公里数','市场价','建议最高价','客户最高价','竞拍日','结果','成交价','下一步','管理']} rows={cars.map(v=>[findName(v.customer_id),v.record_date,v.auction_place,[v.brand,v.model,v.grade].filter(Boolean).join(' '),v.year,money(v.mileage),money(v.market_price),money(v.expected_price),money(v.customer_max_price),v.auction_date,v.result,money(v.final_price),v.feedback,<button className="btn gray" onClick={()=>setModal({title:'修改找车竞拍',body:<CarForm item={v}/>})}>修改</button>])}/></div>;
  if(page==='deals')return <div className="card"><h2>成交利润 / 계약·수익</h2><div className="toolbar"><button className="btn" onClick={()=>setModal({title:'新增成交利润',body:<DealForm/>})}>+ 新增成交</button></div><Table h={['成交日','客户','车型','成交价','服务费','车辆利润','贷款','保险','其他','支出','总利润','交车日','管理']} rows={deals.map(d=>[d.deal_date,findName(d.customer_id),d.model,money(d.deal_price),money(d.broker_fee),money(d.car_profit),money(d.loan_fee),money(d.insurance_fee),money(d.extra_profit),money(d.expense),<b>{money(d.total_profit)}</b>,d.delivery_date,<button className="btn gray" onClick={()=>setModal({title:'修改成交利润',body:<DealForm item={d}/>})}>修改</button>])}/></div>;
  return <Quote/>
 }
 return <><header className="top"><div><h1>덕킹 중고차 대행경매 CRM Professional V4.1</h1><p>韩国二手车个人工作系统 · 手机 / 电脑同步 · Supabase</p></div><button className="btn gray" onClick={load}>刷新</button></header><div className="shell"><nav className="nav"><div className="brand">德King CRM<br/><span className="muted">Professional V4.1</span></div>{pages.map(p=><button key={p[0]} className={page===p[0]?'active':''} onClick={()=>{setPage(p[0]);setSearch('')}}>{p[1]} {p[2]}</button>)}</nav><main className="main">{content()}</main></div><nav className="mobilebar">{pages.map(p=><button key={p[0]} className={page===p[0]?'active':''} onClick={()=>{setPage(p[0]);setSearch('')}}>{p[1]}<br/>{p[2]}</button>)}</nav>{modal&&<div className="modalbg" onClick={()=>setModal(null)}><div className="modal" onClick={e=>e.stopPropagation()}><div className="modalhead"><h2>{modal.title}</h2><button className="btn gray" onClick={()=>setModal(null)}>✕</button></div>{modal.body}</div></div>}</>
}