-- CREATE TABLE messages ( 
--     id INT AUTO_INCREMENT PRIMARY KEY, 
--     message VARCHAR(100) NOT NULL
-- );

-- INSERT INTO messages(message) 
-- VALUES('Hello');

-- SELECT * FROM messages;

-- LOCK TABLE messages READ;

-- INSERT INTO messages(message) 
-- VALUES('Hi');

-- MySQL issued the following error:

-- Error Code: 1099. Table 'messages' was locked with a READ lock and can't be updated.

-- Let’s check the READ lock from a different session.

-- First, connect to the database and check the connection id:

SELECT CONNECTION_ID();
SHOW PROCESSLIST;







