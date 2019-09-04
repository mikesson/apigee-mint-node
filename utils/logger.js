let logLevel;
const chalk = require('chalk');
const winston = require('winston');

module.exports = {
    setLogLevel: function (args) {
        var levelForNow = 'info';
        switch (levelForNow) {
            case 'debug':
                logLevel = 4;
                break
            case 'info':
                logLevel = 3;
                break
            case 'warning':
                logLevel = 2;    
                break
            case 'error':
                logLevel = 1;
                break
            case 'off':
                logLevel = 0;
                break
            default:
                logLevel = 2; // on error level
                break
        }
    },

    out: function (level, text) {
        const nl = '\n';
        var colour;
        var threshold;
        switch (level) {
            case 'debug':
                threshold = 4;
                colour = '\x1b[36m%s\x1b[0m';
                break
            case 'info':
                threshold = 3;
                colour = "\x1b[44m";
                break
            case 'warn':
                threshold = 2;    
                colour = '\x1b[33m%s\x1b[0m';
                break
            case 'error':
                threshold = 1;
                colour = "\x1b[41m";
                break
            default:
                threshold = 3; // default as info
                break
        }

        if (threshold <= logLevel){
            if(threshold = 4){
                console.log(nl);
                console.log(chalk.green(text));
            }else if(threshold = 1){
                console.log(chalk.red(text));
                console.log(nl);
            }else{
                console.log(chalk.blue(text));
                console.log(nl);
            }
        }

    }
  };
  
  var zemba = function () {
  }