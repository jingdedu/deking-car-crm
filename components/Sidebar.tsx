export default function Sidebar({pages,current,setPage}:any){
  return <aside className="sidebar">
    <div className="logo">
      <div className="logoMark">德</div>
      <div><b>DeKing CRM</b><small>Professional V4.0</small></div>
    </div>
    {pages.map((p:any)=><button key={p[0]} className={current===p[0]?'active':''} onClick={()=>setPage(p[0])}>
      <span>{p[1]}</span><small>{p[2]}</small>
    </button>)}
  </aside>;
}
