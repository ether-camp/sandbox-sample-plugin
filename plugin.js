var async = require('async');

var source = '\
contract FromPlugin { \
  function FromPlugin() { \
    log0("Creating FromPlugin"); \
  } \
  function sayHello() { \
    log0("Hello from plugin"); \
  } \
} \
';

module.exports.create = function(events) {
  events.on('sandboxStart', function(services) {
    Object.create(Plugin).init(services);
  });
  return {};
};

var Plugin = {
  init: function(services) {
    this.sandbox = services.sandbox;
    this.compiler = services.compiler;
    this.loadContract();
    return this;
  },
  loadContract: function() {
    this.compiler.compile(source, (function(err, result) {
      if (err) return console.log(err);
      
      this.sandbox.createAccount({
        address: '0x054c0d72de17a9ae859fd0a4d99cfd1b02960081',
        balance: 10000000000000000000000,
        runCode: result.FromPlugin.code
      }, function(err) {
        if (err) console.error(err);
      });
    }).bind(this));
  }
};
