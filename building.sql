-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1:3307
-- Generation Time: Oct 20, 2024 at 08:05 AM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `building`
--

-- --------------------------------------------------------

--
-- Table structure for table `contractor`
--

CREATE TABLE `contractor` (
  `Id` int(11) NOT NULL,
  `Name` varchar(255) NOT NULL,
  `National_Code` varchar(20) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `contractor`
--

INSERT INTO `contractor` (`Id`, `Name`, `National_Code`) VALUES
(0, 'xcsczdc', 'scdzxc zdx'),
(1, 'aaa', 'aaa');

-- --------------------------------------------------------

--
-- Table structure for table `documents`
--

CREATE TABLE `documents` (
  `Id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `contractor_id` int(11) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `status` varchar(50) DEFAULT NULL,
  `instructions` varchar(255) DEFAULT NULL,
  `contract` varchar(255) DEFAULT NULL,
  `permissions` varchar(255) DEFAULT NULL,
  `map` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `documents`
--

INSERT INTO `documents` (`Id`, `name`, `contractor_id`, `description`, `status`, `instructions`, `contract`, `permissions`, `map`) VALUES
(1, 'Document Name', 1, 'Document description', 'uploads\\1721790626052.pdf', 'uploads\\1721790626060.pdf', 'uploads\\1721790626070.pdf', 'uploads\\1721790626081.pdf', 'uploads\\1721790626088.pdf'),
(2, 'Document Name', 1, 'Document description', 'uploads\\documents\\1721790778635.pdf', 'uploads\\documents\\1721790778643.pdf', 'uploads\\documents\\1721790778656.pdf', 'uploads\\documents\\1721790778667.pdf', 'uploads\\documents\\1721790778682.pdf'),
(3, 'Document Name', 1, 'Document description', 'uploads\\documents\\1721801797396.pdf', 'uploads\\documents\\1721801797409.pdf', 'uploads\\documents\\1721801797419.pdf', 'uploads\\documents\\1721801797432.pdf', 'uploads\\documents\\1721801797446.pdf'),
(4, 'Document Name', 1, 'Document description', NULL, 'uploads\\documents\\1721801839591.pdf', 'uploads\\documents\\1721801839606.pdf', 'uploads\\documents\\1721801839621.pdf', 'uploads\\documents\\1721801839637.pdf'),
(5, 'Document Name', 1, 'Document description', NULL, 'uploads\\documents\\1721801903445.pdf', 'uploads\\documents\\1721801903461.pdf', 'uploads\\documents\\1721801903476.pdf', 'uploads\\documents\\1721801903495.pdf');

-- --------------------------------------------------------

--
-- Table structure for table `employees`
--

CREATE TABLE `employees` (
  `id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `position` varchar(255) DEFAULT NULL,
  `contact_info` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `employees`
--

INSERT INTO `employees` (`id`, `name`, `position`, `contact_info`) VALUES
(1, 'dfvsdvs', 'dfsdv', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `messages`
--

CREATE TABLE `messages` (
  `id` int(11) NOT NULL,
  `sender_id` int(11) NOT NULL,
  `receiver_id` int(11) NOT NULL,
  `message` text DEFAULT NULL,
  `file_path` varchar(255) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `read` tinyint(1) DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `messages`
--

INSERT INTO `messages` (`id`, `sender_id`, `receiver_id`, `message`, `file_path`, `created_at`, `read`) VALUES
(3, 2, 3, 'your_message', '[]', '2024-07-15 15:38:58', 0),
(4, 8, 9, 'your_message', '[]', '2024-07-16 08:00:56', 0),
(5, 7, 9, 'your_message', '[\"uploads\\\\messages\\\\files-1721117207878-316311005-project.pdf\"]', '2024-07-16 08:06:47', 0),
(6, 2, 8, 'your_message', '[\"uploads\\\\messages\\\\files-1721117707135-845134402-project.pdf\"]', '2024-07-16 08:15:07', 0),
(7, 2, 9, 'your_message', '[\"uploads\\\\messages\\\\files-1721800336203-737432451-project.pdf\"]', '2024-07-24 05:52:16', 0),
(8, 2, 9, 'dmvsfklnbjdvmflv', '[\"uploads\\\\messages\\\\files-1721800371632-948726862-project.pdf\"]', '2024-07-24 05:52:51', 0),
(9, 2, 9, 'dmvsfklnbjdvmflv', '[\"uploads\\\\messages\\\\files-1721800427776-385752341-project.pdf\",\"uploads\\\\messages\\\\files-1721800427786-279395800-tamrin.pdf\"]', '2024-07-24 05:53:47', 0);

-- --------------------------------------------------------

--
-- Table structure for table `projects`
--

CREATE TABLE `projects` (
  `id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `size_square_meters` int(11) NOT NULL,
  `contractor` varchar(255) DEFAULT NULL,
  `address_of_the_first_file` varchar(255) DEFAULT NULL,
  `address_of_the_second_file` varchar(255) DEFAULT NULL,
  `start_date` datetime NOT NULL,
  `end_date` datetime NOT NULL,
  `application_type` enum('مسکونی','تجاری','مسکونی و تجاری','صنعتی','آموزشی','بهداشتی و درمانی','معدن','خدماتی(هتل، مسافرخانه و ...)','ورزشی') NOT NULL,
  `number_of_floors` int(11) DEFAULT NULL,
  `employee_id` int(11) DEFAULT NULL,
  `consultant` varchar(255) DEFAULT NULL,
  `supervisor` varchar(255) DEFAULT NULL,
  `number_of_manpower` int(11) DEFAULT NULL,
  `province_id` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `projects`
--

INSERT INTO `projects` (`id`, `name`, `size_square_meters`, `contractor`, `address_of_the_first_file`, `address_of_the_second_file`, `start_date`, `end_date`, `application_type`, `number_of_floors`, `employee_id`, `consultant`, `supervisor`, `number_of_manpower`, `province_id`) VALUES
(2, 'Example Project\n', 1000, 'John Doe Construction', '', '', '2024-03-05 00:00:00', '2024-08-05 00:00:00', 'مسکونی', NULL, NULL, NULL, NULL, NULL, NULL),
(3, 'Example Project\n', 1000, 'John Doe Construction', '', '', '2024-03-05 00:00:00', '2024-08-05 00:00:00', 'مسکونی', NULL, NULL, NULL, NULL, NULL, NULL),
(4, 'Example Project\n', 1000, 'John Doe Construction', '', '', '2024-03-05 00:00:00', '2024-08-05 00:00:00', 'مسکونی', NULL, NULL, NULL, NULL, NULL, NULL),
(5, 'Example Project\n', 1000, 'John Doe Construction', '', '', '2024-03-05 00:00:00', '2024-08-05 00:00:00', 'مسکونی', NULL, NULL, NULL, NULL, NULL, NULL),
(6, 'Example Project\n', 1000, 'John Doe Construction', '', '', '2024-03-05 00:00:00', '2024-08-05 00:00:00', 'مسکونی', NULL, NULL, NULL, NULL, NULL, NULL),
(11, 'Example Project\n', 1000, 'John Doe Construction', 'uploads\\address_of_the_first_file-1709623691137-551632178-Screenshot (2).png', 'uploads\\address_of_the_second_file-1709623691141-995591336-Screenshot (4).png', '2024-03-05 00:00:00', '2024-08-05 00:00:00', 'مسکونی', NULL, NULL, NULL, NULL, NULL, NULL),
(13, 'Example Project\n', 1000, 'John Doe Construction', 'uploads\\address_of_the_first_file-1709623692836-46011709-Screenshot (2).png', 'uploads\\address_of_the_second_file-1709623692838-996411117-Screenshot (4).png', '2024-03-05 00:00:00', '2024-08-05 00:00:00', 'مسکونی', NULL, NULL, NULL, NULL, NULL, NULL),
(14, 'Example Project\n', 1000, 'John Doe Construction', 'uploads\\address_of_the_first_file-1709623693508-225322104-Screenshot (2).png', 'uploads\\address_of_the_second_file-1709623693510-415181002-Screenshot (4).png', '2024-03-05 00:00:00', '2024-08-05 00:00:00', 'مسکونی', NULL, NULL, NULL, NULL, NULL, NULL),
(17, 'Example Project\n', 1000, 'John Doe Construction', 'uploads\\address_of_the_first_file-1709624491229-519864653-Screenshot (2).png', 'uploads\\address_of_the_second_file-1709624491233-201516920-Screenshot (4).png', '2024-03-05 00:00:00', '2024-08-05 00:00:00', 'مسکونی', NULL, NULL, NULL, NULL, NULL, NULL),
(25, 'Example Project\n', 1000, 'John Doe Construction', 'uploads\\address_of_the_first_file-1709639996545-684543873-Screenshot (2).png', 'uploads\\address_of_the_second_file-1709639996553-741003297-Screenshot (4).png', '2024-03-05 00:00:00', '2024-08-05 00:00:00', 'مسکونی', NULL, NULL, NULL, NULL, NULL, NULL),
(26, 'Example Project\n', 1000, 'John Doe Construction', 'uploads\\address_of_the_first_file-1709640005217-429884969-Screenshot (2).png', 'uploads\\address_of_the_second_file-1709640005221-439085917-Screenshot (4).png', '2024-03-05 00:00:00', '2024-08-05 00:00:00', 'مسکونی', NULL, NULL, NULL, NULL, NULL, NULL),
(30, 'New Project', 1000, 'Contractor Name', 'uploads\\address_of_the_first_file-1721792609156-118752569-tamrin.pdf', 'uploads\\address_of_the_second_file-1721792609159-939748072-tamrin.pdf', '2024-07-01 00:00:00', '2025-07-01 00:00:00', 'تجاری', 5, 1, 'Consultant Name', 'Supervisor Name', 50, NULL),
(31, 'New Project', 1000, 'Contractor Name', 'uploads\\address_of_the_first_file-1721792983509-728079239-tamrin.pdf', 'uploads\\address_of_the_second_file-1721792983514-522132255-tamrin.pdf', '2024-07-01 00:00:00', '2025-07-01 00:00:00', 'تجاری', 5, 1, 'Consultant Name', 'Supervisor Name', 50, NULL),
(32, 'aaa', 1000, 'Contractor Name', 'uploads\\address_of_the_first_file-1721793051846-160755645-tamrin.pdf', 'uploads\\address_of_the_second_file-1721793051851-306520210-tamrin.pdf', '2024-07-01 00:00:00', '2025-07-01 00:00:00', 'تجاری', 5, 1, 'Consultant Name', 'Supervisor Name', 50, NULL),
(33, 'aaa', 1000, 'Contractor Name', 'uploads\\address_of_the_first_file-1721793091553-577344358-tamrin.pdf', 'uploads\\address_of_the_second_file-1721793091559-758249598-tamrin.pdf', '2024-07-01 00:00:00', '2025-07-01 00:00:00', 'تجاری', 5, 1, 'Consultant Name', 'Supervisor Name', 50, 1),
(34, 'aaa', 1000, 'Contractor Name', 'uploads\\address_of_the_first_file-1723014537158-247721576-tamrin.pdf', 'uploads\\address_of_the_second_file-1723014537172-971888396-tamrin.pdf', '2024-07-01 00:00:00', '2025-07-01 00:00:00', 'تجاری', 5, 1, 'Consultant Name', 'Supervisor Name', 50, 1),
(35, 'maaa', 1000, 'Contractor Name', 'uploads\\address_of_the_first_file-1723014552663-176611533-tamrin.pdf', 'uploads\\address_of_the_second_file-1723014552670-567556056-tamrin.pdf', '2024-07-01 00:00:00', '2025-07-01 00:00:00', 'تجاری', 5, 1, 'Consultant Name', 'Supervisor Name', 50, 1),
(36, 'maaa', 1000, 'Contractor Name', '', '', '2024-07-01 00:00:00', '2025-07-01 00:00:00', 'تجاری', 5, 1, 'Consultant Name', 'Supervisor Name', 50, 1),
(37, 'mohammad', 1000, 'Contractor Name', '', '', '2024-07-01 00:00:00', '2025-07-01 00:00:00', 'تجاری', 5, 1, 'Consultant Name', 'Supervisor Name', 50, 1);

-- --------------------------------------------------------

--
-- Table structure for table `project_excel_files`
--

CREATE TABLE `project_excel_files` (
  `id` int(11) NOT NULL,
  `project_id` int(11) NOT NULL,
  `wbs` varchar(50) DEFAULT NULL,
  `wbs_name` varchar(255) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `resources` varchar(255) DEFAULT NULL,
  `date` date DEFAULT NULL,
  `estimated_cost` decimal(10,2) DEFAULT NULL,
  `deliverables` text DEFAULT NULL,
  `work_progress` decimal(5,2) DEFAULT NULL,
  `status` varchar(50) DEFAULT NULL,
  `actual_cost` decimal(10,2) DEFAULT NULL,
  `subtask_progress` decimal(5,2) DEFAULT NULL,
  `prerequisite` varchar(255) DEFAULT NULL,
  `forecasted_cost` decimal(10,2) DEFAULT NULL,
  `subtask_forecasted_progress` decimal(5,2) DEFAULT NULL,
  `forecasted_start_date` date DEFAULT NULL,
  `forecasted_end_date` date DEFAULT NULL,
  `actual_end_date` date DEFAULT NULL,
  `pv` decimal(10,2) DEFAULT NULL,
  `ev` decimal(10,2) DEFAULT NULL,
  `ac` decimal(10,2) DEFAULT NULL,
  `cpi` decimal(10,2) DEFAULT NULL,
  `spi` decimal(10,2) DEFAULT NULL,
  `sv` decimal(10,2) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `project_excel_files`
--

INSERT INTO `project_excel_files` (`id`, `project_id`, `wbs`, `wbs_name`, `description`, `resources`, `date`, `estimated_cost`, `deliverables`, `work_progress`, `status`, `actual_cost`, `subtask_progress`, `prerequisite`, `forecasted_cost`, `subtask_forecasted_progress`, `forecasted_start_date`, `forecasted_end_date`, `actual_end_date`, `pv`, `ev`, `ac`, `cpi`, `spi`, `sv`) VALUES
(98, 37, '1', 'پروژه حجازی', 'شروع قرارداد', 'سازنده/وکیل قانونی پیمانکار', '1404-02-12', 10000.00, 'aa', 2.00, 'done', 200.00, 100.00, NULL, 5000.00, 100.00, '1404-02-12', '1404-02-12', '1404-02-12', 10000.00, 10000.00, 200.00, 50.00, 1.00, 0.00),
(99, 37, '1.1', 'عقد قرارداد', 'عقد قرارداد', 'سازنده/وکیل قانونی پیمانکار', '1404-02-06', 10000.00, 'aasdsd', 10.00, 'inProgress', 100.00, 50.00, NULL, 4000.00, 70.00, '1404-02-12', '1404-02-12', '1404-02-12', 7000.00, 5000.00, 100.00, 50.00, 0.71, -2000.00),
(100, 37, '1.2', 'فاز آغازین', 'مطالعات فاز صفر و فعالیت‌های ماقبل مهندسی تا دستور نقشه', 'سازنده/وکیل قانونی پیمانکار', '1404-02-07', 10000.00, 'sdsdf', 50.00, 'done', 3000.00, 40.00, NULL, 3000.00, 30.00, '1404-02-12', '1404-02-12', '1404-02-12', 3000.00, 4000.00, 3000.00, 1.33, 1.33, 1000.00),
(101, 37, '1.3', 'اخذ پروانه', 'انجام تمامی فعالیت‌های مربوط به نهادهای ذی ربط', 'سازنده/وکیل قانونی پیمانکار', '1404-02-09', 10000.00, 'sdsdf', 20.00, 'done', 400.00, 30.00, '1.1', NULL, 20.00, '1404-02-12', '1404-02-12', '1404-02-12', 2000.00, 3000.00, 400.00, 7.50, 1.50, 1000.00),
(102, 37, '1.4', 'دریافت مجوز تخریب', 'مجوز تخریب از نهادهای ذی ربط', 'سازنده/وکیل قانونی پیمانکار', '1404-02-10', 10000.00, 'aasdsd', 18.00, 'Not Started', 500.00, 20.00, '1.1', NULL, 10.00, '1404-02-12', '1404-02-12', '1404-02-12', 1000.00, 2000.00, 500.00, 4.00, 2.00, 1000.00);

-- --------------------------------------------------------

--
-- Table structure for table `project_tasks`
--

CREATE TABLE `project_tasks` (
  `id` int(11) NOT NULL,
  `project_id` int(11) DEFAULT NULL,
  `wbs_name` varchar(255) DEFAULT NULL,
  `task_description` text DEFAULT NULL,
  `resources` varchar(255) DEFAULT NULL,
  `date` date DEFAULT NULL,
  `cost` decimal(10,2) DEFAULT NULL,
  `deliverables` text DEFAULT NULL,
  `prerequisites` text DEFAULT NULL,
  `percent_complete` decimal(5,2) DEFAULT NULL,
  `status` varchar(50) DEFAULT NULL,
  `prerequisite` varchar(255) DEFAULT NULL,
  `forecasted_cost` decimal(10,2) DEFAULT NULL,
  `subtask_forecasted_progress` decimal(5,2) DEFAULT NULL,
  `forecasted_start_date` date DEFAULT NULL,
  `forecasted_end_date` date DEFAULT NULL,
  `actual_end_date` date DEFAULT NULL,
  `pv` decimal(10,2) DEFAULT NULL,
  `ev` decimal(10,2) DEFAULT NULL,
  `ac` decimal(10,2) DEFAULT NULL,
  `cpi` decimal(10,2) DEFAULT NULL,
  `spi` decimal(10,2) DEFAULT NULL,
  `sv` decimal(10,2) DEFAULT NULL,
  `wbs` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `provinces`
--

CREATE TABLE `provinces` (
  `id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `provinces`
--

INSERT INTO `provinces` (`id`, `name`) VALUES
(1, 'تهران');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `username` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `refresh_token` varchar(255) DEFAULT NULL,
  `type` enum('admin','user') NOT NULL DEFAULT 'user',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `role` enum('admin','excellent_supervisor','site_manager') DEFAULT 'site_manager',
  `active` tinyint(1) DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `username`, `password`, `refresh_token`, `type`, `created_at`, `role`, `active`) VALUES
(2, 'MohammadBadzohreh', '$2b$10$tJ9K9qhPET5BNQLK0Bp1ruLQD.k/WjLliIQesmZnbEnwHeOtRJVX.', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjIsInVzZXJuYW1lIjoiTW9oYW1tYWRCYWR6b2hyZWgiLCJpYXQiOjE3MjI2ODc2ODN9.KHSN1QbjsyG2NLyQ5HAZaV2pEOOJW-KMcXj3qwOafv0', 'user', '2024-02-02 08:44:57', 'admin', 1),
(3, 'karim', '$2b$10$tJ9K9qhPET5BNQLK0Bp1ruLQD.k/WjLliIQesmZnbEnwHeOtRJVX.', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjMsInVzZXJuYW1lIjoia2FyaW0iLCJpYXQiOjE3MjEwMzQyODl9.sj6eKphJ8SkmFAQof59ryyCC-mbNdCAXJaCbP9aTaHY', 'user', '2024-02-02 08:46:05', 'admin', 1),
(4, 'karimبالتdhfgj,vcfgئل', '$2b$10$vLOHGf6s4Mjgll4vlpR3Luug2zTyI849lBmpaSgefCr48/xmijcrK', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjQsInVzZXJuYW1lIjoia2FyaW3YqNin2YTYqmRoZmdqLHZjZmfYptmEIiwiaWF0IjoxNzA5NjM5OTQxfQ.WkSkkoRzeTnBPeXjbGN74ajBHCnQqpeahfmyU_jpVpY', 'user', '2024-03-05 11:59:01', 'site_manager', 1),
(5, 'karimبالتdhfgj,vcfgئل', '$2b$10$LcRt0F1L6Rp6A1QwIJtTRuasPMtrvyp0A0H7JMR3xe3OGFR67wNbG', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjUsInVzZXJuYW1lIjoia2FyaW3YqNin2YTYqmRoZmdqLHZjZmfYptmEIiwiaWF0IjoxNzIwMTIzNDcwfQ.YgXMfATL2AuzYKUY2G3KWe5kDP5gBpT-FyruTCUeS_I', 'user', '2024-07-04 20:04:30', 'site_manager', 1),
(6, 'aa', '$2b$10$1lGeuvdU0ixPycQWGlUCnelA7peoCJRj0wvyLlCmN7n7a43x9UaTK', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjYsInVzZXJuYW1lIjoiYWEiLCJpYXQiOjE3MjYzMzQwMDB9.RzK5dcUNWjL3OT2vGcuJSUbO9wXCdgWcsFu16oMroW4', 'user', '2024-07-04 20:14:16', 'admin', 1),
(7, 'MohammadBadzohreh', '$2b$10$Wx7HHeAo7.Ml0wTBEu9N1ukA0kHTrO6do24sRFyr4o/g0/oP04oWG', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjcsInVzZXJuYW1lIjoiTW9oYW1tYWRCYWR6b2hyZWgiLCJpYXQiOjE3MjAxNjk3NjF9.kIefV7PiO9JiiPHfTLQlLxzITgWHlHY2f7ry9c4lgq8', 'user', '2024-07-05 08:56:01', 'admin', 1),
(8, 'MohammadBadzohreh', '$2b$10$zfWhGYzn4xyBAMgNz/3X.OFHicNb.hw7/evVVmvWzlTTli/e0hRXO', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjgsInVzZXJuYW1lIjoiTW9oYW1tYWRCYWR6b2hyZWgiLCJpYXQiOjE3MjA1OTEwNjd9.CORcpiIaYhvlIYWfep0tC_jAMQakJkab6tjVnHC9Kv8', 'user', '2024-07-10 05:57:47', 'site_manager', 1),
(9, 'MohammadBadzohreh2', '$2b$10$2NBV0eeHKfoT236ZoulhgOhYPnh52OEDyJgZbxbGKwK6vvOzdqyqq', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjksInVzZXJuYW1lIjoiTW9oYW1tYWRCYWR6b2hyZWgyIiwiaWF0IjoxNzIwNTkxMDgwfQ.G3wq9Se-ZjnNGzD4v7tm-AjE5Fy5pAc-UqTHHBYox60', 'user', '2024-07-10 05:58:00', 'admin', 1);

--
-- Indexes for dumped tables
--

--
-- Indexes for table `contractor`
--
ALTER TABLE `contractor`
  ADD PRIMARY KEY (`Id`),
  ADD UNIQUE KEY `National_Code` (`National_Code`);

--
-- Indexes for table `documents`
--
ALTER TABLE `documents`
  ADD PRIMARY KEY (`Id`),
  ADD KEY `contractor_id` (`contractor_id`);

--
-- Indexes for table `employees`
--
ALTER TABLE `employees`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `messages`
--
ALTER TABLE `messages`
  ADD PRIMARY KEY (`id`),
  ADD KEY `sender_id` (`sender_id`),
  ADD KEY `receiver_id` (`receiver_id`);

--
-- Indexes for table `projects`
--
ALTER TABLE `projects`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_employee` (`employee_id`),
  ADD KEY `fk_province` (`province_id`);

--
-- Indexes for table `project_excel_files`
--
ALTER TABLE `project_excel_files`
  ADD PRIMARY KEY (`id`),
  ADD KEY `project_id` (`project_id`);

--
-- Indexes for table `project_tasks`
--
ALTER TABLE `project_tasks`
  ADD PRIMARY KEY (`id`),
  ADD KEY `project_id` (`project_id`);

--
-- Indexes for table `provinces`
--
ALTER TABLE `provinces`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `documents`
--
ALTER TABLE `documents`
  MODIFY `Id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `employees`
--
ALTER TABLE `employees`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `messages`
--
ALTER TABLE `messages`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT for table `projects`
--
ALTER TABLE `projects`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=38;

--
-- AUTO_INCREMENT for table `project_excel_files`
--
ALTER TABLE `project_excel_files`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=103;

--
-- AUTO_INCREMENT for table `project_tasks`
--
ALTER TABLE `project_tasks`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=81;

--
-- AUTO_INCREMENT for table `provinces`
--
ALTER TABLE `provinces`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `documents`
--
ALTER TABLE `documents`
  ADD CONSTRAINT `documents_ibfk_1` FOREIGN KEY (`contractor_id`) REFERENCES `contractor` (`Id`);

--
-- Constraints for table `messages`
--
ALTER TABLE `messages`
  ADD CONSTRAINT `messages_ibfk_1` FOREIGN KEY (`sender_id`) REFERENCES `users` (`id`),
  ADD CONSTRAINT `messages_ibfk_2` FOREIGN KEY (`receiver_id`) REFERENCES `users` (`id`);

--
-- Constraints for table `projects`
--
ALTER TABLE `projects`
  ADD CONSTRAINT `fk_employee` FOREIGN KEY (`employee_id`) REFERENCES `employees` (`id`),
  ADD CONSTRAINT `fk_province` FOREIGN KEY (`province_id`) REFERENCES `provinces` (`id`);

--
-- Constraints for table `project_excel_files`
--
ALTER TABLE `project_excel_files`
  ADD CONSTRAINT `project_excel_files_ibfk_1` FOREIGN KEY (`project_id`) REFERENCES `projects` (`id`);

--
-- Constraints for table `project_tasks`
--
ALTER TABLE `project_tasks`
  ADD CONSTRAINT `project_tasks_ibfk_1` FOREIGN KEY (`project_id`) REFERENCES `projects` (`id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
