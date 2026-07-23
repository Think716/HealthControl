-- ============================================
-- FitnessVideo 表添加 ImageUrls 字段
-- 用于存储健身视频的多张展示图（对标食谱的详细图）
-- 日期：2026-06-03
-- ============================================

SET @add_image_urls_sql = (
  SELECT IF(
    COUNT(*) = 0,
    'ALTER TABLE `FitnessVideo` ADD COLUMN `ImageUrls` TEXT DEFAULT NULL COMMENT ''展示图（多图逗号分隔）'' AFTER `VideoUrl`',
    'SELECT 1'
  )
  FROM INFORMATION_SCHEMA.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'FitnessVideo'
    AND COLUMN_NAME = 'ImageUrls'
);
PREPARE add_image_urls_stmt FROM @add_image_urls_sql;
EXECUTE add_image_urls_stmt;
DEALLOCATE PREPARE add_image_urls_stmt;

-- 验证
SELECT 'ImageUrls column added or already exists' AS Result;
