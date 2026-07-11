# 德King 韩国二手车 CRM Professional V4.1 正式版

## 已完成

- 客户管理、跟进日志、找车、竞拍、成交利润、Dashboard
- 品牌 → 车型 → 年份 → 配置四级实时联动
- 车型数据按需查询，不再把几十万条记录下载到浏览器
- 品牌、车型、配置搜索
- 韩国品牌优先显示
- 车辆录入时自动同步年份
- 中韩双语界面
- Vercel / Supabase 部署结构

## 部署顺序

1. Supabase SQL Editor 运行 `supabase/01_v4_1_full_rpc.sql`。
2. 将项目文件覆盖到 GitHub Desktop 本地仓库根目录。
3. GitHub Desktop 当前分支确认是 `v4.1-beta`。
4. Commit：`Release V4.1 Official`。
5. Push origin。
6. 等待 Vercel Preview 显示 Ready。

## Vercel 环境变量

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## 构建验证

本项目已通过：

```bash
npm install
npm run build
```
