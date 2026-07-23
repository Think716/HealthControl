-- ============================================
-- 创建 FitnessVideo（健身视频）表
-- 日期：2026-06-03
-- ============================================

CREATE TABLE IF NOT EXISTS `FitnessVideo` (
  `Id` int NOT NULL AUTO_INCREMENT,
  `CreationTime` datetime DEFAULT CURRENT_TIMESTAMP,
  `Title` varchar(255) NOT NULL COMMENT '视频标题',
  `Cover` varchar(1000) DEFAULT NULL COMMENT '封面图URL',
  `VideoUrl` varchar(1000) DEFAULT NULL COMMENT '训练视频URL',
  `ImageUrls` text DEFAULT NULL COMMENT '展示图（多图逗号分隔）',
  `BmiCategory` varchar(50) DEFAULT '通用' COMMENT 'BMI分层：偏瘦/正常/超重/肥胖/通用',
  `TrainingGoal` varchar(100) DEFAULT NULL COMMENT '训练目标：如减脂、增肌、体态改善',
  `Level` varchar(50) DEFAULT '入门' COMMENT '训练等级：入门/进阶/强化',
  `DurationMinutes` int DEFAULT 20 COMMENT '时长（分钟）',
  `Calories` int DEFAULT 120 COMMENT '消耗热量（kcal）',
  `SortOrder` int DEFAULT 100 COMMENT '排序值（越小越靠前）',
  `Status` int DEFAULT 1 COMMENT '状态：1=启用，0=停用',
  `Content` text DEFAULT NULL COMMENT '视频说明（富文本HTML）',
  PRIMARY KEY (`Id`),
  KEY `idx_fitness_video_status` (`Status`),
  KEY `idx_fitness_video_bmi` (`BmiCategory`),
  KEY `idx_fitness_video_sort` (`SortOrder`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='AI健身视频推荐表';

-- 验证
SELECT 'FitnessVideo table created or already exists' AS Result;
