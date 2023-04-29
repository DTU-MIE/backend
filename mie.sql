-- Create a new database called 'dev_testdb1'
-- Connect to the 'master' database to run this snippet
USE mie
GO
-- Create the new database if it does not exist already
IF NOT EXISTS (
  SELECT [name] FROM sys.databases WHERE [name] = N'mie'
) CREATE DATABASE mie
GO

IF OBJECT_ID('NEED', 'U') IS NULL DROP TABLE NEED
IF OBJECT_ID('USERS', 'U') IS NULL DROP TABLE USERS
---IF OBJECT_ID('BLACKLIST', 'U') IS NULL DROP TABLE BLACKLIST
----DROP TABLE IF EXISTS USERS

GO
CREATE TABLE USERS (id INT IDENTITY(1,1) PRIMARY KEY, name VARCHAR(225) NOT NULL, email VARCHAR(50) NOT NULL UNIQUE, password VARCHAR(255) NOT NULL,
organization VARCHAR(225) NOT NULL, department VARCHAR(225), profession VARCHAR(225) NOT NULL
);
GO


GO
CREATE TABLE NEED (id INT IDENTITY(1,1) PRIMARY KEY, NeedIs NVARCHAR(500), Title NVARCHAR(255), ContactPerson NVARCHAR(255),
FileData VARBINARY(MAX), FileName NVarChar(255), extension NVarChar(10), CreatedAt DATETIME DEFAULT GETDATE());
GO
ALTER TABLE NEED ALTER COLUMN NeedIs NVARCHAR(500);

GO
CREATE PROCEDURE createUser
    @name NVARCHAR(50),
    @email NVARCHAR(50),
    @password NVARCHAR(255),
    @organization NVARCHAR(50),
    @department NVARCHAR(50),
    @profession NVARCHAR(20)
AS
BEGIN
    SET NOCOUNT ON;
    INSERT INTO USERS (name, email, password, organization, department, profession)
    VALUES (@name, @email, @password, @organization, @department, @profession)
END
GO
GO
CREATE PROCEDURE getUserByEmailAndPassword 
    @email nvarchar(50),
    @password NVARCHAR(255)
AS
BEGIN
    SELECT * FROM USERS WHERE email = @email;
    SELECT * FROM USERS WHERE password = @password;
END
GO

GO
CREATE PROCEDURE getUserById 
    @id INT
AS
BEGIN
    SELECT * FROM USERS WHERE id = @id;
END
GO
GO
CREATE TABLE BLACKLIST (
  id INT IDENTITY PRIMARY KEY,
  token NVARCHAR(255) NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
GO