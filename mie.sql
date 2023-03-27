-- Create a new database called 'dev_testdb1'
-- Connect to the 'master' database to run this snippet
USE master
GO
-- Create the new database if it does not exist already
IF NOT EXISTS (
  SELECT [name] FROM sys.databases WHERE [name] = N'mie'
) CREATE DATABASE mie
GO

USE mie;
DROP TABLE IF EXISTS USERS;
GO
CREATE TABLE USERS (id INT, Name NVARCHAR(50), Email NVARCHAR(255));
GO
INSERT INTO USERS VALUES (1, 'Bill Gates', 'bill.gates@gmail.com');
INSERT INTO USERS VALUES (2, 'Arooj Chaudhry', 'acdtu@gmail.com');
INSERT INTO USERS VALUES (3, 'Amanda', 'amanda@gmail.com');
INSERT INTO USERS VALUES (4, 'alex', 'alex@gmail.com');
INSERT INTO USERS VALUES (5, 'carlos', 'carlos@gmail.com');
INSERT INTO USERS VALUES (6, 'no', 'no@gmail.com');

GO

SELECT * FROM USERS;
GO 