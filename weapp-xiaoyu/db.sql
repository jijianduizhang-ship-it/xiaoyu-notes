-- =============================================
-- 小语笔记 数据库表结构
-- =============================================

-- ----------------------------
-- 1. 用户表
-- ----------------------------
CREATE TABLE IF NOT EXISTS `users` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `openid` varchar(64) NOT NULL COMMENT '微信openid',
  `unionid` varchar(64) DEFAULT NULL COMMENT '微信unionid',
  `nickname` varchar(64) DEFAULT '' COMMENT '昵称',
  `avatar` varchar(255) DEFAULT '' COMMENT '头像URL',
  `gender` tinyint(1) DEFAULT 0 COMMENT '性别 0未知 1男 2女',
  `phone` varchar(20) DEFAULT NULL COMMENT '手机号',
  `lang` varchar(20) DEFAULT 'korean' COMMENT '当前语言',
  `level` tinyint(2) DEFAULT 1 COMMENT '当前等级',
  `is_vip` tinyint(1) DEFAULT 0 COMMENT '是否VIP 0否 1是',
  `vip_expire_time` datetime DEFAULT NULL COMMENT 'VIP到期时间',
  `total_minutes` int(11) DEFAULT 0 COMMENT '累计学习时长(分钟)',
  `today_minutes` int(11) DEFAULT 0 COMMENT '今日学习时长(分钟)',
  `today_date` date DEFAULT NULL COMMENT '今日日期(用于统计)',
  `words_count` int(11) DEFAULT 0 COMMENT '累计单词数',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_openid` (`openid`),
  KEY `idx_unionid` (`unionid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户表';

-- ----------------------------
-- 2. 会员套餐表
-- ----------------------------
CREATE TABLE IF NOT EXISTS `vip_packages` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(32) NOT NULL COMMENT '套餐名称',
  `months` int(11) NOT NULL COMMENT '月数',
  `price` decimal(10,2) NOT NULL COMMENT '价格(元)',
  `original_price` decimal(10,2) DEFAULT NULL COMMENT '原价',
  `tag` varchar(32) DEFAULT NULL COMMENT '标签',
  `benefit` varchar(64) DEFAULT NULL COMMENT '权益说明',
  `sort` int(11) DEFAULT 0 COMMENT '排序',
  `status` tinyint(1) DEFAULT 1 COMMENT '状态 0下架 1上架',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='会员套餐表';

-- 初始数据
INSERT INTO `vip_packages` (`name`, `months`, `price`, `tag`, `benefit`, `sort`) VALUES
('三个月', 3, 89.00, '早鸟价', '不限时长', 1),
('一年', 12, 159.00, '加送1个月', '不限时长', 2),
('永久', 999, 278.00, '限时特惠', '不限时长', 3);

-- ----------------------------
-- 3. 会员订单表
-- ----------------------------
CREATE TABLE IF NOT EXISTS `vip_orders` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `order_no` varchar(64) NOT NULL COMMENT '订单号',
  `user_id` int(11) NOT NULL,
  `package_id` int(11) NOT NULL,
  `price` decimal(10,2) NOT NULL COMMENT '支付金额',
  `status` tinyint(1) DEFAULT 0 COMMENT '状态 0待支付 1已支付 2已取消 3已退款',
  `pay_time` datetime DEFAULT NULL COMMENT '支付时间',
  `pay_type` varchar(20) DEFAULT NULL COMMENT '支付方式',
  `transaction_id` varchar(64) DEFAULT NULL COMMENT '微信订单号',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_order_no` (`order_no`),
  KEY `idx_user_id` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='会员订单表';

-- ----------------------------
-- 4. 课程表
-- ----------------------------
CREATE TABLE IF NOT EXISTS `courses` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `unit` varchar(32) NOT NULL COMMENT '单元名称',
  `name` varchar(64) NOT NULL COMMENT '课程名称',
  `description` varchar(255) DEFAULT NULL COMMENT '课程描述',
  `day` int(11) DEFAULT NULL COMMENT '所需天数',
  `is_free` tinyint(1) DEFAULT 0 COMMENT '是否免费',
  `lang` varchar(20) DEFAULT 'korean' COMMENT '所属语言',
  `sort` int(11) DEFAULT 0 COMMENT '排序',
  `status` tinyint(1) DEFAULT 1 COMMENT '状态 0隐藏 1显示',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='课程表';

-- 初始数据
INSERT INTO `courses` (`unit`, `name`, `description`, `day`, `is_free`, `lang`, `sort`) VALUES
('Unit 1 问候与介绍', '嗨，新朋友', '与新朋友进行简单的自我介绍', 1, 1, 'korean', 1),
('Unit 1 问候与介绍', '自我介绍', '学习如何用日语进行简单的自我介绍', 2, 0, 'korean', 2),
('Unit 1 问候与介绍', '我的好朋友', '介绍你的好朋友并谈论你们的友谊', 3, 0, 'korean', 3),
('Unit 2 颜色与形状', '身边的颜色', '学习描述和识别身边的颜色', 4, 0, 'korean', 4),
('Unit 2 颜色与形状', '数数', '学习基本的数数技巧，掌握从1到100', 5, 0, 'korean', 5);

-- ----------------------------
-- 5. 学习进度表
-- ----------------------------
CREATE TABLE IF NOT EXISTS `course_progress` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL,
  `course_id` int(11) NOT NULL,
  `status` tinyint(1) DEFAULT 0 COMMENT '状态 0未学 1学习中 2已完成',
  `learn_times` int(11) DEFAULT 0 COMMENT '学习次数',
  `last_learn_time` datetime DEFAULT NULL COMMENT '最后学习时间',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_user_course` (`user_id`, `course_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='学习进度表';

-- ----------------------------
-- 6. 单词书表
-- ----------------------------
CREATE TABLE IF NOT EXISTS `word_books` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(64) NOT NULL COMMENT '书名',
  `description` varchar(255) DEFAULT NULL COMMENT '描述',
  `cover` varchar(255) DEFAULT NULL COMMENT '封面图',
  `word_count` int(11) DEFAULT 0 COMMENT '单词数',
  `lang` varchar(20) DEFAULT 'korean' COMMENT '语言',
  `icon` varchar(32) DEFAULT 'book' COMMENT '图标',
  `sort` int(11) DEFAULT 0 COMMENT '排序',
  `status` tinyint(1) DEFAULT 1 COMMENT '状态',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='单词书表';

-- 初始数据
INSERT INTO `word_books` (`name`, `description`, `word_count`, `lang`, `icon`, `sort`) VALUES
('主题单词库', '30+日常生活实用主题', 1500, 'korean', 'book', 1),
('维他命韩语', '宋雨琦推荐的韩语词书！', 800, 'korean', 'star', 2),
('金龙一乱序', '包含初级、中高级的Topik高频词', 2000, 'korean', 'fire', 3),
('延世韩国语', '旧版《延世韩国语》1-6册单词', 3000, 'korean', 'book', 4),
('topik语料库', '大作文语料库', 500, 'korean', 'file', 5);

-- ----------------------------
-- 7. 场景表
-- ----------------------------
CREATE TABLE IF NOT EXISTS `scenes` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `title` varchar(64) NOT NULL COMMENT '场景标题',
  `description` varchar(255) DEFAULT NULL COMMENT '场景描述',
  `cover` varchar(255) DEFAULT NULL COMMENT '封面图',
  `category` varchar(32) DEFAULT NULL COMMENT '分类',
  `is_hot` tinyint(1) DEFAULT 0 COMMENT '是否热门',
  `view_count` int(11) DEFAULT 0 COMMENT '浏览次数',
  `favor_count` int(11) DEFAULT 0 COMMENT '收藏次数',
  `lang` varchar(20) DEFAULT 'korean' COMMENT '语言',
  `sort` int(11) DEFAULT 0 COMMENT '排序',
  `status` tinyint(1) DEFAULT 1 COMMENT '状态',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='场景表';

-- 初始数据
INSERT INTO `scenes` (`title`, `description`, `category`, `is_hot`, `view_count`, `lang`, `sort`) VALUES
('办理登机', '在机场办理登机手续', 'travel', 1, 1500, 'korean', 1),
('商场购物', '如何在商场内顺利购物并与店员交流', 'shopping', 1, 207, 'korean', 2),
('免税便利店', '在免税便利店购物并了解相关政策', 'shopping', 1, 81, 'korean', 3),
('研究生面试', '准备并顺利通过研究生的面试', 'academic', 1, 71, 'korean', 4),
('医院挂号流程', '了解医院的挂号流程并顺利', 'medical', 0, 52, 'korean', 5),
('七夕情人节', '庆祝七夕情人节，表达爱意', 'romance', 0, 38, 'korean', 6);

-- ----------------------------
-- 8. 聊天记录表
-- ----------------------------
CREATE TABLE IF NOT EXISTS `chat_messages` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL,
  `scene_id` int(11) DEFAULT NULL COMMENT '场景ID',
  `course_id` int(11) DEFAULT NULL COMMENT '课程ID',
  `role` varchar(16) NOT NULL COMMENT '角色 user/assistant',
  `lang` varchar(20) DEFAULT 'korean' COMMENT '语言',
  `level` tinyint(2) DEFAULT 1 COMMENT '等级',
  `content` text NOT NULL COMMENT '发送内容',
  `cn_content` text DEFAULT NULL COMMENT '中文翻译',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_user_scene` (`user_id`, `scene_id`),
  KEY `idx_user_course` (`user_id`, `course_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='聊天记录表';

-- ----------------------------
-- 9. 收藏表（场景、单词）
-- ----------------------------
CREATE TABLE IF NOT EXISTS `favorites` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL,
  `type` varchar(16) NOT NULL COMMENT '类型 scene/word',
  `target_id` int(11) NOT NULL COMMENT '目标ID',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_user_type_target` (`user_id`, `type`, `target_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='收藏表';

-- ----------------------------
-- 10. 每日学习记录表
-- ----------------------------
CREATE TABLE IF NOT EXISTS `daily_stats` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL,
  `date` date NOT NULL COMMENT '日期',
  `minutes` int(11) DEFAULT 0 COMMENT '学习分钟数',
  `words_learned` int(11) DEFAULT 0 COMMENT '学习单词数',
  `chats_count` int(11) DEFAULT 0 COMMENT '对话次数',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_user_date` (`user_id`, `date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='每日学习记录表';
