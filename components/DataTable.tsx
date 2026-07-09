export default function DataTable({headers,rows}:any){
  return <div className="tableWrap"><table>
    <thead><tr>{headers.map((h:any)=><th key={h}>{h}</th>)}</tr></thead>
    <tbody>
      {rows.length ? rows.map((r:any,i:number)=><tr key={i}>{r.map((c:any,j:number)=><td key={j}>{c}</td>)}</tr>) : <tr><td colSpan={headers.length} className="empty">데이터 없음 / 暂无数据</td></tr>}
    </tbody>
  </table></div>;
}
