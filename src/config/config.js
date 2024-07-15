module.exports = {
  // Existing database configuration
  db: {
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'building',
    port: 3307 // Change to your actual port if it's different
  },

  // Expanded JWT configuration
  jwt: {
    accessSecret: 'eyJhbGciOiJIUzI1NiJ9.eyJSb2xlIjoiQWRtaW4iLCJJc3N1ZXIiOiJJc3N1ZXIiLCJVc2VybmFtZSI6IkphdmFJblVzZSIsImV4cCI6MTcwNjg2Mjg4OSwiaWF0IjoxNzA2ODYyODg5fQ.SBFM5iCLXHR-32h_muc8Ewd1ZuQQOJeb0T_UFHV1sA4', // Secret for access tokens
    refreshSecret: 'eyJhbGciOiJIUzI1NiJ9.eyJSb2xlIjoiQWRtaW4iLCJJc3N1ZXIiOiJJc3N1ZXIiLCJVc2VybmFtZSI6IkphdmFJblVzZSIsImV4cCI6MTcwNjg2Mjk3OSwiaWF0IjoxNzA2ODYyOTc5fQ.qOziJN75K31dvsybDBhEAi7zPM8tFMEkQ3UTbh9X7cg', // Secret for refresh tokens
    accessExpiresIn: '7d', //  Epiration for access tokens
    refreshExpiresIn: '12h'  //  Expiration for refresh tokens
  }
};
