-- Adminer 4.7.7 MySQL dump

SET NAMES utf8;
SET time_zone = '+00:00';
SET foreign_key_checks = 0;
SET sql_mode = 'NO_AUTO_VALUE_ON_ZERO';

DROP TABLE IF EXISTS `account`;
CREATE TABLE `account` (
  `id` int(11) NOT NULL,
  `name` varchar(50) COLLATE utf8_unicode_ci NOT NULL,
  `email` varchar(50) COLLATE utf8_unicode_ci NOT NULL,
  `dob` date NOT NULL,
  `pseudonym` varchar(50) COLLATE utf8_unicode_ci DEFAULT NULL,
  `password` varchar(100) COLLATE utf8_unicode_ci NOT NULL,
  `permisson` tinyint(4) NOT NULL,
  `expired` datetime DEFAULT NULL,
  `verifycode` int(6) DEFAULT NULL,
  `expiredcode` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

INSERT INTO `account` (`id`, `name`, `email`, `dob`, `pseudonym`, `password`, `permisson`, `expired`, `verifycode`, `expiredcode`) VALUES
(1,	'',	'a@a.a',	'2020-06-21',	'mr Long',	'',	4,	NULL,	NULL,	NULL);

DROP TABLE IF EXISTS `category`;
CREATE TABLE `category` (
  `id` int(11) NOT NULL,
  `name` varchar(50) COLLATE utf8_unicode_ci NOT NULL,
  `parent` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `parent` (`parent`),
  CONSTRAINT `category_ibfk_1` FOREIGN KEY (`parent`) REFERENCES `category` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

INSERT INTO `category` (`id`, `name`, `parent`) VALUES
(1,	'Xã hội',	NULL),
(2,	'Chính trị',	1),
(3,	'Nhân sự mới',	1),
(4,	'Giao thông',	1),
(5,	'Đô thị',	1),
(6,	'Pháp luật',	NULL),
(7,	'Pháp đình',	6),
(8,	'Vụ án',	6),
(9,	'Thế giới',	NULL),
(10,	'Tư liệu',	9),
(11,	'Phân tích',	9),
(12,	'Người Việt 4 phương',	9),
(13,	'Chuyện lạ',	9),
(14,	'Kinh doanh',	NULL),
(15,	'Bất động sản',	14),
(16,	'Tiêu dùng',	14),
(17,	'Thương mại điện tử',	14),
(18,	'Công nghệ',	NULL),
(19,	'Internet',	18),
(20,	'Game',	18),
(21,	'Thể thao',	NULL),
(22,	'Bóng đá',	21),
(23,	'Võ thuật',	21),
(24,	'Giải trí',	NULL),
(25,	'Âm nhạc',	24),
(26,	'Phim ảnh',	24),
(27,	'Thời trang',	NULL),
(28,	'Làm đẹp',	27),
(29,	'Trang sức',	27),
(30,	'Giáo dục',	NULL),
(31,	'Tuyển sinh',	30),
(32,	'Học tiếng anh',	30),
(33,	'Du học',	30),
(34,	'Đời sống',	NULL),
(35,	'Giới trẻ',	34),
(36,	'Xu hướng',	34);

DROP TABLE IF EXISTS `comment`;
CREATE TABLE `comment` (
  `uid` int(11) NOT NULL,
  `pid` int(11) NOT NULL,
  `time` datetime NOT NULL,
  `content` text COLLATE utf8_unicode_ci NOT NULL,
  KEY `uid` (`uid`),
  KEY `pid` (`pid`),
  CONSTRAINT `comment_ibfk_1` FOREIGN KEY (`uid`) REFERENCES `account` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `comment_ibfk_2` FOREIGN KEY (`pid`) REFERENCES `post` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

INSERT INTO `comment` (`uid`, `pid`, `time`, `content`) VALUES
(1,	1,	'2020-06-21 01:59:35',	'he he'),
(1,	1,	'2020-06-21 01:59:43',	'xin chao');

DROP TABLE IF EXISTS `manage`;
CREATE TABLE `manage` (
  `uid` int(11) NOT NULL,
  `cid` int(11) NOT NULL,
  PRIMARY KEY (`uid`,`cid`),
  KEY `cid` (`cid`),
  KEY `uid` (`uid`),
  CONSTRAINT `manage_ibfk_1` FOREIGN KEY (`uid`) REFERENCES `account` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `manage_ibfk_2` FOREIGN KEY (`cid`) REFERENCES `category` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;


DROP TABLE IF EXISTS `post`;
CREATE TABLE `post` (
  `id` int(11) NOT NULL,
  `title` text COLLATE utf8_unicode_ci NOT NULL,
  `content` text COLLATE utf8_unicode_ci NOT NULL,
  `abstract` text COLLATE utf8_unicode_ci NOT NULL,
  `premium` tinyint(4) NOT NULL,
  `status` tinyint(4) NOT NULL,
  `postdate` datetime DEFAULT NULL,
  `reason` text COLLATE utf8_unicode_ci,
  `views` int(11) NOT NULL DEFAULT '0',
  `writeby` int(11) NOT NULL,
  `cid` int(11) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `cid` (`cid`),
  KEY `writeby` (`writeby`),
  FULLTEXT KEY `title_content_abstract` (`title`,`content`,`abstract`),
  CONSTRAINT `post_ibfk_1` FOREIGN KEY (`cid`) REFERENCES `category` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `post_ibfk_2` FOREIGN KEY (`writeby`) REFERENCES `account` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

INSERT INTO `post` (`id`, `title`, `content`, `abstract`, `premium`, `status`, `postdate`, `reason`, `views`, `writeby`, `cid`) VALUES
(1,	'Quốc hội dành 1 ngày bàn về phòng, chống xâm hại trẻ em',	'Trong tuần làm việc thứ 2, Quốc hội dành trọn 1 ngày để thảo luận báo cáo của đoàn giám sát về việc thực hiện chính sách, pháp luật về phòng, chống xâm hại trẻ em.\r\nTừ ngày 25 đến 28/5, Quốc hội tiếp tục tuần làm việc thứ hai theo hình thức họp trực tuyến.\r\n\r\nĐáng chú ý trong tuần này, Quốc hội sẽ nghe Chủ nhiệm Ủy ban Tư pháp Lê Thị Nga trình bày báo cáo của Đoàn giám sát của Quốc hội về việc thực hiện chính sách, pháp luật về phòng, chống xâm hại trẻ em.\r\n\r\nSau đó, Quốc hội dành trọn 1 ngày để thảo luận về báo cáo này. Nội dung này sẽ được truyền hình, phát thanh trực tiếp để cử tri và nhân dân cả nước theo dõi.',	'Ông Phạm Đăng Quyền, Phó chủ tịch UBND tỉnh Thanh Hóa, vừa bị kỷ luật cảnh cáo vì những vi phạm liên quan việc phát triển nguồn nhân lực phục vụ Khu kinh tế Nghi Sơn.',	1,	2,	'2020-06-20 03:42:46',	NULL,	1590,	1,	1);

DROP TABLE IF EXISTS `post_tag`;
CREATE TABLE `post_tag` (
  `pid` int(11) NOT NULL,
  `tid` int(11) NOT NULL,
  PRIMARY KEY (`pid`,`tid`),
  KEY `tid` (`tid`),
  KEY `pid` (`pid`),
  CONSTRAINT `post_tag_ibfk_1` FOREIGN KEY (`pid`) REFERENCES `post` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `post_tag_ibfk_2` FOREIGN KEY (`tid`) REFERENCES `tag` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

INSERT INTO `post_tag` (`pid`, `tid`) VALUES
(1,	1),
(1,	2),
(1,	3);

DROP TABLE IF EXISTS `tag`;
CREATE TABLE `tag` (
  `id` int(11) NOT NULL,
  `name` varchar(50) COLLATE utf8_unicode_ci NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

INSERT INTO `tag` (`id`, `name`) VALUES
(1,	'tag1'),
(2,	'tag2'),
(3,	'tag3');

-- 2020-06-21 09:52:47
