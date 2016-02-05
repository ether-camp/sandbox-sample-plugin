var async = require('async');
var BigNumber = require('bignumber.js');

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

      var address = '0x054c0d72de17a9ae859fd0a4d99cfd1b02960081';
      var details = {
        balance: new BigNumber('100000000000000000000'),
        runCode: {
          name: 'FromPlugin',
          binary: result.FromPlugin.code,
          abi: result.FromPlugin.info.abiDefinition
        }
      };
      
      this.sandbox.createAccount(details, address, function(err) {
        if (err) console.error(err);
      });
    }).bind(this));
  }
};
