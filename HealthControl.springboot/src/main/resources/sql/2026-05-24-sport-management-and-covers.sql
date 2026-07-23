CREATE TABLE IF NOT EXISTS `Sport` (
  `Id` int NOT NULL AUTO_INCREMENT,
  `CreationTime` datetime DEFAULT CURRENT_TIMESTAMP,
  `Name` varchar(255) NOT NULL,
  `Cover` varchar(1000) DEFAULT NULL,
  `Content` varchar(1000) DEFAULT NULL,
  PRIMARY KEY (`Id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `SportUnit` (
  `Id` int NOT NULL AUTO_INCREMENT,
  `CreationTime` datetime DEFAULT CURRENT_TIMESTAMP,
  `SportId` int NOT NULL,
  `UnitName` varchar(100) NOT NULL,
  `UnitValue` double NOT NULL DEFAULT 1,
  `Calories` double NOT NULL DEFAULT 0,
  PRIMARY KEY (`Id`),
  KEY `idx_sport_unit_sport_id` (`SportId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `SportRecord` (
  `Id` int NOT NULL AUTO_INCREMENT,
  `CreationTime` datetime DEFAULT CURRENT_TIMESTAMP,
  `SportId` int NOT NULL,
  `SportUnitId` int NOT NULL,
  `RecordUserId` int NOT NULL,
  `RecordTime` datetime NOT NULL,
  `RecordValue` int NOT NULL,
  PRIMARY KEY (`Id`),
  KEY `idx_sport_record_user_time` (`RecordUserId`, `RecordTime`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO `Sport` (`Id`, `Name`, `Cover`, `Content`) VALUES
(1, '跑步', 'http://localhost:7245/sport-covers/running.png', '有氧运动，能够有效提高心肺功能，燃烧脂肪，增强体质'),
(2, '游泳', 'http://localhost:7245/sport-covers/swimming.png', '全身运动，对关节冲击小，能锻炼全身肌群，提高心肺功能'),
(3, '骑行', 'http://localhost:7245/sport-covers/cycling.png', '低冲击有氧运动，能够锻炼下肢肌肉，提高心血管健康'),
(4, '健身房器械训练', 'http://localhost:7245/sport-covers/gym.png', '力量训练，能够增加肌肉量，提高基础代谢率'),
(5, '瑜伽', 'http://localhost:7245/sport-covers/yoga.png', '柔韧性训练，能够改善身体柔韧性，减压放松，增强身心平衡'),
(6, '篮球', 'http://localhost:7245/sport-covers/basketball.png', '团体运动，能够锻炼协调性，提高心肺功能和反应能力'),
(7, '羽毛球', 'http://localhost:7245/sport-covers/badminton.png', '球类运动，能够锻炼手眼协调，提高反应速度和敏捷性'),
(8, '乒乓球', 'http://localhost:7245/sport-covers/table-tennis.png', '技巧性运动，能够锻炼专注力，提高手眼协调和反应能力'),
(9, '爬山', 'http://localhost:7245/sport-covers/hiking.png', '户外有氧运动，能够锻炼下肢力量，提高心肺功能，享受自然'),
(10, '快走', 'http://localhost:7245/sport-covers/walking.png', '低强度有氧运动，适合初学者，能够改善心血管健康'),
(11, '跳绳', 'http://localhost:7245/sport-covers/jump-rope.png', '高效燃脂运动，能够快速提高心率，锻炼协调性'),
(12, '太极拳', 'http://localhost:7245/sport-covers/taichi.png', '传统运动，动作缓慢优美，能够改善平衡力，适合中老年人'),
(13, '广场舞', 'http://localhost:7245/sport-covers/dance.png', '群体运动，结合音乐和舞蹈，能够锻炼协调性，增进社交'),
(14, '仰卧起坐', 'http://localhost:7245/sport-covers/sit-up.png', '核心力量训练，主要锻炼腹部肌肉，改善核心稳定性'),
(15, '俯卧撑', 'http://localhost:7245/sport-covers/push-up.png', '上肢力量训练，主要锻炼胸肌、肩膀和三头肌')
ON DUPLICATE KEY UPDATE `Name` = VALUES(`Name`), `Cover` = VALUES(`Cover`), `Content` = VALUES(`Content`);

INSERT INTO `SportUnit` (`Id`, `SportId`, `UnitName`, `UnitValue`, `Calories`) VALUES
(1, 1, '分钟', 1, 10.5), (2, 1, '公里', 1, 70), (3, 1, '小时', 1, 630),
(4, 2, '分钟', 1, 12), (5, 2, '圈', 50, 25), (6, 2, '小时', 1, 720),
(7, 3, '分钟', 1, 8.5), (8, 3, '公里', 1, 35), (9, 3, '小时', 1, 510),
(10, 4, '分钟', 1, 6), (11, 4, '组', 1, 15), (12, 4, '小时', 1, 360),
(13, 5, '分钟', 1, 3.5), (14, 5, '节课', 60, 210),
(15, 6, '分钟', 1, 9), (16, 6, '场', 48, 432),
(17, 7, '分钟', 1, 7.5), (18, 7, '场', 30, 225),
(19, 8, '分钟', 1, 5.5), (20, 8, '场', 30, 165),
(21, 9, '分钟', 1, 11), (22, 9, '小时', 1, 660),
(23, 10, '分钟', 1, 4.5), (24, 10, '公里', 1, 45), (25, 10, '步数', 1000, 35),
(26, 11, '分钟', 1, 12.5), (27, 11, '次', 100, 15),
(28, 12, '分钟', 1, 3), (29, 12, '套', 20, 60),
(30, 13, '分钟', 1, 4), (31, 13, '支舞', 5, 20),
(32, 14, '个', 1, 0.5), (33, 14, '组', 20, 10), (34, 14, '分钟', 1, 5),
(35, 15, '个', 1, 0.6), (36, 15, '组', 15, 9), (37, 15, '分钟', 1, 6)
ON DUPLICATE KEY UPDATE `SportId` = VALUES(`SportId`), `UnitName` = VALUES(`UnitName`),
`UnitValue` = VALUES(`UnitValue`), `Calories` = VALUES(`Calories`);

UPDATE `Food` SET `Cover` = 'http://localhost:7245/food-covers/white-rice.png' WHERE `Name` = '白米饭';
UPDATE `Food` SET `Cover` = 'http://localhost:7245/food-covers/whole-wheat-bread.png' WHERE `Name` = '全麦面包';
UPDATE `Food` SET `Cover` = 'http://localhost:7245/food-covers/oatmeal.png' WHERE `Name` = '燕麦片';
UPDATE `Food` SET `Cover` = 'http://localhost:7245/food-covers/broccoli.png' WHERE `Name` = '西兰花';
UPDATE `Food` SET `Cover` = 'http://localhost:7245/food-covers/carrot.png' WHERE `Name` = '胡萝卜';
UPDATE `Food` SET `Cover` = 'http://localhost:7245/food-covers/spinach.png' WHERE `Name` = '菠菜';
UPDATE `Food` SET `Cover` = 'http://localhost:7245/food-covers/apple.png' WHERE `Name` = '苹果';
UPDATE `Food` SET `Cover` = 'http://localhost:7245/food-covers/banana.png' WHERE `Name` = '香蕉';
UPDATE `Food` SET `Cover` = 'http://localhost:7245/food-covers/orange.png' WHERE `Name` = '橙子';
UPDATE `Food` SET `Cover` = 'http://localhost:7245/food-covers/chicken-breast.png' WHERE `Name` = '鸡胸肉';
UPDATE `Food` SET `Cover` = 'http://localhost:7245/food-covers/lean-pork.png' WHERE `Name` = '猪瘦肉';
UPDATE `Food` SET `Cover` = 'http://localhost:7245/food-covers/salmon.png' WHERE `Name` = '三文鱼';
UPDATE `Food` SET `Cover` = 'http://localhost:7245/food-covers/egg.png' WHERE `Name` = '鸡蛋';
UPDATE `Food` SET `Cover` = 'http://localhost:7245/food-covers/milk.png' WHERE `Name` = '牛奶';
UPDATE `Food` SET `Cover` = 'http://localhost:7245/food-covers/yogurt.png' WHERE `Name` = '酸奶';
UPDATE `Food` SET `Cover` = 'http://localhost:7245/food-covers/soybean.png' WHERE `Name` = '黄豆';
UPDATE `Food` SET `Cover` = 'http://localhost:7245/food-covers/tofu.png' WHERE `Name` = '豆腐';
UPDATE `Food` SET `Cover` = 'http://localhost:7245/food-covers/almond.png' WHERE `Name` = '杏仁';
UPDATE `Food` SET `Cover` = 'http://localhost:7245/food-covers/walnut.png' WHERE `Name` = '核桃';
UPDATE `Food` SET `Cover` = 'http://localhost:7245/food-covers/green-tea.png' WHERE `Name` = '绿茶';
