export const today = () => new Date().toISOString().slice(0, 10);
export const money = (n: any) => Number(n || 0).toLocaleString('ko-KR');
export const uniq = (arr: any[]) => [...new Set(arr.filter(Boolean))];
export const totalProfit = (d: any) =>
  Number(d.total_profit ?? ((+d.broker_fee || 0) + (+d.loan_fee || 0) + (+d.insurance_fee || 0) + (+d.extra_profit || 0) + (+d.car_profit || 0)));
