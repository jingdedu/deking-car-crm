export default function Badge({value}:any){
  const v = String(value || '');
  let cls = 'badge';
  if(v.includes('완료') || v.includes('成交') || v.includes('中标')) cls += ' green';
  else if(v.includes('대기') || v.includes('待') || v.includes('중')) cls += ' blue';
  else if(v.includes('이탈') || v.includes('放弃') || v.includes('未')) cls += ' red';
  return <span className={cls}>{v || '-'}</span>;
}
