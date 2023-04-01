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
IF OBJECT_ID('USERS', 'U') IS NULL
DROP TABLE USERS
DROP TABLE IF EXISTS log;

GO
CREATE TABLE USERS (Name NVARCHAR(50), Email NVARCHAR(255));
GO

GO
CREATE TABLE log (logText NVARCHAR(50));
GO
SELECT * FROM USERS;
