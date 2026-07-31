-- Grant govuser full access to mock databases and trafficdb
-- This runs automatically on first MySQL container boot
GRANT ALL PRIVILEGES ON drp_mock_db.* TO 'govuser'@'%';
GRANT ALL PRIVILEGES ON dmt_mock_db.* TO 'govuser'@'%';
GRANT ALL PRIVILEGES ON trafficdb.* TO 'govuser'@'%';
FLUSH PRIVILEGES;

