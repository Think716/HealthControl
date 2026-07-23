-- Organize external resource URLs into semantic folders.
-- Run after copying resource files into external-resources/{recipe-covers,recipe-images,recipe-videos,health-indicator-covers,user-avatars}.

UPDATE `Recipe` SET `Cover` = 'http://localhost:7245/recipe-covers/recipe-1-cover.jpg', `ImageUrls` = 'http://localhost:7245/recipe-images/recipe-1-1.jpg,http://localhost:7245/recipe-images/recipe-1-2.jpg', `VideoUrl` = 'http://localhost:7245/recipe-videos/recipe-1.mp4' WHERE `Id` = 1;
UPDATE `Recipe` SET `Cover` = 'http://localhost:7245/recipe-covers/recipe-2-cover.jpg', `ImageUrls` = 'http://localhost:7245/recipe-images/recipe-2-1.jpg,http://localhost:7245/recipe-images/recipe-2-2.jpg', `VideoUrl` = 'http://localhost:7245/recipe-videos/recipe-2.mp4' WHERE `Id` = 2;
UPDATE `Recipe` SET `Cover` = 'http://localhost:7245/recipe-covers/recipe-3-cover.jpg', `ImageUrls` = 'http://localhost:7245/recipe-images/recipe-3-1.jpg,http://localhost:7245/recipe-images/recipe-3-2.jpg', `VideoUrl` = 'http://localhost:7245/recipe-videos/recipe-3.mp4' WHERE `Id` = 3;
UPDATE `Recipe` SET `Cover` = 'http://localhost:7245/recipe-covers/recipe-4-cover.jpg', `ImageUrls` = 'http://localhost:7245/recipe-images/recipe-4-1.jpg,http://localhost:7245/recipe-images/recipe-4-2.jpg', `VideoUrl` = 'http://localhost:7245/recipe-videos/recipe-4.mp4' WHERE `Id` = 4;
UPDATE `Recipe` SET `Cover` = 'http://localhost:7245/recipe-covers/recipe-5-cover.jpg', `ImageUrls` = 'http://localhost:7245/recipe-images/recipe-5-1.jpg,http://localhost:7245/recipe-images/recipe-5-2.jpg', `VideoUrl` = 'http://localhost:7245/recipe-videos/recipe-5.mp4' WHERE `Id` = 5;
UPDATE `Recipe` SET `Cover` = 'http://localhost:7245/recipe-covers/recipe-6-cover.jpg', `ImageUrls` = 'http://localhost:7245/recipe-images/recipe-6-1.jpg,http://localhost:7245/recipe-images/recipe-6-2.jpg,http://localhost:7245/recipe-images/recipe-6-3.jpg', `VideoUrl` = 'http://localhost:7245/recipe-videos/recipe-6.mp4' WHERE `Id` = 6;
UPDATE `Recipe` SET `Cover` = 'http://localhost:7245/recipe-covers/recipe-7-cover.jpg', `ImageUrls` = 'http://localhost:7245/recipe-images/recipe-7-1.jpg,http://localhost:7245/recipe-images/recipe-7-2.jpg,http://localhost:7245/recipe-images/recipe-7-3.jpg', `VideoUrl` = 'http://localhost:7245/recipe-videos/recipe-7.mp4' WHERE `Id` = 7;
UPDATE `Recipe` SET `Cover` = 'http://localhost:7245/recipe-covers/recipe-8-cover.jpg', `ImageUrls` = 'http://localhost:7245/recipe-images/recipe-8-1.jpg,http://localhost:7245/recipe-images/recipe-8-2.jpg,http://localhost:7245/recipe-images/recipe-8-3.jpg', `VideoUrl` = 'http://localhost:7245/recipe-videos/recipe-8.mp4' WHERE `Id` = 8;
UPDATE `Recipe` SET `Cover` = 'http://localhost:7245/recipe-covers/recipe-9-cover.jpg', `ImageUrls` = 'http://localhost:7245/recipe-images/recipe-9-1.jpg,http://localhost:7245/recipe-images/recipe-9-2.jpg,http://localhost:7245/recipe-images/recipe-9-3.jpg', `VideoUrl` = 'http://localhost:7245/recipe-videos/recipe-9.mp4' WHERE `Id` = 9;
UPDATE `Recipe` SET `Cover` = 'http://localhost:7245/recipe-covers/recipe-10-cover.jpg', `ImageUrls` = 'http://localhost:7245/recipe-images/recipe-10-1.jpg,http://localhost:7245/recipe-images/recipe-10-2.jpg,http://localhost:7245/recipe-images/recipe-10-3.jpg', `VideoUrl` = 'http://localhost:7245/recipe-videos/recipe-10.mp4' WHERE `Id` = 10;

UPDATE `HealthIndicator` SET `Cover` = 'http://localhost:7245/health-indicator-covers/indicator-1.svg' WHERE `Id` = 1;
UPDATE `HealthIndicator` SET `Cover` = 'http://localhost:7245/health-indicator-covers/indicator-2.svg' WHERE `Id` = 2;
UPDATE `HealthIndicator` SET `Cover` = 'http://localhost:7245/health-indicator-covers/indicator-3.svg' WHERE `Id` = 3;
UPDATE `HealthIndicator` SET `Cover` = 'http://localhost:7245/health-indicator-covers/indicator-10.svg' WHERE `Id` = 10;
UPDATE `HealthIndicator` SET `Cover` = 'http://localhost:7245/health-indicator-covers/indicator-11.svg' WHERE `Id` = 11;
UPDATE `HealthIndicator` SET `Cover` = 'http://localhost:7245/health-indicator-covers/indicator-12.svg' WHERE `Id` = 12;
UPDATE `HealthIndicator` SET `Cover` = 'http://localhost:7245/health-indicator-covers/indicator-13.svg' WHERE `Id` = 13;
UPDATE `HealthIndicator` SET `Cover` = 'http://localhost:7245/health-indicator-covers/indicator-20.svg' WHERE `Id` = 20;
UPDATE `HealthIndicator` SET `Cover` = 'http://localhost:7245/health-indicator-covers/indicator-21.svg' WHERE `Id` = 21;
UPDATE `HealthIndicator` SET `Cover` = 'http://localhost:7245/health-indicator-covers/indicator-30.svg' WHERE `Id` = 30;
UPDATE `HealthIndicator` SET `Cover` = 'http://localhost:7245/health-indicator-covers/indicator-31.svg' WHERE `Id` = 31;
UPDATE `HealthIndicator` SET `Cover` = 'http://localhost:7245/health-indicator-covers/indicator-32.svg' WHERE `Id` = 32;
UPDATE `HealthIndicator` SET `Cover` = 'http://localhost:7245/health-indicator-covers/indicator-33.svg' WHERE `Id` = 33;
UPDATE `HealthIndicator` SET `Cover` = 'http://localhost:7245/health-indicator-covers/indicator-40.svg' WHERE `Id` = 40;
UPDATE `HealthIndicator` SET `Cover` = 'http://localhost:7245/health-indicator-covers/indicator-41.svg' WHERE `Id` = 41;
UPDATE `HealthIndicator` SET `Cover` = 'http://localhost:7245/health-indicator-covers/indicator-50.svg' WHERE `Id` = 50;
UPDATE `HealthIndicator` SET `Cover` = 'http://localhost:7245/health-indicator-covers/indicator-51.svg' WHERE `Id` = 51;
UPDATE `HealthIndicator` SET `Cover` = 'http://localhost:7245/health-indicator-covers/indicator-52.svg' WHERE `Id` = 52;
UPDATE `HealthIndicator` SET `Cover` = 'http://localhost:7245/health-indicator-covers/indicator-60.svg' WHERE `Id` = 60;
UPDATE `HealthIndicator` SET `Cover` = 'http://localhost:7245/health-indicator-covers/indicator-61.svg' WHERE `Id` = 61;
UPDATE `HealthIndicator` SET `Cover` = 'http://localhost:7245/health-indicator-covers/indicator-62.svg' WHERE `Id` = 62;
UPDATE `HealthIndicator` SET `Cover` = 'http://localhost:7245/health-indicator-covers/indicator-70.svg' WHERE `Id` = 70;
UPDATE `HealthIndicator` SET `Cover` = 'http://localhost:7245/health-indicator-covers/indicator-71.svg' WHERE `Id` = 71;
UPDATE `HealthIndicator` SET `Cover` = 'http://localhost:7245/health-indicator-covers/indicator-72.svg' WHERE `Id` = 72;
UPDATE `HealthIndicator` SET `Cover` = 'http://localhost:7245/health-indicator-covers/indicator-73.svg' WHERE `Id` = 73;
UPDATE `HealthIndicator` SET `Cover` = 'http://localhost:7245/health-indicator-covers/indicator-80.svg' WHERE `Id` = 80;
UPDATE `HealthIndicator` SET `Cover` = 'http://localhost:7245/health-indicator-covers/indicator-81.svg' WHERE `Id` = 81;
UPDATE `HealthIndicator` SET `Cover` = 'http://localhost:7245/health-indicator-covers/indicator-90.svg' WHERE `Id` = 90;
UPDATE `HealthIndicator` SET `Cover` = 'http://localhost:7245/health-indicator-covers/indicator-91.svg' WHERE `Id` = 91;
UPDATE `HealthIndicator` SET `Cover` = 'http://localhost:7245/health-indicator-covers/indicator-92.svg' WHERE `Id` = 92;
UPDATE `HealthIndicator` SET `Cover` = 'http://localhost:7245/health-indicator-covers/indicator-107.svg' WHERE `Id` = 107;
UPDATE `HealthIndicator` SET `Cover` = 'http://localhost:7245/health-indicator-covers/indicator-108.svg' WHERE `Id` = 108;
UPDATE `HealthIndicator` SET `Cover` = 'http://localhost:7245/health-indicator-covers/indicator-109.svg' WHERE `Id` = 109;
UPDATE `HealthIndicator` SET `Cover` = 'http://localhost:7245/health-indicator-covers/indicator-110.svg' WHERE `Id` = 110;
UPDATE `HealthIndicator` SET `Cover` = 'http://localhost:7245/health-indicator-covers/indicator-111.svg' WHERE `Id` = 111;
UPDATE `HealthIndicator` SET `Cover` = 'http://localhost:7245/health-indicator-covers/indicator-112.svg' WHERE `Id` = 112;
UPDATE `HealthIndicator` SET `Cover` = 'http://localhost:7245/health-indicator-covers/indicator-113.svg' WHERE `Id` = 113;
UPDATE `HealthIndicator` SET `Cover` = 'http://localhost:7245/health-indicator-covers/indicator-114.svg' WHERE `Id` = 114;
UPDATE `HealthIndicator` SET `Cover` = 'http://localhost:7245/health-indicator-covers/indicator-116.svg' WHERE `Id` = 116;
UPDATE `HealthIndicator` SET `Cover` = 'http://localhost:7245/health-indicator-covers/indicator-117.svg' WHERE `Id` = 117;
UPDATE `HealthIndicator` SET `Cover` = 'http://localhost:7245/health-indicator-covers/indicator-118.svg' WHERE `Id` = 118;
UPDATE `HealthIndicator` SET `Cover` = 'http://localhost:7245/health-indicator-covers/indicator-119.svg' WHERE `Id` = 119;

UPDATE `AppUser` SET `ImageUrls` = 'http://localhost:7245/user-avatars/user-2.svg' WHERE `Id` = 2;
