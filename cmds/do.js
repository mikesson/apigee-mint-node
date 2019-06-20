const ora = require('ora')
const apicaller = require('../utils/apicaller')
const yaml = require('js-yaml')
const fs = require('fs')
const figures = require('figures')
const apigeetool = require('apigeetool')
const path = require('path')

const winston = require('winston')

var logger = winston.createLogger({
  format: winston.format.combine(
    winston.format.colorize(),
    winston.format.simple()
  ),
  defaultMeta: {},
  transports: [
    new (winston.transports.Console)({
      level: (process.env.LOG_LEVEL) ? process.env.LOG_LEVEL : 'debug',
      name: 'console'
    })
  ]
});

let UNAME
let PASS
let ORG
let ENV // currently not necessary in this do.js

let ACTION
let RESOURCE
let ID


let LOG_LEVEL;

module.exports = async (args) => {
  const spinner = ora().start()
  try {
    // SET LOG LEVEL
    if (args.l || args.logLevel) {
      LOG_LEVEL = (args.l) ? args.l : args.logLevel
      if (LOG_LEVEL == 'silly' || LOG_LEVEL == 'debug' || LOG_LEVEL == 'verbose' || LOG_LEVEL == 'info' || LOG_LEVEL == 'warn' || LOG_LEVEL == 'error') {
        logger.transports[0].level = LOG_LEVEL;
      }
    }

    apicaller.setLogger(logger);

    // if (args.e || args.env) {
    //   ENV = (args.e) ? args.e : args.env;
    // }else{
    //   logger.error(figures('✖ ') + 'Please include the --env (-e) argument to specify the target environment (e.g. dev,test or prod)')
    //   process.exit()
    // }

    if (args.a || args.action) {
      ACTION = (args.a) ? args.a : args.action;
      logger.debug('operation: ' + ACTION);
    } else {
      logger.error(figures('✖ ') + 'Please include the --action (-a) argument to specify the action (e.g. list,get or delete)')
      process.exit()
    }

    if (ACTION == 'delete') {
      if (args.i || args.id) {
        ID = (args.i) ? args.i : args.id;
        logger.debug('operation: ' + ID);
      } else {
        logger.error(figures('✖ ') + 'Please include the --id (-i) argument to specify the resource ID')
        process.exit()
      }
    }

    if (args.r || args.resource) {
      RESOURCE = (args.r) ? args.r : args.resource;
      logger.debug('resource: ' + RESOURCE);
    } else {
      logger.error(figures('✖ ') + 'Please include the --resource (-r) argument to specify the resource (e.g. apiproxy, apiproduct, productbundle, rateplan ...)')
      process.exit()
    }


    logger.debug('current working directory: ' + process.cwd());

    var rootDir = 'config/'

    // Set credentials
    var credentialsArray = apicaller.setCredentialsAndOrg(args)
    if (!credentialsArray) {
      logger.error('credentials not found (set them either as arguments or environment variables)')
      process.exit()
    } else {
      UNAME = credentialsArray[0]
      PASS = credentialsArray[1]
      ORG = credentialsArray[2]
    }


    switch (ACTION) {
      case 'list':
        var response = await apicaller.listResources(RESOURCE)
        logger.debug('response status (listResources(' + RESOURCE + ')) is ' + response.status)
        logger.debug('response is:')
        logger.debug(JSON.stringify(response.data, null, '\t'))
        if (response.status != 200) {
          logger.error('call to obtain list of "' + RESOURCE + '" failed with status code ' + response.status)
          process.exit()
        }

        if (RESOURCE == 'productbundle') {
          var arr = response.data.monetizationPackage;
          logger.info(' ======= List of ' + RESOURCE + 's (IDs) =======')
          console.log(' ')
          for (var i = 0; i < arr.length; i++) {
            var obj = arr[i];
            console.log(obj.id)
          }
        } else if (RESOURCE == 'rateplan') {
          var arr = response.data.ratePlan;
          logger.info(' ======= List of ' + RESOURCE + 's (IDs) =======')
          console.log(' ')
          for (var i = 0; i < arr.length; i++) {
            var obj = arr[i];
            console.log(obj.id)
          }
        } else if (RESOURCE == 'apiproxy' || RESOURCE == 'apiproduct') {
          var arr = response.data;
          logger.info(' ======= List of ' + RESOURCE + 's (IDs) =======')
          console.log(' ')
          for (var i = 0; i < arr.length; i++) {
            var obj = arr[i];
            console.log(obj)
          }
        }

        break

      case 'get':
        /// tbd
        break

      case 'delete':
        var response = await apicaller.deleteResource(RESOURCE,ID)
        logger.debug('response status (deleteResource(' + RESOURCE + ',' + ID + ')) is ' + response.status)
        //logger.debug('response is:')
        //logger.debug(JSON.stringify(response.data, null, '\t'))
        if (response.status > 204) {
          logger.error('call to delete "' + RESOURCE + '" with ID <' + ID + '> failed with status code ' + response.status)
          process.exit()
        }
        logger.info(figures('✔︎ ') + 'Successfully removed ' + RESOURCE + ' <' + ID + '>')
        break
        
      default:
        logger.error('operation "' + OPERATION + '" unknown')
    }


    console.log(' ')
    process.exit()




  } catch (err) {
    spinner.stop()
    logger.error(err)
    process.exit()
  }

}

