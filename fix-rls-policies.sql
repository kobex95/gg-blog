-- Supabase RLS 策略修复脚本
-- 在 Supabase 控制台的 SQL Editor 中执行此脚本

-- 1. 启用 RLS（如果尚未启用）
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_tags ENABLE ROW LEVEL SECURITY;

-- 2. 删除现有的所有策略（避免冲突）
DROP POLICY IF EXISTS "Enable read access for all users" ON posts;
DROP POLICY IF EXISTS "Enable read access for all users" ON categories;
DROP POLICY IF EXISTS "Enable read access for all users" ON tags;
DROP POLICY IF EXISTS "Enable read access for all users" ON profiles;
DROP POLICY IF EXISTS "Enable read access for all users" ON post_tags;

-- 3. Posts 表策略
-- 允许所有人读取已发布的文章
CREATE POLICY "Enable read access for all users" ON posts
  FOR SELECT
  USING (published = true);

-- 允许认证用户创建自己的文章
CREATE POLICY "Users can insert their own posts" ON posts
  FOR INSERT
  WITH CHECK (auth.uid() = author_id);

-- 允许认证用户更新自己的文章
CREATE POLICY "Users can update their own posts" ON posts
  FOR UPDATE
  USING (auth.uid() = author_id);

-- 允许认证用户删除自己的文章
CREATE POLICY "Users can delete their own posts" ON posts
  FOR DELETE
  USING (auth.uid() = author_id);

-- 4. Categories 表策略
-- 允许所有人读取分类
CREATE POLICY "Enable read access for all users" ON categories
  FOR SELECT
  USING (true);

-- 5. Tags 表策略
-- 允许所有人读取标签
CREATE POLICY "Enable read access for all users" ON tags
  FOR SELECT
  USING (true);

-- 6. Profiles 表策略
-- 允许所有人读取用户资料（用于显示作者信息）
CREATE POLICY "Enable read access for all users" ON profiles
  FOR SELECT
  USING (true);

-- 允许认证用户更新自己的资料
CREATE POLICY "Users can update their own profile" ON profiles
  FOR UPDATE
  USING (auth.uid() = id);

-- 7. Post_Tags 表策略
-- 允许所有人读取文章标签关联
CREATE POLICY "Enable read access for all users" ON post_tags
  FOR SELECT
  USING (true);

-- 8. Comments 表策略（如果有）
-- 允许所有人读取评论
CREATE POLICY IF NOT EXISTS "Enable read access for all users" ON comments
  FOR SELECT
  USING (true);

-- 允许认证用户创建评论
CREATE POLICY IF NOT EXISTS "Users can insert their own comments" ON comments
  FOR INSERT
  WITH CHECK (auth.uid() = author_id);

-- 允许认证用户删除自己的评论
CREATE POLICY IF NOT EXISTS "Users can delete their own comments" ON comments
  FOR DELETE
  USING (auth.uid() = author_id);
