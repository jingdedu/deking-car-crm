'use client';

import { useEffect, useMemo, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { today, money, uniq, totalProfit } from '@/lib/utils';
import Badge from '@/components/Badge';
import Field from '@/components/Field';
import Modal from '@/components/Modal';
import DataTable from '@/components/DataTable';
import Sidebar from '@/components/Sidebar';
import CarSelector from '@/components/CarSelector';

type Row = Record<string, any>;

const PAGES = [
  ['dashboard','📊 대시보드','工作台'],
  ['customers','👥 고객관리','客户管理'],
  ['follow','📞 팔로업','跟进日志'],
  ['vehicles','🔍 차량찾기','找车中心'],
  ['auctions','🔨 경매관리','竞拍管理'],
  ['deals','💰 수익관리','利润管理'],
  ['models','🚗 차량DB','车型库'],
];

export default function Home(){
  const [page,setPage] = useState('dashboard');
  const [loading,setLoading] = useState(true);
  const [search,setSearch] = useState('');
  const [modal,setModal] = useState<any>(null);

  const [customers,setCustomers] = useState<Row[]>([]);
  const [vehicles,setVehicles] = useState<Row[]>([]);
  const [auctions,setAuctions] = useState<Row[]>([]);
  const [deals,setDeals] = useState<Row[]>([]);
  const [logs,setLogs] = useState<Row[]>([]);
  const [models,setModels] = useState<Row[]>([]);

  async function loadAll(){
    setLoading(true);

    const [c,v,a,d,l,m] = await Promise.all([
      supabase.from('customers').select('*').order('created_at',{ascending:false}),
      supabase.from('vehicle_search').select('*').order('created_at',{ascending:false}),
      supabase.from('auctions').select('*').order('created_at',{ascending:false}),
      supabase.from('deals').select('*').order('created_at',{ascending:false}),
      supabase.from('follow_logs').select('*').order('created_at',{ascending:false}),
      supabase
        .from('car_models_v3')
        .select('*')
        .order('brand')
        .range(0, 30000)
    ]);

    setCustomers(c.data || []);
    setVehicles(v.data || []);
    setAuctions(a.data || []);
    setDeals(d.data || []);
    setLogs(l.data || []);
    setModels(m.data || []);
    setLoading(false);
  }

  useEffect(()=>{
    loadAll();
    const ch = supabase.channel('crm-pro-v40')
      .on('postgres_changes',{event:'*',schema:'public',table:'customers'},loadAll)
      .on('postgres_changes',{event:'*',schema:'public',table:'vehicle_search'},loadAll)
      .on('postgres_changes',{event:'*',schema:'public',table:'auctions'},loadAll)
      .on('postgres_changes',{event:'*',schema:'public',table:'deals'},loadAll)
      .on('postgres_changes',{event:'*',schema:'public',table:'follow_logs'},loadAll)
      .subscribe();

    return ()=>{ supabase.removeChannel(ch); };
  },[]);

  const brands = useMemo(()=>{
    return uniq(models.map(x=>x.brand).filter(Boolean)).sort((a:string,b:string)=>String(a).localeCompare(String(b)));
  },[models]);

  const modelOptions = (brand:string)=>{
    return uniq(
      models
        .filter(x=>!brand || x.brand===brand)
        .map(x=>x.model)
        .filter(Boolean)
    ).sort((a:string,b:string)=>String(a).localeCompare(String(b)));
  };

  const gradeOptions = (brand:string, model:string)=>{
    return uniq(
      models
        .filter(x=>(!brand||x.brand===brand)&&(!model||x.model===model))
        .map(x=>{
          if(x.grade) return x.grade;
          return [x.model_year, x.engine, x.drivetrain, x.trim].filter(Boolean).join(' ');
        })
        .filter(Boolean)
    ).sort((a:string,b:string)=>String(a).localeCompare(String(b)));
  };

  const customerName = (id:string)=>customers.find(c=>c.id===id)?.name || '';
  const customerById = (id:string)=>customers.find(c=>c.id===id);
  const match = (obj:any)=>!search || JSON.stringify(obj).toLowerCase().includes(search.toLowerCase());

  const month = today().slice(0,7);
  const dueCustomers = customers.filter(c=>c.next_contact && c.next_contact <= today() && !['계약완료','已成交','이탈','已流失'].includes(c.status));
  const todayAuctions = vehicles.filter(v=>v.auction_date === today());
  const monthDeals = deals.filter(d=>(d.deal_date||'').slice(0,7)===month);

  function CustomerForm({item}:any){
    const [form,setForm] = useState(item || {
      customer_no:'', name:'', phone:'', wechat:'', kakao:'', source:'抖音',
      brand:'', model:'', grade:'', budget:'', status:'신규고객',
      probability:'60% 有机会', last_contact:today(), next_contact:today(), memo:''
    });

    async function save(){
      const obj = {...form, budget: form.budget ? Number(form.budget) : null};
      if(item?.id) await supabase.from('customers').update(obj).eq('id',item.id);
      else await supabase.from('customers').insert(obj);
      setModal(null);
      await loadAll();
    }

    async function del(){
      if(!item?.id || !confirm('삭제할까요?')) return;
      await supabase.from('customers').delete().eq('id',item.id);
      setModal(null);
      await loadAll();
    }

    return <div>
      <div className="formgrid">
        <Field label="고객번호 / 客户编号"><input value={form.customer_no||''} onChange={e=>setForm({...form,customer_no:e.target.value})}/></Field>
        <Field label="고객명 / 姓名"><input value={form.name||''} onChange={e=>setForm({...form,name:e.target.value})}/></Field>
        <Field label="전화 / 电话"><input value={form.phone||''} onChange={e=>setForm({...form,phone:e.target.value})}/></Field>
        <Field label="위챗"><input value={form.wechat||''} onChange={e=>setForm({...form,wechat:e.target.value})}/></Field>
        <Field label="카카오"><input value={form.kakao||''} onChange={e=>setForm({...form,kakao:e.target.value})}/></Field>
        <Field label="유입경로 / 来源"><select value={form.source||''} onChange={e=>setForm({...form,source:e.target.value})}>{['抖音','直播','小红书','微信','Kakao','Naver','YouTube','介绍'].map(x=><option key={x}>{x}</option>)}</select></Field>
        <CarSelector form={form} setForm={setForm} brands={brands} modelOptions={modelOptions} gradeOptions={gradeOptions}/>
        <Field label="예산 / 预算"><input type="number" value={form.budget||''} onChange={e=>setForm({...form,budget:e.target.value})}/></Field>
        <Field label="계약확률 / 成交概率"><select value={form.probability||''} onChange={e=>setForm({...form,probability:e.target.value})}>{['95% 基本成交','80% 高概率','60% 有机会','40% 观望','20% 低概率','5% 冷客户'].map(x=><option key={x}>{x}</option>)}</select></Field>
        <Field label="상태 / 状态"><select value={form.status||''} onChange={e=>setForm({...form,status:e.target.value})}>{['신규고객','요구확인','차량검색중','추천완료','입찰대기','입찰중','계약완료','출고완료','이탈'].map(x=><option key={x}>{x}</option>)}</select></Field>
        <Field label="마지막 연락"><input type="date" value={form.last_contact||''} onChange={e=>setForm({...form,last_contact:e.target.value})}/></Field>
        <Field label="다음 연락"><input type="date" value={form.next_contact||''} onChange={e=>setForm({...form,next_contact:e.target.value})}/></Field>
        <Field label="메모 / 备注"><textarea value={form.memo||''} onChange={e=>setForm({...form,memo:e.target.value})}/></Field>
      </div>
      <div className="toolbar" style={{marginTop:14}}>
        <button className="btn green" onClick={save}>저장</button>
        {item?.id && <button className="btn danger" onClick={del}>삭제</button>}
      </div>
    </div>;
  }

  function VehicleForm({item}:any){
    const [form,setForm] = useState(item || {
      customer_id:customers[0]?.id||'', auction_place:'Glovis', brand:'', model:'', grade:'',
      auction_date:today(), condition:'无事故'
    });

    async function save(){
      const obj = {
        ...form,
        year: form.year ? Number(form.year) : null,
        mileage: form.mileage ? Number(form.mileage) : null,
        start_price: form.start_price ? Number(form.start_price) : null,
        expected_price: form.expected_price ? Number(form.expected_price) : null,
        market_price: form.market_price ? Number(form.market_price) : null
      };
      if(item?.id) await supabase.from('vehicle_search').update(obj).eq('id',item.id);
      else await supabase.from('vehicle_search').insert(obj);
      setModal(null);
      await loadAll();
    }

    return <div>
      <div className="formgrid">
        <Field label="고객 / 客户"><select value={form.customer_id||''} onChange={e=>setForm({...form,customer_id:e.target.value})}>{customers.map(c=><option key={c.id} value={c.id}>{c.name} / {c.phone}</option>)}</select></Field>
        <Field label="경매장 / 竞买场"><input value={form.auction_place||''} onChange={e=>setForm({...form,auction_place:e.target.value})}/></Field>
        <CarSelector form={form} setForm={setForm} brands={brands} modelOptions={modelOptions} gradeOptions={gradeOptions}/>
        <Field label="연식"><input type="number" value={form.year||''} onChange={e=>setForm({...form,year:e.target.value})}/></Field>
        <Field label="주행거리"><input type="number" value={form.mileage||''} onChange={e=>setForm({...form,mileage:e.target.value})}/></Field>
        <Field label="색상"><input value={form.color||''} onChange={e=>setForm({...form,color:e.target.value})}/></Field>
        <Field label="차량상태"><select value={form.condition||''} onChange={e=>setForm({...form,condition:e.target.value})}>{['无事故','单纯交换','有事故','需要检测','不确定'].map(x=><option key={x}>{x}</option>)}</select></Field>
        <Field label="시작가"><input type="number" value={form.start_price||''} onChange={e=>setForm({...form,start_price:e.target.value})}/></Field>
        <Field label="예상낙찰가"><input type="number" value={form.expected_price||''} onChange={e=>setForm({...form,expected_price:e.target.value})}/></Field>
        <Field label="시세"><input type="number" value={form.market_price||''} onChange={e=>setForm({...form,market_price:e.target.value})}/></Field>
        <Field label="입찰일"><input type="date" value={form.auction_date||''} onChange={e=>setForm({...form,auction_date:e.target.value})}/></Field>
        <Field label="반응"><select value={form.feedback||''} onChange={e=>setForm({...form,feedback:e.target.value})}>{['喜欢','考虑','太贵','已确认','不要'].map(x=><option key={x}>{x}</option>)}</select></Field>
        <Field label="메모"><textarea value={form.memo||''} onChange={e=>setForm({...form,memo:e.target.value})}/></Field>
      </div>
      <div className="toolbar" style={{marginTop:14}}><button className="btn green" onClick={save}>저장</button></div>
    </div>;
  }

  function SimpleInsertForm({type}:any){
    const [form,setForm] = useState<any>({
      customer_id:customers[0]?.id||'', auction_date:today(), deal_date:today(),
      contact_date:today(), next_contact:today(), auction_place:'Glovis', result:'待竞拍', method:'微信'
    });

    async function save(){
      if(type==='auction') await supabase.from('auctions').insert({
        customer_id:form.customer_id, auction_date:form.auction_date, auction_place:form.auction_place,
        max_bid:Number(form.max_bid||0), final_price:Number(form.final_price||0), result:form.result, memo:form.memo
      });

      if(type==='deal'){
        const c=customerById(form.customer_id);
        await supabase.from('deals').insert({
          customer_id:form.customer_id, deal_date:form.deal_date, brand:c?.brand, model:c?.model, grade:c?.grade,
          deal_price:Number(form.deal_price||0), broker_fee:Number(form.broker_fee||0), loan_fee:Number(form.loan_fee||0),
          insurance_fee:Number(form.insurance_fee||0), extra_profit:Number(form.extra_profit||0), car_profit:Number(form.car_profit||0),
          delivery_date:form.delivery_date, memo:form.memo
        });
      }

      if(type==='log'){
        await supabase.from('follow_logs').insert({
          customer_id:form.customer_id, contact_date:form.contact_date, method:form.method,
          content:form.content, next_contact:form.next_contact, memo:form.memo
        });
        await supabase.from('customers').update({last_contact:form.contact_date,next_contact:form.next_contact}).eq('id',form.customer_id);
      }

      setModal(null);
      await loadAll();
    }

    return <div className="formgrid">
      <Field label="고객"><select value={form.customer_id} onChange={e=>setForm({...form,customer_id:e.target.value})}>{customers.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}</select></Field>
      {type==='auction' && <>
        <Field label="입찰일"><input type="date" value={form.auction_date} onChange={e=>setForm({...form,auction_date:e.target.value})}/></Field>
        <Field label="경매장"><input value={form.auction_place} onChange={e=>setForm({...form,auction_place:e.target.value})}/></Field>
        <Field label="최고가"><input type="number" onChange={e=>setForm({...form,max_bid:e.target.value})}/></Field>
        <Field label="낙찰가"><input type="number" onChange={e=>setForm({...form,final_price:e.target.value})}/></Field>
        <Field label="결과"><select value={form.result} onChange={e=>setForm({...form,result:e.target.value})}>{['待竞拍','中标','未中标','客户放弃'].map(x=><option key={x}>{x}</option>)}</select></Field>
      </>}
      {type==='deal' && <>
        <Field label="계약일"><input type="date" value={form.deal_date} onChange={e=>setForm({...form,deal_date:e.target.value})}/></Field>
        <Field label="계약가"><input type="number" onChange={e=>setForm({...form,deal_price:e.target.value})}/></Field>
        <Field label="대행료"><input type="number" onChange={e=>setForm({...form,broker_fee:e.target.value})}/></Field>
        <Field label="할부"><input type="number" onChange={e=>setForm({...form,loan_fee:e.target.value})}/></Field>
        <Field label="보험"><input type="number" onChange={e=>setForm({...form,insurance_fee:e.target.value})}/></Field>
        <Field label="기타"><input type="number" onChange={e=>setForm({...form,extra_profit:e.target.value})}/></Field>
        <Field label="차량마진"><input type="number" onChange={e=>setForm({...form,car_profit:e.target.value})}/></Field>
        <Field label="출고일"><input type="date" onChange={e=>setForm({...form,delivery_date:e.target.value})}/></Field>
      </>}
      {type==='log' && <>
        <Field label="연락일"><input type="date" value={form.contact_date} onChange={e=>setForm({...form,contact_date:e.target.value})}/></Field>
        <Field label="방식"><select value={form.method} onChange={e=>setForm({...form,method:e.target.value})}>{['微信','Kakao','电话','短信','面谈'].map(x=><option key={x}>{x}</option>)}</select></Field>
        <Field label="다음 연락"><input type="date" value={form.next_contact} onChange={e=>setForm({...form,next_contact:e.target.value})}/></Field>
        <Field label="내용"><textarea onChange={e=>setForm({...form,content:e.target.value})}/></Field>
      </>}
      <Field label="메모"><textarea onChange={e=>setForm({...form,memo:e.target.value})}/></Field>
      <div><button className="btn green" onClick={save}>저장</button></div>
    </div>;
  }

  function renderDashboard(){
    return <>
      <div className="grid">
        <div className="kpi"><div className="label">오늘 연락 / 今日待联系</div><div className="value">{dueCustomers.length}</div></div>
        <div className="kpi"><div className="label">오늘 입찰 / 今日竞拍</div><div className="value">{todayAuctions.length}</div></div>
        <div className="kpi"><div className="label">월계약 / 本月成交</div><div className="value">{monthDeals.length}</div></div>
        <div className="kpi"><div className="label">월수익 / 本月利润</div><div className="value">{money(monthDeals.reduce((s,d)=>s+totalProfit(d),0))}</div></div>
      </div>
      <div className="card">
        <h2>오늘 우선 연락 고객 <span className="muted">今日优先联系</span></h2>
        <DataTable headers={['고객명','연락처','차량','상태','다음연락','메모']} rows={dueCustomers.map(c=>[c.name,c.phone,`${c.brand||''} ${c.model||''}`,<Badge key={c.id} value={c.status}/>,c.next_contact,c.memo])}/>
      </div>
      <div className="card">
        <h2>오늘 입찰 차량 <span className="muted">今日竞拍车辆</span></h2>
        <DataTable headers={['고객','경매장','차량','예상가','입찰일','반응']} rows={todayAuctions.map(v=>[customerName(v.customer_id),v.auction_place,`${v.brand||''} ${v.model||''}`,money(v.expected_price),v.auction_date,v.feedback])}/>
      </div>
    </>;
  }

  function body(){
    if(!process.env.NEXT_PUBLIC_SUPABASE_URL) return <div className="notice">Vercel 환경변수 NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY 를 먼저 설정하세요.</div>;
    if(loading) return <div className="card">로딩중...</div>;

    if(page==='dashboard') return renderDashboard();

    if(page==='customers') return <div>
      <h2>고객관리 <span className="muted">客户管理</span></h2>
      <div className="toolbar">
        <input placeholder="검색" value={search} onChange={e=>setSearch(e.target.value)}/>
        <button className="btn" onClick={()=>setModal({title:'신규 고객', body:<CustomerForm/>})}>신규 고객</button>
      </div>
      <DataTable headers={['번호','이름','전화','소스','차량','예산','확률','상태','다음연락','관리']} rows={customers.filter(match).map(c=>[c.customer_no,c.name,c.phone,c.source,`${c.brand||''} ${c.model||''} ${c.grade||''}`,money(c.budget),c.probability,<Badge key={c.id} value={c.status}/>,c.next_contact,<button key={c.id} className="btn secondary" onClick={()=>setModal({title:'고객 수정', body:<CustomerForm item={c}/>})}>수정</button>])}/>
    </div>;

    if(page==='follow') return <div>
      <h2>팔로업 로그 <span className="muted">跟进日志</span></h2>
      <div className="toolbar"><button className="btn" onClick={()=>setModal({title:'팔로업 추가', body:<SimpleInsertForm type="log"/>})}>팔로업 추가</button></div>
      <DataTable headers={['고객','연락일','방식','내용','다음연락']} rows={logs.map(l=>[customerName(l.customer_id),l.contact_date,l.method,l.content,l.next_contact])}/>
    </div>;

    if(page==='vehicles') return <div>
      <h2>차량찾기 <span className="muted">找车中心</span></h2>
      <div className="toolbar"><button className="btn" onClick={()=>setModal({title:'차량 추가', body:<VehicleForm/>})}>차량 추가</button></div>
      <DataTable headers={['고객','경매장','차량','연식','km','예상가','입찰일','반응','관리']} rows={vehicles.map(v=>[customerName(v.customer_id),v.auction_place,`${v.brand||''} ${v.model||''} ${v.grade||''}`,v.year,money(v.mileage),money(v.expected_price),v.auction_date,v.feedback,<button key={v.id} className="btn secondary" onClick={()=>setModal({title:'차량 수정', body:<VehicleForm item={v}/>})}>수정</button>])}/>
    </div>;

    if(page==='auctions') return <div>
      <h2>경매관리 <span className="muted">竞拍管理</span></h2>
      <div className="toolbar"><button className="btn" onClick={()=>setModal({title:'입찰 추가', body:<SimpleInsertForm type="auction"/>})}>입찰 추가</button></div>
      <DataTable headers={['고객','경매장','일자','최고가','낙찰가','결과','메모']} rows={auctions.map(a=>[customerName(a.customer_id),a.auction_place,a.auction_date,money(a.max_bid),money(a.final_price),<Badge key={a.id} value={a.result}/>,a.memo])}/>
    </div>;

    if(page==='deals') return <div>
      <h2>수익관리 <span className="muted">利润管理</span></h2>
      <div className="toolbar"><button className="btn" onClick={()=>setModal({title:'계약/수익 추가', body:<SimpleInsertForm type="deal"/>})}>계약 추가</button></div>
      <DataTable headers={['고객','차량','계약가','대행료','총수익','출고일']} rows={deals.map(d=>[customerName(d.customer_id),`${d.brand||''} ${d.model||''}`,money(d.deal_price),money(d.broker_fee),money(totalProfit(d)),d.delivery_date])}/>
    </div>;

    if(page==='models') return <div>
      <h2>차량 DB <span className="muted">车型数据库</span></h2>
      <div className="small">현재 로드된 차량 데이터: {models.length.toLocaleString()}건 / 브랜드 {brands.length}개</div>
      <DataTable headers={['브랜드','Brand','세부모델','Model EN','연식/등급','차급']} rows={models.slice(0,1000).map(m=>[
        m.brand,m.brand_en,m.model,m.model_en,
        m.grade || [m.model_year, m.engine, m.drivetrain, m.trim].filter(Boolean).join(' '),
        m.category
      ])}/>
    </div>;

    return null;
  }

  return <div>
    <header>
      <div>
        <h1>덕킹 중고차 대행경매 CRM Professional V4.0</h1>
        <div className="small">한국어 중심 · 中文辅助 · car_models_v3 연동 · 개인/소규모 팀용</div>
      </div>
      <button className="btn secondary" onClick={loadAll}>새로고침</button>
    </header>
    <div className="layout">
      <Sidebar pages={PAGES} current={page} setPage={(p:string)=>{setSearch('');setPage(p);}}/>
      <main>{body()}</main>
    </div>
    {modal && <Modal title={modal.title} onClose={()=>setModal(null)}>{modal.body}</Modal>}
  </div>;
}
