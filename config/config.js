//This holds all the environment variables
module.exports = {
    //MSSQL_SERVER: process.env.MSSQL_SERVER || "sql",
    //MSSQL_HOST: process.env.MSSQL_HOST || "localhost",
    MSSQL_USER: process.env.MSSQL_USER,
    MSSQL_SA_PASSWORD: process.env.MSSQL_SA_PASSWORD,
    REDIS_URL: process.env.REDIS_URL || "redis",
    REDIS_PORT: process.env.REDIS_PORT || 6379,
    SESSION_SECRET: process.env.SESSION_SECRET,
    
};