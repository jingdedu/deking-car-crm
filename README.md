# 덕킹 중고차 대행경매 CRM Lite v1.5

适合：一个人使用，后期 2–5 人使用。

## 功能
- Dashboard：今日待联系、今日竞拍、本月成交、本月利润
- 고객관리：客户新增、修改、删除
- 팔로업：跟进日志
- 차량찾기：找车记录
- 경매관리：竞拍记录
- 수익관리：成交利润
- 차량DB：韩国品牌/车型/等级基础库
- 手机/电脑云端同步：连接 Supabase

## 部署
1. 上传全部文件到 GitHub 仓库
2. Vercel 自动部署
3. Vercel → Project Settings → Environment Variables 添加：
   - NEXT_PUBLIC_SUPABASE_URL
   - NEXT_PUBLIC_SUPABASE_ANON_KEY
4. Redeploy

注意：不要使用 service_role key。
