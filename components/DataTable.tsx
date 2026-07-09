export default function DataTable({ headers, rows }: any) {
  if (!rows?.length) return <div className="empty">데이터가 없습니다 / 暂无数据</div>;
  return <div style={{overflow:'auto'}}><table><thead><tr>{headers.map((h:string)=><th key={h}>{h}</th>)}</tr></thead><tbody>{rows.map((r:any[],i:number)=><tr key={i}>{r.map((c:any,j:number)=><td key={j}>{c}</td>)}</tr>)}</tbody></table></div>;
}
