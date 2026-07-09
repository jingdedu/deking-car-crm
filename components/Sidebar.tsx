export default function Sidebar({ pages, current, setPage }: any) {
  return <aside className="sidebar">{pages.map((p:any)=><button key={p[0]} className={current===p[0]?'active':''} onClick={()=>setPage(p[0])}>{p[1]}<br/><span className="muted">{p[2]}</span></button>)}</aside>;
}
