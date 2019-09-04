const ora = require('ora')
const apicaller = require('../utils/apicaller')
const yaml = require('js-yaml')
const fs = require('fs')
const figures = require('figures')
const apigeetool = require('apigeetool')
const path = require('path')
const winston = require('winston')

var table = require('table').table

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

let ACTION
let RESOURCE
let ID
let LOG_LEVEL;

module.exports = async (args) => {
  const spinner = ora().start()
  try {
    if (args.l || args.logLevel) {
      LOG_LEVEL = (args.l) ? args.l : args.logLevel
      if (LOG_LEVEL == 'silly' || LOG_LEVEL == 'debug' || LOG_LEVEL == 'verbose' || LOG_LEVEL == 'info' || LOG_LEVEL == 'warn' || LOG_LEVEL == 'error') {
        logger.transports[0].level = LOG_LEVEL;
      }
    }

    apicaller.setLogger(logger);

    var errorMsgAction = 'Please include the --action (-a) argument to specify the action (e.g. list,get or delete)'
    var errorMsgResource = 'Please include the --resource (-r) argument to specify the resource (e.g. apiproxy, apiproduct, productbundle, rateplan ...)'
    var errorMsgIdentifier = 'Please include the --id (-i) argument(s) to specify the action/query identifier(s)'

    if (args.a || args.action) {
      ACTION = (args.a) ? args.a : args.action;
      logger.debug('operation: ' + ACTION);
    } else {
      logger.error(figures('✖ ') + errorMsgAction)
      process.exit()
    }

    if (ACTION == 'delete') {
      if (args.i || args.id) {
        ID = (args.i) ? args.i : args.id;
        logger.debug('identifier: ' + ID);
      } else {
        logger.error(figures('✖ ') + errorMsgIdentifier)
        process.exit()
      }
    }

    if (ACTION == 'find') {
      if (args.i || args.id) {
        ID = (args.i) ? args.i : args.id;
        logger.debug('identifier: ' + ID);
      } else {
        logger.error(figures('✖ ') + errorMsgIdentifier)
        process.exit()
      }
    }

    if (ACTION == 'get') {
      if (args.i || args.id) {
        ID = (args.i) ? args.i : args.id;
        logger.debug('identifier (1): ' + ID);
      } else {
        logger.error(figures('✖ ') + errorMsgIdentifier)
        process.exit()
      }
    }

    if (ACTION == 'issueCredit') {
      if (args.i || args.id) {
        ID = (args.i) ? args.i : args.id;
        logger.debug('identifier(s): ' + ID);
        var paramCount = 6
        if(ID.length != paramCount){
          logger.error(figures('✖ ') + 'This action requires ' + paramCount + ' input (-i) parameters')
          process.exit()
        }
      } else {
        logger.error(figures('✖ ') + errorMsgIdentifier)
        process.exit()
      }
    }

    if (ACTION == 'addPrepaidBalance') {
      if (args.i || args.id) {
        ID = (args.i) ? args.i : args.id;
        logger.debug('identifier: ' + ID);
        var paramCount = 3
        if(ID.length != paramCount){
          logger.error(figures('✖ ') + 'This action requires ' + paramCount + ' input (-i) parameters')
          process.exit()
        }
      } else {
        logger.error(figures('✖ ') + errorMsgIdentifier)
        process.exit()
      }
    }

    var actionsNotRequiringResourceFlag = ['issueCredit', 'addPrepaidBalance']

    if (!actionsNotRequiringResourceFlag.includes(ACTION)) {
      if (args.r || args.resource) {
        RESOURCE = (args.r) ? args.r : args.resource;
        logger.debug('resource: ' + RESOURCE);
      } else {
        logger.error(figures('✖ ') + errorMsgResource)
        process.exit()
      }
    }

    logger.debug('current working directory: ' + process.cwd())
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
        } else if (RESOURCE == 'apiproxy') {
          var arr = response.data;
          logger.info(' ======= List of apiproxies (IDs) =======')
          console.log(' ')
          for (var i = 0; i < arr.length; i++) {
            var obj = arr[i];
            console.log(obj)
          }
        } else if (RESOURCE == 'apiproduct') {
          var arr = response.data;
          logger.info(' ======= List of ' + RESOURCE + 's (IDs) =======')
          console.log(' ')
          for (var i = 0; i < arr.length; i++) {
            var obj = arr[i];
            console.log(obj)
          }
        } else if (RESOURCE == 'developer') {
          var arr = response.data;
          logger.info(' ======= List of ' + RESOURCE + 's (IDs) =======')
          console.log(' ')
          for (var i = 0; i < arr.length; i++) {
            var obj = arr[i];
            console.log(obj)
          }
        } else if (RESOURCE == 'company') {
          var arr = response.data;
          logger.info(' ======= List of companies (IDs) =======')
          console.log(' ')
          for (var i = 0; i < arr.length; i++) {
            var obj = arr[i];
            console.log(obj)
          }
        }

        break

      case 'find':
        var response = await apicaller.findResource(RESOURCE, ID)
        logger.debug('response status (findResource(' + RESOURCE + ',' + ID + ')) is ' + response.status)
        logger.debug('response is:')
        logger.debug(JSON.stringify(response.data, null, '\t'))
        if (response.status != 200) {
          logger.error('call to find resource with query "' + RESOURCE + '" failed with status code ' + response.status)
          process.exit()
        }
        if (RESOURCE == ' ') {
          var resp = response.data
          logger.info(' ======= Corresponding Developer ID =======')
          console.log(' ')
          var devId = resp.developerId
          console.log(devId)
        } else if (RESOURCE == 'apps-byDevEmail') {
          var arr = response.data.apps
          logger.info(' ======= List of apps for developer ' + ID + ' =======')
          console.log(' ')
          for (var i = 0; i < arr.length; i++) {
            var obj = arr[i];
            console.log(obj)
          }
        } else if (RESOURCE == 'apps-byDevId') {
          var arr = response.data.apps
          logger.info(' ======= List of apps for developer ' + ID + ' =======')
          console.log(' ')
          for (var i = 0; i < arr.length; i++) {
            var obj = arr[i];
            console.log(obj)
          }
        } else if (RESOURCE == 'apiProductBundles-byDevId-activeOnly') {
          var resp = response.data
          logger.info(' ======= List of active API packages for developer ' + ID + ' =======')
          console.log(' ')
          var noOfRecords = resp.totalRecords
          console.log('Number of Records: ' + noOfRecords)
          if (noOfRecords > 0) {
            console.log(' ')
            var arr = resp.monetizationPackage
            for (var i = 0; i < arr.length; i++) {
              var obj = arr[i];
              console.log(obj.id)
            }
          }
        } else if (RESOURCE == 'apiProductBundles-byDevId-includeExpired') {
          var resp = response.data
          logger.info(' ======= List of all API packages for developer ' + ID + ' =======')
          console.log(' ')
          var noOfRecords = resp.totalRecords
          console.log('Number of Records: ' + noOfRecords)
          if (noOfRecords > 0) {
            console.log(' ')
            var arr = resp.monetizationPackage
            for (var i = 0; i < arr.length; i++) {
              var obj = arr[i];
              console.log(obj.id)
            }
          }
        } else if (RESOURCE == 'acceptedRatePlan-byDevId') {
          var resp = response.data
          logger.info(' ======= List of accepted rate plans for developer ' + ID + ' =======')
          console.log(' ')
          var noOfRecords = resp.totalRecords
          console.log('Number of Records: ' + noOfRecords)
          if (noOfRecords > 0) {
            console.log(' ')
            var arr = resp.developerRatePlan
            for (var i = 0; i < arr.length; i++) {
              var obj = arr[i];
              console.log(obj.id)
            }
          }
        }

        break

      case 'get':
        var response = await apicaller.getResource(RESOURCE, ID[0], ID[1]) //FYI: If -i entered multiple times in cmd, it's an array
        logger.debug('response status (getResource(' + RESOURCE + ',' + ID + ')) is ' + response.status)
        logger.debug('response is:')
        logger.debug(JSON.stringify(response.data, null, '\t'))
        if (response.status != 200) {
          logger.error('call to get resource of type "' + RESOURCE + '" failed with status code ' + response.status)
          process.exit()
        }
        if (RESOURCE == 'developerRatePlan') {
          var resp = response.data
          logger.info(' ======= Developer Rate Plan Details =======')
          console.log(' ')
          var apiproduct_s
          if (resp.ratePlan.monetizationPackage.product.length > 1) {
            var arr = resp.ratePlan.monetizationPackage.product
            var arrNamesOnly = []
            for (var i = 0; i < arr.length; i++) {
              arrNamesOnly.push(arr[i].displayName)
            }
            apiproduct_s = arrNamesOnly.join(', ')
          } else {
            apiproduct_s = resp.ratePlan.monetizationPackage.product[0].displayName
          }
          var data = [
            ['Developer Name', resp.developer.name],
            ['Billing Type', resp.developer.billingType],
            ['Currency', resp.ratePlan.currency.name],
            ['Rate Plan Name', resp.ratePlan.displayName],
            ['API Package', resp.ratePlan.monetizationPackage.displayName],
            ['API Product(s)', apiproduct_s],
            ['Payment Due Days', resp.ratePlan.paymentDueDays],
            ['Rate Plan Type', resp.ratePlan.ratePlanDetails[0].type],
            ['Duration Type', resp.ratePlan.ratePlanDetails[0].durationType],
            ['Metering Type', resp.ratePlan.ratePlanDetails[0].meteringType],
            ['Subscribed since', resp.created]
          ];

          var output = table(data);
          console.log(output);

          var packageId = resp.ratePlan.monetizationPackage.id
          var ratePlanId = resp.ratePlan.id
          var developerId = resp.developer.id
          var currencyId = resp.ratePlan.currency.id
          var creditAmount = 100
          var creditDescription = 'sample refund'
          logger.info(figures('ℹ ') + 'Suggestion: Here\'s a command for issuing credit to this subscription:')
          logger.info('do -a issueCredit -i ' + packageId + ' -i ' + ratePlanId + ' -i ' + developerId + ' -i ' + currencyId + ' -i ' + creditAmount + ' -i \'' + creditDescription + '\'')
          logger.info('')
          logger.info('(syntax for reference)')
          logger.info('do -a issueCredit -i package_id -i rateplan_id -i developer_id -i currency_id -i amount -i description')
        }

        break

      case 'delete':
        var response = await apicaller.deleteResource(RESOURCE, ID)
        logger.debug('response status (deleteResource(' + RESOURCE + ',' + ID + ')) is ' + response.status)
        logger.debug('response is:')
        logger.debug(JSON.stringify(response.data, null, '\t'))
        if (response.status > 204) {
          logger.error('call to delete "' + RESOURCE + '" with ID <' + ID + '> failed with status code ' + response.status)
          process.exit()
        }
        logger.info(figures('✔︎ ') + 'Successfully removed ' + RESOURCE + ' <' + ID + '>')

        break

      case 'issueCredit':
        var packageId = ID[0]
        var ratePlanId = ID[1]
        var developerId = ID[2]
        var currencyId = ID[3]
        var creditAmount = ID[4]
        var creditDescription = ID[5]
        var response = await apicaller.issueCredit(packageId, ratePlanId, developerId, currencyId, creditAmount, creditDescription)
        logger.debug('response status (issueCredit()) is ' + response.status)
        logger.debug('response is:')
        logger.debug(JSON.stringify(response.data, null, '\t'))

        if (response.status != 201) {
          logger.error('call to issue credit, failed with status code ' + response.status)
          process.exit()
        }
        logger.info(figures('✔︎ ') + 'Successfully issued credit!')

        break

      case 'addPrepaidBalance':
        var payload = { "amount": ID[1], "supportedCurrency": { "id": ID[2] } }
        logger.debug('payload is: ' + JSON.stringify(payload))
        var developerId = ID[0]
        var response = await apicaller.reloadDeveloperBalance(payload, developerId)
        var resp = response.data
        logger.debug('response status (addPrepaidBalance()) is ' + response.status)
        logger.debug('response is:')
        logger.debug(JSON.stringify(response.data, null, '\t'))
        if (response.status != 200) {
          logger.error('call to add prepaid balance, failed with status code ' + response.status)
          process.exit()
        }
        logger.info(figures('✔︎ ') + 'Successfully added prepaid balance!')
        console.log(' ')
        var data = [
          ['Current Amount:', resp.amount],
          ['Current Usage', resp.usage],
          ['Is recurring?', resp.isRecurring],
          ['Charge per usage?', resp.chargePerUsage]
        ];

        var output = table(data);
        console.log(output);
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

