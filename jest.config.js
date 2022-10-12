module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: [
    'src'
  ],
  maxWorkers: 1,
  //verbose: true
};

process.env = Object.assign(process.env, {
  ADMIN_EMAILS: 'appdevresell@gmail.com, maw346@cornell.edu, sn685@cornell.edu'
});