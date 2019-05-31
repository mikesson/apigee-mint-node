const ora = require('ora')
const apicaller = require('../utils/apicaller')

const winston = require('winston')
const logger = winston.createLogger({
  level:  (process.env.LOG_LEVEL) ? process.env.LOG_LEVEL : 'debug',
  format: winston.format.combine(
    winston.format.colorize(),
    winston.format.simple()
  ),
  defaultMeta: { },
  transports: [
    new winston.transports.Console()
  ]
});

//--productBundle -pb (required) The product bundle you want to verify the config of.
//--password -p (required) Your Apigee account password. May be set as an environment variable APIGEE_PASSWORD.
//--username -u (required) Your Apigee account username. May be set as an environment variable APIGEE_USERNAME.
// log level as LOG_LEVEL env variable, defaults to info


module.exports = async (args) => {
    const spinner = ora().start()
    try {
      
    } catch (err) {
      spinner.stop()
      logger.error(err)
    }

  }


