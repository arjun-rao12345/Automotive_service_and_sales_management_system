-- ============================================================
-- AUTOMOTIVE SERVICE AND SALES MANAGEMENT SYSTEM
-- MySQL Database Schema
-- ============================================================

-- Drop tables in reverse order of dependencies (if exists)
DROP TABLE IF EXISTS Warranty;
DROP TABLE IF EXISTS Insurance;
DROP TABLE IF EXISTS Feedback;
DROP TABLE IF EXISTS Payment;
DROP TABLE IF EXISTS Invoice;
DROP TABLE IF EXISTS Inventory;
DROP TABLE IF EXISTS Parts;
DROP TABLE IF EXISTS Supplier;
DROP TABLE IF EXISTS Service_Record;
DROP TABLE IF EXISTS Technician;
DROP TABLE IF EXISTS Employee;
DROP TABLE IF EXISTS Service_Request;
DROP TABLE IF EXISTS Vehicle;
DROP TABLE IF EXISTS Vehicle_Model;
DROP TABLE IF EXISTS Customer;

-- ============================================================
-- 1. CUSTOMER TABLE
-- ============================================================
CREATE TABLE Customer (
    customer_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    email VARCHAR(100) UNIQUE,
    address TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_customer_phone (phone),
    INDEX idx_customer_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 2. VEHICLE MODEL TABLE
-- ============================================================
CREATE TABLE Vehicle_Model (
    model_id INT AUTO_INCREMENT PRIMARY KEY,
    brand VARCHAR(50) NOT NULL,
    model_name VARCHAR(100) NOT NULL,
    year YEAR NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_brand_model (brand, model_name),
    INDEX idx_year (year),
    UNIQUE KEY unique_brand_model_year (brand, model_name, year)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 3. VEHICLE TABLE
-- ============================================================
CREATE TABLE Vehicle (
    vehicle_id INT AUTO_INCREMENT PRIMARY KEY,
    customer_id INT NOT NULL,
    model_id INT NOT NULL,
    registration_no VARCHAR(20) UNIQUE NOT NULL,
    vin VARCHAR(17) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (customer_id) REFERENCES Customer(customer_id) 
        ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (model_id) REFERENCES Vehicle_Model(model_id) 
        ON DELETE RESTRICT ON UPDATE CASCADE,
    INDEX idx_customer_id (customer_id),
    INDEX idx_model_id (model_id),
    INDEX idx_registration_no (registration_no),
    INDEX idx_vin (vin)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 4. SERVICE REQUEST TABLE
-- ============================================================
CREATE TABLE Service_Request (
    service_request_id INT AUTO_INCREMENT PRIMARY KEY,
    customer_id INT NOT NULL,
    vehicle_id INT NOT NULL,
    requested_date DATE NOT NULL,
    service_type VARCHAR(100) NOT NULL,
    status ENUM('Pending', 'In Progress', 'Completed', 'Cancelled') 
        DEFAULT 'Pending' NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (customer_id) REFERENCES Customer(customer_id) 
        ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (vehicle_id) REFERENCES Vehicle(vehicle_id) 
        ON DELETE CASCADE ON UPDATE CASCADE,
    INDEX idx_customer_id (customer_id),
    INDEX idx_vehicle_id (vehicle_id),
    INDEX idx_requested_date (requested_date),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 6. EMPLOYEE TABLE
-- ============================================================
CREATE TABLE Employee (
    employee_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    role VARCHAR(50) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    email VARCHAR(100) UNIQUE,
    hire_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_role (role),
    INDEX idx_employee_phone (phone)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 7. TECHNICIAN TABLE
-- ============================================================
CREATE TABLE Technician (
    technician_id INT AUTO_INCREMENT PRIMARY KEY,
    employee_id INT UNIQUE NOT NULL,
    specialization VARCHAR(100) NOT NULL,
    certification_level ENUM('Junior', 'Senior', 'Master') DEFAULT 'Junior',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (employee_id) REFERENCES Employee(employee_id) 
        ON DELETE CASCADE ON UPDATE CASCADE,
    INDEX idx_specialization (specialization)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 5. SERVICE RECORD TABLE
-- ============================================================
CREATE TABLE Service_Record (
    service_record_id INT AUTO_INCREMENT PRIMARY KEY,
    service_request_id INT NOT NULL,
    technician_id INT NOT NULL,
    date_completed DATE NOT NULL,
    notes TEXT,
    labor_hours DECIMAL(5,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (service_request_id) REFERENCES Service_Request(service_request_id) 
        ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (technician_id) REFERENCES Technician(technician_id) 
        ON DELETE RESTRICT ON UPDATE CASCADE,
    INDEX idx_service_request_id (service_request_id),
    INDEX idx_technician_id (technician_id),
    INDEX idx_date_completed (date_completed)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 8. SUPPLIER TABLE
-- ============================================================
CREATE TABLE Supplier (
    supplier_id INT AUTO_INCREMENT PRIMARY KEY,
    supplier_name VARCHAR(100) NOT NULL,
    contact VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    email VARCHAR(100),
    address TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_supplier_name (supplier_name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 9. PARTS TABLE
-- ============================================================
CREATE TABLE Parts (
    part_id INT AUTO_INCREMENT PRIMARY KEY,
    part_name VARCHAR(100) NOT NULL,
    supplier_id INT NOT NULL,
    price DECIMAL(10,2) NOT NULL CHECK (price >= 0),
    part_number VARCHAR(50) UNIQUE,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (supplier_id) REFERENCES Supplier(supplier_id) 
        ON DELETE RESTRICT ON UPDATE CASCADE,
    INDEX idx_part_name (part_name),
    INDEX idx_supplier_id (supplier_id),
    INDEX idx_part_number (part_number)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 10. INVENTORY TABLE
-- ============================================================
CREATE TABLE Inventory (
    inventory_id INT AUTO_INCREMENT PRIMARY KEY,
    part_id INT UNIQUE NOT NULL,
    quantity INT NOT NULL DEFAULT 0 CHECK (quantity >= 0),
    reorder_level INT NOT NULL DEFAULT 10 CHECK (reorder_level >= 0),
    last_restocked DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (part_id) REFERENCES Parts(part_id) 
        ON DELETE CASCADE ON UPDATE CASCADE,
    INDEX idx_quantity (quantity),
    INDEX idx_reorder_check (quantity, reorder_level)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 11. INVOICE TABLE
-- ============================================================
CREATE TABLE Invoice (
    invoice_id INT AUTO_INCREMENT PRIMARY KEY,
    service_request_id INT UNIQUE NOT NULL,
    total_amount DECIMAL(10,2) NOT NULL CHECK (total_amount >= 0),
    payment_pending BOOLEAN DEFAULT TRUE NOT NULL,
    date DATE NOT NULL,
    due_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (service_request_id) REFERENCES Service_Request(service_request_id) 
        ON DELETE CASCADE ON UPDATE CASCADE,
    INDEX idx_service_request_id (service_request_id),
    INDEX idx_payment_pending (payment_pending),
    INDEX idx_date (date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 12. PAYMENT TABLE
-- ============================================================
CREATE TABLE Payment (
    payment_id INT AUTO_INCREMENT PRIMARY KEY,
    invoice_id INT NOT NULL,
    method ENUM('Cash', 'Credit Card', 'Debit Card', 'Bank Transfer', 'UPI', 'Other') 
        NOT NULL,
    amount_paid DECIMAL(10,2) NOT NULL CHECK (amount_paid > 0),
    date DATE NOT NULL,
    transaction_reference VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (invoice_id) REFERENCES Invoice(invoice_id) 
        ON DELETE CASCADE ON UPDATE CASCADE,
    INDEX idx_invoice_id (invoice_id),
    INDEX idx_date (date),
    INDEX idx_method (method)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 13. FEEDBACK TABLE
-- ============================================================
CREATE TABLE Feedback (
    feedback_id INT AUTO_INCREMENT PRIMARY KEY,
    customer_id INT NOT NULL,
    service_request_id INT UNIQUE NOT NULL,
    rating TINYINT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comments TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (customer_id) REFERENCES Customer(customer_id) 
        ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (service_request_id) REFERENCES Service_Request(service_request_id) 
        ON DELETE CASCADE ON UPDATE CASCADE,
    INDEX idx_customer_id (customer_id),
    INDEX idx_service_request_id (service_request_id),
    INDEX idx_rating (rating)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 14. INSURANCE TABLE
-- ============================================================
CREATE TABLE Insurance (
    insurance_id INT AUTO_INCREMENT PRIMARY KEY,
    vehicle_id INT NOT NULL,
    provider VARCHAR(100) NOT NULL,
    policy_number VARCHAR(50) UNIQUE NOT NULL,
    expiry_date DATE NOT NULL,
    coverage_amount DECIMAL(12,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (vehicle_id) REFERENCES Vehicle(vehicle_id) 
        ON DELETE CASCADE ON UPDATE CASCADE,
    INDEX idx_vehicle_id (vehicle_id),
    INDEX idx_expiry_date (expiry_date),
    INDEX idx_policy_number (policy_number)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 15. WARRANTY TABLE
-- ============================================================
CREATE TABLE Warranty (
    warranty_id INT AUTO_INCREMENT PRIMARY KEY,
    part_id INT NOT NULL,
    warranty_period_months INT NOT NULL CHECK (warranty_period_months > 0),
    terms TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (part_id) REFERENCES Parts(part_id) 
        ON DELETE CASCADE ON UPDATE CASCADE,
    INDEX idx_part_id (part_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- END OF SCHEMA
-- ============================================================