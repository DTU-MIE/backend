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
IF OBJECT_ID('USERS', 'U') IS NULL DROP TABLE USERS
IF OBJECT_ID('LOG', 'U') IS NULL DROP TABLE LOG
IF OBJECT_ID('NEED', 'U') IS NULL DROP TABLE NEED


GO
CREATE TABLE USERS (Name NVARCHAR(50), Email NVARCHAR(255));
GO

GO
CREATE TABLE LOG (logText NVARCHAR(50));
GO
GO
CREATE TABLE TEST (testText NVARCHAR(50));
GO


GO
CREATE TABLE NEED (ID INT IDENTITY(1,1) PRIMARY KEY, NeedIs NVARCHAR(50), Title NVARCHAR(255), ContactPerson NVARCHAR(255),
FileData VARBINARY(MAX), originalname NVarChar(255), extension NVarChar(10), CreatedAt DATETIME DEFAULT GETDATE());
GO


SELECT * FROM USERS;
