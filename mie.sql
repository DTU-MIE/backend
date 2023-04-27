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
---IF OBJECT_ID('USERS', 'U') IS NULL DROP TABLE USERS
DROP TABLE IF EXISTS USERS

GO
CREATE TABLE USERS (id INT IDENTITY(1,1) PRIMARY KEY, name VARCHAR(225), email VARCHAR(50), password VARCHAR(255),
organization VARCHAR(225), department VARCHAR(225), profession VARCHAR(225)
);
GO


GO
CREATE TABLE NEED (id INT IDENTITY(1,1) PRIMARY KEY, NeedIs NVARCHAR(50), Title NVARCHAR(255), ContactPerson NVARCHAR(255),
FileData VARBINARY(MAX), FileName NVarChar(255), extension NVarChar(10), CreatedAt DATETIME DEFAULT GETDATE());
GO
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





-- EXEC sp_rename 'dbo.NEED.ID', 'id', 'COLUMN';