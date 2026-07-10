# DeKing CRM Professional V4.1 FULL

本包已经统一修复：

- `app/page.tsx` 与 `CarSelector.tsx` Props 不一致导致的 Vercel 编译错误
- 页面启动时一次加载几十万条车型的问题
- 品牌 → 车型 → 年份 → 配置四级按需联动
- 韩国品牌优先排序
- 品牌、车型、配置搜索
- 车辆录入时年份自动同步到 `vehicle_search.year`
- 客户录入时年份仅用于筛选，不写入不存在的客户字段
- 车型库页面改为轻量品牌列表

## 安装顺序

1. Supabase SQL Editor 运行：
   `supabase/01_v4_1_full_rpc.sql`
2. GitHub 切换到 `v4.1-beta`
3. 上传本项目全部文件并覆盖同名文件
4. Commit changes
5. 等待 Vercel Preview 显示 Ready
6. 测试：
   - 客户管理 → 新增客户
   - 车辆找车 → 新增车辆
   - 品牌 → 车型 → 年份 → 配置

环境变量保持：
- NEXT_PUBLIC_SUPABASE_URL
- NEXT_PUBLIC_SUPABASE_ANON_KEY
