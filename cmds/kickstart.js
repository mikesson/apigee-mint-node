const ora = require('ora')
const apicaller = require('../utils/apicaller')
const yaml = require('js-yaml')
const fs = require('fs')
const figures = require('figures')
const apigeetool = require('apigeetool')
const path = require('path')
var sleep = require('sleep')

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
let ENV
let APIGEE_PROXY_NAME
let CONFIGDIR
let PROXY_URL
let CONSIDER_EXISTING_SETTINGS
let LOG_LEVEL


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

    //logger.debug('in args: ' + JSON.stringify(args));
    if (args.c || args.considerExistingSettings) {
      CONSIDER_EXISTING_SETTINGS = (args.c) ? args.c : args.considerExistingSettings;
    }

    if (args.e || args.env) {
      ENV = (args.e) ? args.e : args.env;
    } else {
      logger.error(figures('✖ ') + 'Please include the --env (-e) argument to specify the target environment (e.g. dev,test or prod)')
      process.exit()
    }

    if (args.d || args.directory) {
      CONFIGDIR = (args.d) ? args.d : args.directory;
      logger.info('config dir parameter found in args: "' + CONFIGDIR + '"')
    } else {
      var dirInEnvVar = (process.env.DIR_CONFIG) ? process.env.DIR_CONFIG : false
      if(!dirInEnvVar){
        CONFIGDIR = 'config'
        logger.info('config dir parameter not found in args or env, defaulting to: "' + CONFIGDIR + '"')
      }else{
        CONFIGDIR = dirInEnvVar
        logger.info('config dir parameter found in env: "' + CONFIGDIR + '"')
      } 
    }

    logger.debug('considerExistingSettings: ' + CONSIDER_EXISTING_SETTINGS);
    logger.debug('current working directory: ' + process.cwd());

    var dirOrgProfileConfig = CONFIGDIR + '/1-orgProfile.yml'
    var dirCurrencyConfig = CONFIGDIR + '/2-currency.yml'
    var dirTCsConfig = CONFIGDIR + '/3-termsAndConditions.yml'
    var dirAPIProductConfig = CONFIGDIR + '/4-apiProductMint.yml'
    var dirTRPathsConfig = CONFIGDIR + '/5-transactionRecordingPaths.yml'
    var dirTRPolicyConfig = CONFIGDIR + '/6-transactionRecordingPolicy.yml'
    var dirAPIProductBundleConfig = CONFIGDIR + '/7-productBundle.yml'
    var dirRatePlanConfig = CONFIGDIR + '/8-ratePlan.yml'
    var dirDeveloperConfig = CONFIGDIR + '/9-developer.yml'
    var dirDeveloperAppConfig = CONFIGDIR + '/10-developerApp.yml'
    var dirPurchaseRatePlanConfig = CONFIGDIR + '/11-purchaseRatePlan.yml'
    var dirReloadAccountBalanceConfig = CONFIGDIR + '/12-reloadAccountBalance.yml'
  
 
    // 1. Step - Load config files
    var configOrgProfile = yaml.safeLoad(fs.readFileSync(dirOrgProfileConfig, 'utf8'))
    logger.silly(JSON.stringify(configOrgProfile, null, 4))
    var configCurrencies = yaml.safeLoad(fs.readFileSync(dirCurrencyConfig, 'utf8'))
    logger.silly(JSON.stringify(configCurrencies, null, 4))
    var configTCs = yaml.safeLoad(fs.readFileSync(dirTCsConfig, 'utf8'))
    logger.silly(JSON.stringify(configTCs, null, 4))
    var configApiProduct = yaml.safeLoad(fs.readFileSync(dirAPIProductConfig), 'utf8')
    logger.silly(JSON.stringify(configApiProduct, null, 4))
    var configTRPaths = yaml.safeLoad(fs.readFileSync(dirTRPathsConfig), 'utf8')
    logger.silly(JSON.stringify(configTRPaths, null, 4))
    var configTRPolicy = yaml.safeLoad(fs.readFileSync(dirTRPolicyConfig), 'utf8')
    logger.silly(JSON.stringify(configTRPolicy, null, 4))
    var configApiProductBundle = yaml.safeLoad(fs.readFileSync(dirAPIProductBundleConfig), 'utf8')
    logger.silly(JSON.stringify(configApiProductBundle, null, 4))
    var configRatePlan = yaml.safeLoad(fs.readFileSync(dirRatePlanConfig), 'utf8')
    logger.silly(JSON.stringify(configRatePlan, null, 4))
    var configDeveloper = yaml.safeLoad(fs.readFileSync(dirDeveloperConfig), 'utf8')
    logger.silly(JSON.stringify(configDeveloper, null, 4))
    var configDeveloperApp = yaml.safeLoad(fs.readFileSync(dirDeveloperAppConfig), 'utf8')
    logger.silly(JSON.stringify(configDeveloperApp, null, 4))
    var configPurchaseRatePlan = yaml.safeLoad(fs.readFileSync(dirPurchaseRatePlanConfig), 'utf8')
    logger.silly(JSON.stringify(configPurchaseRatePlan, null, 4))
    var configReloadAccountBalance = yaml.safeLoad(fs.readFileSync(dirReloadAccountBalanceConfig), 'utf8')
    logger.silly(JSON.stringify(configReloadAccountBalance, null, 4))


    logger.info(figures('✔︎ ') + 'Configuration files found and loaded')


    // Compose Mint API Product as "Product -> TRPaths -> TRPolicy"
    // (TBD: make dynamic to where the !INCLUDE statement is, for now static)
    logger.silly('Now combining Product -> TRPaths -> TRPolicy') // ++
    configTRPaths[0].policies.response = [JSON.stringify(configTRPolicy)]
    configTRPaths[1].policies.response = [JSON.stringify(configTRPolicy)]
    configApiProduct.attributes[2].value = JSON.stringify(configTRPaths);
    logger.silly('===== configApiProduct with configTRPaths included =====')
    logger.silly(JSON.stringify(configApiProduct, null, 4))


    // Basic validation of what has been entered:

    // a) default currency in org profile is same as specified currency in currency config
    var currencyInCurrencyConfig = configCurrencies.name.toUpperCase()
    var currencyInOrgProfile = configOrgProfile.currency.toUpperCase()
    if (currencyInCurrencyConfig != currencyInOrgProfile) {
      logger.error(figures('✖ ') + 'For this kickstart setup, please make sure the chosen currency is also the default one in your org settings')
      logger.error(figures('') + 'Currently, you entered <' + currencyInOrgProfile + '> in your org profile and <' + currencyInCurrencyConfig + '> in the currency config')
      logger.error(figures('◼ ') + '[kickstart setup failed]')
      process.exit()
    }

    // b) T&Cs: make sure date is in correct format and not in the past
    var termsStartDateFromFile = configTCs.startDate
    var termsStartDate = new Date(termsStartDateFromFile)
    var nowDate = new Date()
    nowDate.setHours(0, 0, 0, 0) // removing time element
    termsStartDate.setHours(0, 0, 0, 0) // removing time element
    if (nowDate.getTime() > termsStartDate.getTime()) {
      logger.silly('nowDate.getTime()=' + nowDate.getTime() + ' | termsStartDate.getTime()=' + termsStartDate.getTime())
      logger.error(figures('✖ ') + 'Please make sure the T&Cs start date is in the future (or today) and in the right format')
      logger.error(figures('') + 'Currently, you entered <' + termsStartDate + '> in your termsAndConditions.yml config')
      logger.error(figures('') + 'Your system tells <' + nowDate + '> now')
      logger.info(figures('▶ ') + 'Tip: Change the start date to today and (optionally) the time to a few hours/minutes ahead of now.')
      logger.error(figures('◼ ') + '[kickstart setup failed]')
      process.exit()
    }

    // c) RATE PLAN: make sure start is not in the past
    var ratePlanStartDateFromFile = configRatePlan.startDate
    var ratePlanStartDate = new Date(ratePlanStartDateFromFile)
    var nowDate = new Date()
    nowDate.setHours(0, 0, 0, 0) // removing time element
    ratePlanStartDate.setHours(0, 0, 0, 0) // removing time element
    if (nowDate.getTime() > ratePlanStartDate.getTime()) {
      logger.error(figures('✖ ') + 'Please make sure the rate plan\'s start date is in the future (or today) and in the right format')
      logger.error(figures('') + 'Currently, you entered <' + ratePlanStartDateFromFile + '> in your rateplan.yml config')
      logger.error(figures('') + 'Your system tells <' + nowDate + '> now')
      logger.info(figures('▶ ') + 'Tip: Change the start date to today and (optionally) the time to a few hours/minutes ahead of now.')
      logger.error(figures('◼ ') + '[kickstart setup failed]')
      process.exit()
    }

    // d) PURCHASE RATE PLAN: make sure start date is not in the past
    // var purchaseRatePlanStartDateFromFile = configPurchaseRatePlan.startDate
    // var purchaseRatePlanStartDate = new Date(purchaseRatePlanStartDateFromFile)
    // var nowDate = new Date()
    // nowDate.setHours(0, 0, 0, 0) // removing time element
    // purchaseRatePlanStartDate.setHours(0, 0, 0, 0) // removing time element
    // if (nowDate.getTime() > purchaseRatePlanStartDate.getTime()) {
    //   logger.error(figures('✖ ') + 'Please make sure the target purchase date of the rate planis in the future (or today) and in the right format')
    //   logger.error(figures('') + 'Currently, you entered <' + purchaseRatePlanStartDateFromFile + '> in your purchaseRatePlan.yml config')
    //   logger.error(figures('') + 'Your system tells <' + nowDate + '> now')
    //   logger.info(figures('▶ ') + 'Tip: Change the start date to today and (optionally) the time to a few hours/minutes ahead of now.')
    //   logger.error(figures('◼ ') + '[kickstart setup failed]')
    //   process.exit()
    // }

    // instead of user-defined date, the current day is pre-populated in YYYY-MM-DD format
    configPurchaseRatePlan.startDate = new Date().toISOString().slice(0,10); // setting purchase date to today


    // e) Get Proxy name from apiproduct-mint.yml
    var proxyNameFromAPIProduct = configApiProduct.proxies[0];
    if (proxyNameFromAPIProduct == null) { // Check if not null
      logger.error(figures('✖ ') + 'API Proxy name is missing in API Product config')
      logger.info(figures('▶ ') + 'Tip: Open the apiproduct-mint.yml file and add a proxy name at $.proxies[0]')
      logger.error(figures('◼ ') + '[kickstart setup failed]')
    }
    if (hasWhiteSpace(proxyNameFromAPIProduct)) { // Check if it contains whitespaces
      logger.error(figures('✖ ') + 'API Proxy name does contain whitespaces which is not permitted')
      logger.info(figures('▶ ') + 'Tip: Open the apiproduct-mint.yml file and remove all whitespaces from the proxy name at $.proxies[0]')
      logger.error(figures('◼ ') + '[kickstart setup failed]')
    }
    APIGEE_PROXY_NAME = proxyNameFromAPIProduct
    logger.debug('proxy name found in apiproduct-mint.yml config: "' + APIGEE_PROXY_NAME + '"')

    logger.info(figures('✔︎ ') + 'Validation Complete')


    // 2. Step - Apply config files
    var credentialsArray = apicaller.setCredentialsAndOrg(args)
    if (!credentialsArray) {
      logger.error('credentials not found (set them either as arguments or environment variables)')
      process.exit()
    } else {
      UNAME = credentialsArray[0]
      PASS = credentialsArray[1]
      ORG = credentialsArray[2]
    }

    if (!apicaller.setCredentialsAndOrg(args)) {
      logger.error('credentials not found (set them either as arguments or environment variables)')
      process.exit()
    }

    // populate org name in orgProfile
    configOrgProfile.description = ORG
    configOrgProfile.id = ORG
    configOrgProfile.name = ORG

    const response = await apicaller.updateOrgProfile(configOrgProfile)
    logger.debug('response status (updateOrgProfile()) is ' + response.status)
    logger.debug('response is:')
    logger.debug(JSON.stringify(response.data, null, '\t'))
    if (response.status != 200) {
      logger.error('call to obtain org details failed with status code ' + response.status)
      process.exit()
    }

    logger.info(figures('✔︎ ') + 'Organization Profile Updated')

    var defaultCurrencyAlreadyExists = false; // check if the default currency from the org profile already exists
    if (CONSIDER_EXISTING_SETTINGS == 'true') {
      const response = await apicaller.getCurrencies()
      logger.debug('response status is ' + response.status)
      logger.debug('response is:')
      logger.debug(JSON.stringify(response.data, null, '\t'))
      logger.info('(considering existing settings) checking if the chosen default currency already exists ...')
      if (response.data.totalRecords > 0) {
        for (var iter in response.data.supportedCurrency) {
          var c = response.data.supportedCurrency[iter]
          if (c.name.toUpperCase() == currencyInOrgProfile) {
            defaultCurrencyAlreadyExists = true
            logger.info(figures('✔︎ ') + 'Default currency found')
          }
        }
      }
    }

    if ((CONSIDER_EXISTING_SETTINGS == 'false') || ((CONSIDER_EXISTING_SETTINGS == 'true') && !defaultCurrencyAlreadyExists)) {
      if (CONSIDER_EXISTING_SETTINGS == 'true') {
        logger.info('(considering existing settings) No, chosen default currency does not exist yet, adding one ...')
      }

      configCurrencies.organization.id = ORG 
      const response2 = await apicaller.addCurrency(configCurrencies)
      logger.debug('response status (addCurrency()) is ' + response2.status)
      logger.debug('response is:')
      logger.debug(JSON.stringify(response.data, null, '\t'))
      if (response2.status != 200) {
        logger.error('call to add currency failed with status code ' + response2.status)
        process.exit()
      }
      logger.info(figures('✔︎ ') + 'New supported currency added')
    }

    var validTCsAlreadyExist = false; // check if there already are valid T&Cs for a kickstart setup
    if (CONSIDER_EXISTING_SETTINGS == 'true') {
      const response = await apicaller.getTermsAndConditions()
      logger.debug('response status is ' + response.status)
      logger.debug('response is:')
      logger.debug(JSON.stringify(response.data, null, '\t'))
      logger.info('(considering existing settings) checking if valid T&Cs already exist ...')
      if (response.data.totalRecords > 0) {
        for (var iter2 in response.data.tnc) {
          var tnc = response.data.tnc[iter2]
          var termsStartDate = new Date(tnc.startDate)
          var nowDate = new Date();
          if (nowDate > termsStartDate) {
            validTCsAlreadyExist = true
            logger.info(figures('✔︎ ') + 'Valid T&Cs found')
            break
          }
        }
      }
    }


    if ((CONSIDER_EXISTING_SETTINGS == 'false') || ((CONSIDER_EXISTING_SETTINGS == 'true') && !validTCsAlreadyExist)) {
      if (CONSIDER_EXISTING_SETTINGS == 'true') {
        logger.info('(considering existing settings) No, valid T&Cs do not exist yet, adding them ...')
      }
      const response3 = await apicaller.addTermsAndConditions(configTCs)
      logger.debug('response status (addTermsAndConditions()) is ' + response3.status)
      logger.debug('response is:')
      logger.debug(JSON.stringify(response.data, null, '\t'))
      if (response3.status != 200) {
        logger.error('call to add T&Cs failed with status code ' + response3.status)
        process.exit()
      }
      logger.info(figures('✔︎ ') + 'New T&Cs added')
    }

    // 4. Deploy API Proxy & Product & API Bundle/Package & Unplublished Rate Plan
    // apigeetool deployproxy -u $username -p $password -o $org_name -e $env -n $proxy_name -d proxies

    // 4. Deploy API Proxy
    var sdk = apigeetool.getPromiseSDK()
    var opts = {
      organization: ORG,
      username: UNAME,
      password: PASS,
      environments: ENV,
    }

    opts.api = APIGEE_PROXY_NAME
    var targetDir = path.join(process.cwd(), 'proxies')
    logger.debug('selected proxy directory: ' + targetDir)
    opts.directory = targetDir

    logger.info('Deploying proxy ...')
    await sdk.deployProxy(opts)
      .then(function (result) {
        logger.info(figures('✔︎ ') + 'Proxy successfully deployed')
        var uri = (result[0].uris[1]) ? result[0].uris[1] : result[0].uris[0]
        PROXY_URL = uri
        var revision = result[0].revision
        var revisionNote = ''
        if (revision > 1) {
          revisionNote = ' (a new revision has been deployed to an existing API Proxy)'
        }
        logger.info('proxy name: "' + result[0].name + '", revision: ' + result[0].revision + revisionNote + ', URI: ' + uri + '');
        logger.debug(JSON.stringify(result))
      }, function (err) {
        logger.error(figures('✖ ') + 'Proxy Deployment failed - see error below:')
        logger.error(JSON.stringify(err))
        logger.error(figures('◼ ') + '[kickstart setup failed]')
        process.exit()
      });


    // 4. Create API Product

    // 4.1 Compose API Product (done above already)

    // 4.2 Callout
    const responseAPIProduct = await apicaller.createAPIProduct(configApiProduct)
    logger.debug('response status (createAPIProduct()) is ' + responseAPIProduct.status)
    logger.debug('response is:')
    logger.debug(JSON.stringify(responseAPIProduct.data, null, '\t'))
    if (responseAPIProduct.status > 201) {
      logger.error('call to create API Product failed with status code ' + responseAPIProduct.status)
      process.exit()
    }
    logger.info(figures('✔︎ ') + 'API Product created')


    var API_PRODUCT_ID = configApiProduct.name;


    // 5. Create API Product Bundle
    const responseAPIProductBundle = await apicaller.createAPIProductBundle(configApiProductBundle)
    logger.debug('response status (createAPIProductBundle()) is ' + responseAPIProductBundle.status)
    logger.debug('response is:')
    logger.debug(JSON.stringify(responseAPIProductBundle.data, null, '\t'))
    if (responseAPIProductBundle.status > 201) {
      logger.error('call to create API Product failed with status code ' + responseAPIProductBundle.status)
      process.exit()
    }
    logger.info(figures('✔︎ ') + 'API Product Bundle created')

    var PRODUCT_BUNDLE_ID = responseAPIProductBundle.data.id

    // 6. Create Rate Plan

    // 6.1 Set Rate Plan dynamic fields to complete config
    configRatePlan.currency.id = configCurrencies.name
    logger.debug('rate plan currency set to: ' + configRatePlan.currency.id)
    configRatePlan.ratePlanDetails[0].organization.id = ORG;
    configRatePlan.ratePlanDetails[0].currency.id = configCurrencies.name.toLowerCase();
    logger.debug('============== the rate plan JSON to send ...')
    logger.debug(JSON.stringify(configRatePlan, null, '\t'))

    // 6.2 Submit Rate Plan
    const responseRatePlan = await apicaller.createRatePlan(configRatePlan, PRODUCT_BUNDLE_ID)
    logger.debug('response status (createRatePlan()) is ' + responseRatePlan.status)
    logger.debug('response is:')
    logger.debug(JSON.stringify(responseRatePlan.data, null, '\t'))
    if (responseRatePlan.status > 201) {
      logger.error('call to create API Product failed with status code ' + responseRatePlan.status)
      process.exit()
    }
    logger.info(figures('✔︎ ') + 'API Rate Plan created')


    var RATE_PLAN_ID = responseRatePlan.data.id; // store rate plan ID for further calls below


    // 7. Create Developer

    // 7.1 Set org name in config
    configDeveloper.organizationName = ORG

    // 7.2 Submit Developer (object)
    const respDeveloper = await apicaller.createDeveloper(configDeveloper)
    logger.debug('response status (createDeveloper()) is ' + respDeveloper.status)
    logger.debug('response is:')
    logger.debug(JSON.stringify(respDeveloper.data, null, '\t'))
    if (respDeveloper.status > 201) {
      logger.error('call to create Developer failed with status code ' + respDeveloper.status)
      process.exit()
    }
    logger.info(figures('✔︎ ') + 'Developer created')

    var DEVELOPER_ID = respDeveloper.data.developerId // Setting developer ID for further calls below
    logger.silly('set DEVELOPER_ID=' + DEVELOPER_ID)
    var DEVELOPER_EMAIL = configDeveloper.email // Setting developer email for further calls below
    logger.silly('set DEVELOPER_EMAIL=' + DEVELOPER_EMAIL)

    // 8. Create Developer App
    const respDeveloperApp = await apicaller.createDeveloperApp(configDeveloperApp, DEVELOPER_EMAIL)
    logger.debug('response status (createDeveloperApp()) is ' + respDeveloperApp.status)
    logger.debug('response is:')
    logger.debug(JSON.stringify(respDeveloperApp.data, null, '\t'))
    if (respDeveloperApp.status > 201) {
      logger.error('call to create Developer App failed with status code ' + respDeveloper.status)
      process.exit()
    }
    logger.info(figures('✔︎ ') + 'Developer App created')

    var API_KEY = respDeveloperApp.data.credentials[0].consumerKey // storing API Key for further use
    var APP_ID = respDeveloperApp.data.appId

    // 9. Add Balance to Funds

    configReloadAccountBalance.supportedCurrency.id = configCurrencies.name.toLowerCase()
    const respReloadAccountBalance = await apicaller.reloadDeveloperBalance(configReloadAccountBalance, DEVELOPER_ID)
    logger.debug('response status (createDeveloperApp()) is ' + respReloadAccountBalance.status)
    logger.debug('response is:')
    logger.debug(JSON.stringify(respReloadAccountBalance.data, null, '\t'))
    if (respReloadAccountBalance.status > 201) {
      logger.error('call to add balance to funds failed with status code ' + respDeveloper.status)
      process.exit()
    }
    logger.info(figures('✔︎ ') + 'Balance has been added to developer account')

    var TOP_UP_AMOUNT = configReloadAccountBalance.amount

    sleep.sleep(5)

    // 10. Purchase Rate Plan
    configPurchaseRatePlan.developer.id = DEVELOPER_ID
    configPurchaseRatePlan.ratePlan.id = RATE_PLAN_ID

    const respPurchaseRatePlan = await apicaller.purchaseRatePlan(configPurchaseRatePlan, DEVELOPER_ID)
    logger.debug('response status (createDeveloperApp()) is ' + respPurchaseRatePlan.status)
    logger.debug('response is:')
    logger.debug(JSON.stringify(respPurchaseRatePlan.data, null, '\t'))
    if (respPurchaseRatePlan.status > 201) {
      logger.error('call to purchase rate plan failed with status code ' + respDeveloper.status)
      process.exit()
    }
    logger.info(figures('✔︎ ') + 'Rate Plan purchased')


    sleep.sleep(3)


    // 11. Get Usage Prior to API Calls
    const respDeveloperUsage = await apicaller.getDeveloperUsage(DEVELOPER_ID)
    logger.debug('response status (getDeveloperUsage()) is ' + respDeveloperUsage.status)
    logger.debug('response is:')
    logger.debug(JSON.stringify(respDeveloperUsage.data, null, '\t'))
    if (respDeveloperUsage.status > 200) {
      logger.error('call to get developer usage failed with status code ' + respDeveloper.status)
      process.exit()
    }
    var CURRENT_USAGE = respDeveloperUsage.data.developerBalance[0].usage
    logger.info(figures('✔︎ ') + ' Developer Usage Retrieved, currently: ' + CURRENT_USAGE)


    logger.info('Waiting 10 seconds before hitting the API ...')
    sleep.sleep(10)


    // 12. Hit Monetized API
    var urlToCall = PROXY_URL + '/ip?apikey=' + API_KEY
    logger.debug('combined URL to call a GET to: ' + urlToCall)
    logger.info('Executing three test calls now ...')
    var i;
    for (i = 0; i < 3; i++) {
      var iter = i + 1
      var respTestAPICall = await apicaller.executeTestCall(urlToCall)
      logger.debug('response status (executeTestCall()) #' + (i + 1) + ' is ' + respTestAPICall.status)
      if (respTestAPICall.status != 200) {
        logger.error('test API call #' + iter + ' failed with status code ' + respTestAPICall.status)
        process.exit()
      }
      logger.info(figures('✔︎ ') + ' Test call #' + iter + '  succeeded')
      sleep.sleep(2)
    }

    logger.info('Waiting 10 seconds before re-checking usage ...')
    sleep.sleep(10)

    // 13. Check Balance 2nd time
    const respDeveloperUsageAfterCall = await apicaller.getDeveloperUsage(DEVELOPER_ID)
    logger.debug('response status (getDeveloperUsage()) (after API calls) is ' + respDeveloperUsageAfterCall.status)
    logger.debug('response is:')
    logger.debug(JSON.stringify(respDeveloperUsageAfterCall.data, null, '\t'))
    if (respDeveloperUsageAfterCall.status > 200) {
      logger.error('call to get developer usage failed with status code ' + respDeveloper.status)
      process.exit()
    }
    var CURRENT_USAGE_AFTER_CALLS = respDeveloperUsageAfterCall.data.developerBalance[0].usage
    logger.info(figures('✔︎ ') + ' Developer Usage Retrieved (after calling API), currently: ' + CURRENT_USAGE_AFTER_CALLS)


    // 14. Compare usage, if higher, then successful
    var usageIncreased = CURRENT_USAGE_AFTER_CALLS > CURRENT_USAGE
    var increasedBy = CURRENT_USAGE_AFTER_CALLS - CURRENT_USAGE
    if (!usageIncreased) {
      logger.error('usage did not increase, setup has failed (initial usage: ' + CURRENT_USAGE + ', usage after test calls: ' + CURRENT_USAGE_AFTER_CALLS + ')')
          // 13. Summary of created entities TBD
    logger.info('')
    logger.info('|==========================================|')
    logger.info('| ' + figures('✖ ') + 'Monetization Kickstart Setup Completed with Error |')
    logger.info('|==========================================|')
    logger.info('')
    logger.info('Summary of created entities:')
    logger.info('Proxy deployed (ID: ' + APIGEE_PROXY_NAME + ')')
    logger.info('API Product created (ID: ' + API_PRODUCT_ID + ')')
    logger.info('Product Bundle created (ID: ' + PRODUCT_BUNDLE_ID + ')')
    logger.info('Rate Plan created (ID: ' + RATE_PLAN_ID + ')')
    logger.info('Developer created (ID: ' + DEVELOPER_ID + ')')
    logger.info('Developer App created (ID: ' + APP_ID + ')')
    logger.info('App Credentials generated (API Key: ' + API_KEY + ')')
    logger.info('Account topped up (Amount: ' + TOP_UP_AMOUNT + ')')
    logger.info('')
    logger.info('API URL for further troubleshooting:')
    logger.info('GET ' + urlToCall)
    logger.info('')
      process.exit()
    }
    logger.info(figures('✔︎ ') + 'Usage increased after API calls, Monetization enforced.')
    logger.debug('Usage increased by: ' + increasedBy)

    // 13. Summary of created entities TBD
    logger.info('')
    logger.info('|==========================================|')
    logger.info('| ' + figures('★ ') + 'Monetization Kickstart Setup Complete! |')
    logger.info('|==========================================|')
    logger.info('')
    logger.info('Summary of created entities:')
    logger.info('Proxy deployed (ID: ' + APIGEE_PROXY_NAME + ')')
    logger.info('API Product created (ID: ' + API_PRODUCT_ID + ')')
    logger.info('Product Bundle created (ID: ' + PRODUCT_BUNDLE_ID + ')')
    logger.info('Rate Plan created (ID: ' + RATE_PLAN_ID + ')')
    logger.info('Developer created (ID: ' + DEVELOPER_ID + ')')
    logger.info('Developer App created (ID: ' + APP_ID + ')')
    logger.info('App Credentials generated (API Key: ' + API_KEY + ')')
    logger.info('Account topped up (Amount: ' + TOP_UP_AMOUNT + ')')
    logger.info('')
    logger.info('Call this URL to hit the monetized API:')
    logger.info('GET ' + urlToCall)
    logger.info('')


    process.exit()

  } catch (err) {
    spinner.stop()
    logger.error(err)
    process.exit()
  }

}

function sleep(millis) {
  return new Promise(resolve => setTimeout(resolve, millis));
}


function hasWhiteSpace(s) {
  return s.indexOf(' ') >= 0;
}


Date.prototype.withoutTime = function () {
  var d = new Date(this);
  d.setHours(0, 0, 0, 0);
  return d;
}