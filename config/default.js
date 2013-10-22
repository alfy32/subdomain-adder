/* jshint node:true */
module.exports = {
  port: 3004,
  couch: {
    host: 'localhost',
    port: 5984,
    db: {
      subdomains: 'subdomains',
      users: 'users'
    }
  },
  secret: 'my-secret',
  refresh: {
    host: 'example.com',
    token: 'test-refresh-token'
  }
};
