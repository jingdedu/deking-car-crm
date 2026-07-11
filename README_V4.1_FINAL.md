# DeKing CRM Professional V4.1 正式版

适合德King一个人使用的韩国二手车个人工作系统。

## 固定 5 步
1. 客户管理
2. 每天看工作台
3. 找车 + 竞拍
4. 成交利润
5. 报价单

## 安装
1. Supabase SQL Editor 运行 `supabase/01_V4.1_FINAL.sql`
2. 保留 Vercel 环境变量 `NEXT_PUBLIC_SUPABASE_URL` 与 `NEXT_PUBLIC_SUPABASE_ANON_KEY`
3. 整个项目覆盖 GitHub Desktop 本地 `deking-car-crm` 文件夹
4. Commit 到 `v4.1-beta`
5. Push origin
6. Vercel 自动部署 Preview

## 重要
- 不删除 `car_models_v3`
- 车型下拉通过 RPC 分页问题规避，不再一次读取 5 万行
- 金额统一按“万韩元”
- 手机底部 5 个入口，电脑左侧 5 个入口
