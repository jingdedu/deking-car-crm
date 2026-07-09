德King 韩国二手车 CRM Professional V4.0 Final

上传方式：
1. 打开 GitHub 仓库 deking-car-crm
2. 删除旧文件，或直接上传本包所有文件覆盖
3. Commit changes
4. Vercel 自动部署
5. 部署 Ready 后刷新网站

重要：
- Vercel 环境变量必须有：
  NEXT_PUBLIC_SUPABASE_URL
  NEXT_PUBLIC_SUPABASE_ANON_KEY
- Supabase 里必须有 car_models_v3 表和车型数据
- 如果基础业务表缺失，可运行 supabase/00_base_tables.sql

核心功能：
- CRM Professional V4.0
- 读取 car_models_v3
- 支持 20,000+ 韩国车型数据
- 品牌 / 车型 / 配置三级联动
- 客户管理、找车中心、竞拍管理、利润管理、跟进日志、车型库
