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

let UNAME;
let PASS;
let ORG;
let ENV;
let APIGEE_PROXY_NAME;

//--organization -o (required) The name of the organization to deploy to. May be set as an environment variable APIGEE_ORGANIZATION.
//--password -p (required) Your Apigee account password. May be set as an environment variable APIGEE_PASSWORD.
//--username -u (required) Your Apigee account username. May be set as an environment variable APIGEE_USERNAME.
// --env -e (required) The target environment to deploy the kickstart assets to (dev/test/prod)
//--considerExistingSettings -c (optional, defaults to 'true') (true/false) consider existing monetization settings or simply add all necessary configurations on top of what you already have or a clean environment
//--configCurrency --configOrgProfile --configTCs --configApiProduct file directories, default is config/<file>.yml (all optional)
// --proxyName (optional) name the proxy, otherwise defaulting to 'm10n-kickstart-v1'
//--logLevel -l (optional, defaults to 'info') log level alternatively to LOG_LEVEL env variable, defaults to info


let CONSIDER_EXISTING_SETTINGS = (process.env.CONSIDER_EXISTING_SETTINGS) ? process.env.CONSIDER_EXISTING_SETTINGS : 'yes'
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

    //logger.debug('that is in args: ' + JSON.stringify(args));
    if (args.c || args.considerExistingSettings) {
      CONSIDER_EXISTING_SETTINGS = (args.c) ? args.c : args.considerExistingSettings;
    }

    if (args.e || args.env) {
      ENV = (args.e) ? args.e : args.env;
    }else{
      logger.error(figures('✖ ') + 'Please include the --env (-e) argument to specify the target environment (e.g. dev,test or prod)')
      process.exit()
    }

    if (args.proxyName) {
      APIGEE_PROXY_NAME = proxyName;
      logger.debug('proxy name found in args: "' + APIGEE_PROXY_NAME + '"')
    }else{
      APIGEE_PROXY_NAME = 'm10n-kickstart-v1'; // defaulting the name if not in args
      logger.debug('proxy name not found in args, therefore defaulting to "' + APIGEE_PROXY_NAME + '"')
    }

    logger.debug('considerExistingSettings: ' + CONSIDER_EXISTING_SETTINGS);
    logger.debug('current working directory: ' + process.cwd());

    var rootDir = 'config/'

    var dirOrgProfileConfig = 'config/orgProfile.yml' // set defaults
    var dirTCsConfig = 'config/termsAndConditions.yml' 
    var dirCurrencyConfig = 'config/currency.yml'
    var dirAPIProductConfig = 'config/apiproduct-mint.yml'

    var TRPathsConfig = 'transactionRecordingPaths.yml' // ++
    var TRPolicyConfig =  'transactionRecordingPolicy.yml' // ++
    var ratePlanConfig = 'rateplan.yml'
    var dirRatePlanConfig = rootDir + ratePlanConfig
    var dirTRPathsConfig = rootDir + TRPathsConfig// not configurable as variable yet // ++
    var dirTRPolicyConfig = rootDir + TRPolicyConfig // not configurable as variable yet // ++
    var dirAPIProductBundleConfig = 'config/productbundle.yml'


    // if in argument, replace
    if (args.configOrgProfile) {
      dirOrgProfileConfig = args.configOrgProfile
    }
    if (args.configCurrency) {
      dirCurrencyConfig = args.configCurrency
    }
    if (args.configTCs) {
      dirTCsConfig = args.configTCs
    }
    if (args.configApiProduct) {
      dirAPIProductConfig = args.configApiProduct
    }
    if (args.configApiBundle) {
      dirAPIProductBundleConfig = args.configApiBundle
    }

    // 1. Step - Load config files
    var configOrgProfile = yaml.safeLoad(fs.readFileSync(dirOrgProfileConfig, 'utf8'))
    logger.silly(JSON.stringify(configOrgProfile, null, 4))
    var configCurrencies = yaml.safeLoad(fs.readFileSync(dirCurrencyConfig, 'utf8'))
    logger.silly(JSON.stringify(configCurrencies, null, 4))
    var configTCs = yaml.safeLoad(fs.readFileSync(dirTCsConfig, 'utf8'))
    logger.silly(JSON.stringify(configTCs, null, 4))
    var configApiProduct = yaml.safeLoad(fs.readFileSync(dirAPIProductConfig), 'utf8')
    logger.silly(JSON.stringify(configApiProduct, null, 4))


    var configTRPaths = yaml.safeLoad(fs.readFileSync(dirTRPathsConfig), 'utf8') // ++
    logger.silly(JSON.stringify(configTRPaths, null, 4)) // ++
    var configTRPolicy = yaml.safeLoad(fs.readFileSync(dirTRPolicyConfig), 'utf8') // ++
    logger.silly(JSON.stringify(configTRPolicy, null, 4)) // ++


    var configApiProductBundle = yaml.safeLoad(fs.readFileSync(dirAPIProductBundleConfig), 'utf8') 
    logger.silly(JSON.stringify(configApiProductBundle, null, 4))
    var configRatePlan = yaml.safeLoad(fs.readFileSync(dirRatePlanConfig), 'utf8') // ++
    logger.silly(JSON.stringify(configRatePlan, null, 4)) // ++


    logger.info(figures('✔︎ ') + 'Configuration files found and loaded')


    // Compose Mint API Product as "Product -> TRPaths -> TRPolicy"
    // improvement: make dynamic to where the !INCLUDE statement is, for now static
    logger.debug('Now combining Product -> TRPaths -> TRPolicy') // ++
    configTRPaths[0].policies.response = [JSON.stringify(configTRPolicy)] // ++
    configTRPaths[1].policies.response = [JSON.stringify(configTRPolicy)] // ++
    configApiProduct.attributes[2].value = JSON.stringify(configTRPaths); // ++
    logger.silly('===== configApiProduct with configTRPaths included =====') // ++
    logger.silly(JSON.stringify(configApiProduct, null, 4)) // ++


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

    // b) make sure date is in correct format and not in the past
    var termsStartDateFromFile = configTCs.startDate
    var termsStartDate = new Date(termsStartDateFromFile)
    var nowDate = new Date()
    if (nowDate > termsStartDate) {
      logger.error(figures('✖ ') + 'Please make sure the T&Cs start date is in the future and in the right format')
      logger.error(figures('') + 'Currently, you entered <' + termsStartDateFromFile + '> in your currency.yml config')
      logger.error(figures('') + 'Your system tells <' + nowDate + '> now')
      logger.error(figures('◼ ') + '[kickstart setup failed]')
      process.exit()
    }

    // c) make sure rate plan start is not in the past
    var ratePlanStartDateFromFile = configRatePlan.startDate
    var ratePlanStartDate = new Date(ratePlanStartDateFromFile)
    var nowDate = new Date()
    if(nowDate > ratePlanStartDate){
      logger.error(figures('✖ ') + 'Please make sure the rate plan\'s start date is in the future and in the right format')
      logger.error(figures('') + 'Currently, you entered <' + ratePlanStartDateFromFile + '> in your rateplan.yml config')
      logger.error(figures('') + 'Your system tells <' + nowDate + '> now')
      logger.info(figures('▶ ') + 'Tip: Change the start date to today and the time to a few hours/minutes ahead of now.')
      logger.error(figures('◼ ') + '[kickstart setup failed]')
      process.exit()
    }



    logger.info(figures('✔︎ ') + 'Validation Complete')

    // 2. Step - Apply config files

    var credentialsArray = apicaller.setCredentialsAndOrg(args)

    if(!credentialsArray){
      logger.error('credentials not found (set them either as arguments or environment variables)')
      process.exit()
    }else{
      UNAME = credentialsArray[0]
      PASS  = credentialsArray[1]
      ORG   = credentialsArray[2]
    }

    if (!apicaller.setCredentialsAndOrg(args)) {
      logger.error('credentials not found (set them either as arguments or environment variables)')
      process.exit()
    }


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
    if (CONSIDER_EXISTING_SETTINGS == 'yes') {
      const response = await apicaller.getCurrencies()
      logger.debug('response status is ' + response.status)
      logger.debug('response is:')
      logger.debug(JSON.stringify(response.data, null, '\t'))
      logger.info('(considering existing settings) checking if the chosen default currency already exists ...')
      if(response.data.totalRecords > 0){
        for(var iter in response.data.supportedCurrency){
            var c = response.data.supportedCurrency[iter]
            if(c.name.toUpperCase() == currencyInOrgProfile){
              defaultCurrencyAlreadyExists = true
              logger.info(figures('✔︎ ') + 'Default currency found')
            }
        }
      }
    }

    if ((CONSIDER_EXISTING_SETTINGS == 'no') || ((CONSIDER_EXISTING_SETTINGS == 'yes') && !defaultCurrencyAlreadyExists)) {
      if(CONSIDER_EXISTING_SETTINGS == 'yes'){
        logger.info('(considering existing settings) No, chosen default currency does not exist yet, adding one ...')
      }
      const response2 = await apicaller.addCurrency(configCurrencies)
      logger.debug('response status (addCurrency()) is ' + response2.status)
      logger.debug('response is:')
      logger.debug(JSON.stringify(response.data, null, '\t'))
      if (response2.status != 200) {
        logger.error('call to add currency failed with status code ' + response.status)
        process.exit()
      }
      logger.info(figures('✔︎ ') + 'New supported currency added')
    }

    var validTCsAlreadyExist = false; // check if there already are valid T&Cs for a kickstart setup
    if (CONSIDER_EXISTING_SETTINGS == 'yes') {
      const response = await apicaller.getTermsAndConditions()
      logger.debug('response status is ' + response.status)
      logger.debug('response is:')
      logger.debug(JSON.stringify(response.data, null, '\t'))
      logger.info('(considering existing settings) checking if valid T&Cs already exist ...')
      if(response.data.totalRecords > 0){
        for(var iter2 in response.data.tnc){
            var tnc = response.data.tnc[iter2]
            var termsStartDate = new Date(tnc.startDate)
            var nowDate = new Date();
            if(nowDate > termsStartDate){
              validTCsAlreadyExist = true
              logger.info(figures('✔︎ ') + 'Valid T&Cs found')
              break
            }
        }
      }
    }


    if ((CONSIDER_EXISTING_SETTINGS == 'no')  || ((CONSIDER_EXISTING_SETTINGS == 'yes') && !validTCsAlreadyExist)) {
      if(CONSIDER_EXISTING_SETTINGS == 'yes'){
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
    var targetDir = path.join(process.cwd(),'proxies')
    logger.debug('selected proxy directory: ' + targetDir)
    opts.directory = targetDir

    logger.info('Deploying proxy ...')
    await sdk.deployProxy(opts)
      .then(function (result) {
        logger.info(figures('✔︎ ') + 'Proxy successfully deployed')
        //result = [{"name":"m10n-kickstart-v1","environment":"test","revision":3,"state":"deployed","basePath":"/","uris":["http://demo8-test.apigee.net/m10n-kickstart/v1","https://demo8-test.apigee.net/m10n-kickstart/v1"]}];
        var uri = (result[0].uris[1]) ? result[0].uris[1] : result[0].uris[0]
        var revision = result[0].revision
        var revisionNote = ''
        if(revision > 1){
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

    // 4.2 Callout // ++
    const responseAPIProduct = await apicaller.createAPIProduct(configApiProduct)
    logger.debug('response status (createAPIProduct()) is ' + responseAPIProduct.status)
    logger.debug('response is:')
    logger.debug(JSON.stringify(responseAPIProduct.data, null, '\t'))
    if (responseAPIProduct.status > 201) {
      logger.error('call to create API Product failed with status code ' + responseAPIProduct.status)
      process.exit()
    }
    logger.info(figures('✔︎ ') + 'API Product created')


    // 5. Create API Product Bundle // ++
    const responseAPIProductBundle = await apicaller.createAPIProductBundle(configApiProductBundle)
    logger.debug('response status (createAPIProductBundle()) is ' + responseAPIProductBundle.status)
    logger.debug('response is:')
    logger.debug(JSON.stringify(responseAPIProductBundle.data, null, '\t'))
    if (responseAPIProductBundle.status > 201) {
      logger.error('call to create API Product failed with status code ' + responseAPIProductBundle.status)
      process.exit()
    }
    logger.info(figures('✔︎ ') + 'API Product Bundle created')


    //6. Create Rate Plan

    // 6.1 Set Rate Plan dynamic fields to complete config
    configRatePlan.monetizationPackage = responseAPIProductBundle.data.id
    configRatePlan.currency.id = configCurrencies.name.toLowerCase()
    configRatePlan.organization = ORG;
    configRatePlan.ratePlanDetails[0].organization.id = ORG;
    configRatePlan.ratePlanDetails[0].currency.id = configCurrencies.name.toLowerCase();

    logger.debug('============== the rate plan JSON to send .. ============')
    logger.debug(JSON.stringify(configRatePlan, null, '\t'))

    // 6.2 Submit Rate Plan
    const responseRatePlan = await apicaller.createRatePlan(configRatePlan, responseAPIProductBundle.data.id)
    logger.debug('response status (createRatePlan()) is ' + responseRatePlan.status)
    logger.debug('response is:')
    logger.debug(JSON.stringify(responseRatePlan.data, null, '\t'))
    if (responseRatePlan.status > 201) {
      logger.error('call to create API Product failed with status code ' + responseRatePlan.status)
      process.exit()
    }
    logger.info(figures('✔︎ ') + 'API Rate Plan created')


    process.exit()


  } catch (err) {
    spinner.stop()
    logger.error(err)
    process.exit()
  }

}

