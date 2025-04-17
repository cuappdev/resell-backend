module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: [
    'src'
  ],
  moduleNameMapper: {
    '^firebase-admin/messaging$': 'firebase-admin',
  },
  maxWorkers: 1,
  //verbose: true
};

process.env = Object.assign(process.env, {
  ADMIN_EMAILS: 'appdevresell@gmail.com, maw346@cornell.edu, sn685@cornell.edu',
  FIREBASE_SERVICE_ACCOUNT_PATH: '/Users/hover/OneDrive/Desktop/AppDev/secrets/firebase-admin-service-account.json'
  
});