var async = require('async');
var BigNumber = require('bignumber.js');
var SHA3Hash = require('sha3').SHA3Hash;

var account = {
  address: '0x054c0d72de17a9ae859fd0a4d99cfd1b02960081',
  seed: 'sandbox-plugin'
};

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
  events.on('sandboxStart', function(config, services, api) {
    if (config.plugins.hasOwnProperty('sample')) {
      Object.create(Plugin).init(services, api);
    }
  });
  return {};
};

var Plugin = {
  init: function(services, api) {
    this.sandbox = services.sandbox;
    this.compiler = services.compiler;
    this.loadContract();
    
    services.sandbox.on('stop', function(sandbox) {
      // clear something
    });
    services.sandbox.onLog({ address: account.address  }, function(log) {
      console.log('got log from ' + log.address);
    });

    // add json rpc calls: sample_sum, sample_echo, sample_doSome
    api['sample'] = function(services) {
      return {
        sum: {
          args: [
            { type: 'number' },
            { type: 'number' }
          ],
          handler: function(num1, num2, cb) {
            cb(null, num1.plus(num2));
          }
        },
        echo: {
          args: [
            { type: 'string' }
          ],
          handler: function(str, cb) {
            cb(null, str);
          }
        },
        doSome: {
          args: [],
          handler: function(cb) {
            services.sandbox.sendTx({
              from: account.address,
              to: '0x054c0d72de17a9ae859fd0a4d99cfd1b02961337',
              value: new BigNumber(13371337),
              gasLimit: new BigNumber(1000),
              gasPrice: services.sandbox.gasPrice
            }, cb);
          }
        }
      };
    };
    
    return this;
  },
  loadContract: function() {
    this.compiler.compile(source, (function(err, result) {
      if (err) return console.log(err);

      var details = {
        balance: new BigNumber('100000000000000000000'),
        runCode: {
          name: 'FromPlugin',
          binary: result.FromPlugin.code,
          abi: result.FromPlugin.info.abiDefinition
        }
      };
      
      this.sandbox.createAccount(details, account.address, function(err) {
        if (err) console.error(err);
      });
      this.sandbox.addAccount(account.address, sha3(account.seed));
    }).bind(this));
  }
};

function sha3(str) {
  var sha = new SHA3Hash(256);
  sha.update(str);
  return '0x' + sha.digest('hex');
};
