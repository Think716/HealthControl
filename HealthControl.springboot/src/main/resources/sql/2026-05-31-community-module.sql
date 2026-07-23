CREATE TABLE IF NOT EXISTS `CommunityPost` (
  `Id` int NOT NULL AUTO_INCREMENT,
  `CreationTime` datetime DEFAULT CURRENT_TIMESTAMP,
  `PublishUserId` int DEFAULT NULL,
  `PostType` varchar(50) DEFAULT NULL,
  `Content` text,
  `ImageUrls` text,
  `Tags` varchar(255) DEFAULT NULL,
  `SourceType` varchar(50) DEFAULT NULL,
  `SourceId` int DEFAULT NULL,
  `AiComment` varchar(500) DEFAULT NULL,
  `AuditStatus` int DEFAULT 1,
  `AuditReply` varchar(500) DEFAULT NULL,
  `AuditUserId` int DEFAULT NULL,
  `AuditTime` datetime DEFAULT NULL,
  `Status` int DEFAULT 1,
  `LikeCount` int DEFAULT 0,
  `CommentCount` int DEFAULT 0,
  `CollectCount` int DEFAULT 0,
  PRIMARY KEY (`Id`),
  KEY `idx_community_post_user` (`PublishUserId`),
  KEY `idx_community_post_audit` (`AuditStatus`),
  KEY `idx_community_post_time` (`CreationTime`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `CommunityComment` (
  `Id` int NOT NULL AUTO_INCREMENT,
  `CreationTime` datetime DEFAULT CURRENT_TIMESTAMP,
  `PostId` int DEFAULT NULL,
  `CommentUserId` int DEFAULT NULL,
  `Content` varchar(1000) DEFAULT NULL,
  `Status` int DEFAULT 1,
  PRIMARY KEY (`Id`),
  KEY `idx_community_comment_post` (`PostId`),
  KEY `idx_community_comment_user` (`CommentUserId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `CommunityTag` (
  `Id` int NOT NULL AUTO_INCREMENT,
  `CreationTime` datetime DEFAULT CURRENT_TIMESTAMP,
  `Name` varchar(50) NOT NULL,
  `Sort` int DEFAULT 0,
  PRIMARY KEY (`Id`),
  UNIQUE KEY `uk_community_tag_name` (`Name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `CommunityReport` (
  `Id` int NOT NULL AUTO_INCREMENT,
  `CreationTime` datetime DEFAULT CURRENT_TIMESTAMP,
  `PostId` int DEFAULT NULL,
  `ReportUserId` int DEFAULT NULL,
  `Reason` varchar(255) DEFAULT NULL,
  `Status` int DEFAULT 1,
  `HandleReply` varchar(500) DEFAULT NULL,
  PRIMARY KEY (`Id`),
  KEY `idx_community_report_post` (`PostId`),
  KEY `idx_community_report_status` (`Status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT IGNORE INTO `CommunityTag` (`Name`, `Sort`) VALUES
('减脂', 1),
('增肌', 2),
('健康早餐', 3),
('健身餐', 4),
('饮食分享', 5),
('健康知识', 6);

SET @add_is_recommend_sql = (
  SELECT IF(
    COUNT(*) = 0,
    'ALTER TABLE `Recipe` ADD COLUMN `IsRecommend` int DEFAULT 0',
    'SELECT 1'
  )
  FROM INFORMATION_SCHEMA.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'Recipe'
    AND COLUMN_NAME = 'IsRecommend'
);
PREPARE add_is_recommend_stmt FROM @add_is_recommend_sql;
EXECUTE add_is_recommend_stmt;
DEALLOCATE PREPARE add_is_recommend_stmt;
