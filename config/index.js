const { env } = process;

const config = {
  // host: env.HOST,
  // port: env.PORT,
  host:'0.0.0.0',
  port:3000,
  // jwtSecret:process.env.JWT_SECRET,
  jwtSecret:'junmoxiao',
  wxSecret:'ca008a164dfa01913a6ec8edbcbe2cf7',
  wxAppid:'wx536dfc5d38954079'
};
module.exports = config;
