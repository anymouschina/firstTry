const { env } = process;

const config = {
  // host: env.HOST,
  // port: env.PORT,
  host:'47.100.7.95',
  port:80,
  jwtSecret:process.env.JWT_SECRET,
  wxSecret:'ca008a164dfa01913a6ec8edbcbe2cf7',
  wxAppid:'wx536dfc5d38954079'
};
module.exports = config;
