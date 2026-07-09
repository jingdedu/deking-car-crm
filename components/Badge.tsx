export default function Badge({ value }: { value: string }) {
  const v = value || '';
  const cls = ['계약완료','已成交','중标','中标','출고완료'].includes(v) ? 'green'
    : ['이탈','已流失','未中标','패찰'].includes(v) ? 'red'
    : (v.includes('대기') || v.includes('等待') || v.includes('진행')) ? 'yellow' : '';
  return <span className={`badge ${cls}`}>{v}</span>;
}
