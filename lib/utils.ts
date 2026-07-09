export const today = () => new Date().toISOString().slice(0,10);

export const money = (v:any) => {
  const n = Number(v || 0);
  if(!n) return '₩0';
  return '₩' + n.toLocaleString('ko-KR');
};

export const uniq = (arr:any[]) => Array.from(new Set(arr.filter(Boolean)));

export const totalProfit = (d:any) =>
  Number(d?.broker_fee || 0) +
  Number(d?.loan_fee || 0) +
  Number(d?.insurance_fee || 0) +
  Number(d?.extra_profit || 0) +
  Number(d?.car_profit || 0);

export const compactGrade = (x:any) =>
  [x.model_year, x.engine, x.drivetrain, x.trim].filter(Boolean).join(' ');
