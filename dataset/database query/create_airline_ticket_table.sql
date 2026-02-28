-- Create table for airline_ticket_data.csv
-- Using VARCHAR for columns that may have empty values to work with Import Wizard

DROP TABLE IF EXISTS airline_ticket_data;

CREATE TABLE airline_ticket_data (
    Year INT NOT NULL,
    quarter TINYINT NOT NULL,
    citymarketid_1 INT NOT NULL,
    citymarketid_2 INT NOT NULL,
    city1 VARCHAR(100) NOT NULL,
    city2 VARCHAR(100) NOT NULL,
    nsmiles INT NOT NULL,
    passengers VARCHAR(20) NOT NULL,
    fare VARCHAR(20) NOT NULL,
    carrier_lg VARCHAR(5) NOT NULL,
    large_ms DECIMAL(10, 6) NOT NULL,
    fare_lg VARCHAR(20) NOT NULL,
    carrier_low VARCHAR(5) NOT NULL,
    lf_ms DECIMAL(10, 6) NOT NULL,
    fare_low VARCHAR(20) NOT NULL,
    TotalFaredPax_city1 VARCHAR(30),
    TotalPerLFMkts_city1 VARCHAR(30),
    TotalPerPrem_city1 VARCHAR(30),
    TotalFaredPax_city2 VARCHAR(30),
    TotalPerLFMkts_city2 VARCHAR(30),
    TotalPerPrem_city2 VARCHAR(30),
    
    INDEX idx_year_quarter (Year, quarter),
    INDEX idx_city1 (city1),
    INDEX idx_city2 (city2)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

