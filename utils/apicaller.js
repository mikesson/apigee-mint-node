const axios = require('axios')
const figures = require('figures');
const winston = require('winston')

// var logger = winston.createLogger({
//   format: winston.format.combine(
//     winston.format.colorize(),
//     winston.format.simple()
//   ),
//   defaultMeta: {},
//   transports: [
//     new (winston.transports.Console)({
//       level: (process.env.LOG_LEVEL) ? process.env.LOG_LEVEL : 'debug',
//       name: 'console'
//     })
//   ]
// });

var logger;

let UNAME;
let PASS;
let ORG;

let AUTH_TOKEN;

module.exports = {

  getOrgData: async () => {
    const results = await axios({
      method: 'get',
      url: 'https://api.enterprise.apigee.com/v1/organizations/' + ORG,
      params: {
        format: 'json'
      }
    })
    return results;
  },

  updateOrgData: async (payload) => {
    const results = await axios({
      method: 'post',
      url: 'https://api.enterprise.apigee.com/v1/organizations/' + ORG,
      params: {
        format: 'json'
      },
      data: payload
    })
    return results;
  },

  deleteAllM10nData: async () => {
    const results = await axios({
      method: 'post',
      url: 'https://api.enterprise.apigee.com/v1/mint/organizations/' + ORG + '/delete-org-data',
      params: {
        format: 'json'
      }
    })
    return results;
  },

  updateOrgProfile: async (payload) => {
    const results = await axios({
      method: 'put',
      url: 'https://api.enterprise.apigee.com/v1/mint/organizations/' + ORG,
      params: {
        format: 'json'
      },
      data: payload
    })
    return results;
  },

  addCurrency: async (payload) => {
    const results = await axios({
      method: 'post',
      url: 'https://api.enterprise.apigee.com/v1/mint/organizations/' + ORG + '/supported-currencies',
      params: {
        format: 'json'
      },
      data: payload
    }).catch(function (error) {
      if (error.response) {
        logger.error(figures('✖ ') + 'Error when adding currency, find more details below:')
        logger.error('HTTP ' + error.response.status + ' | ' + JSON.stringify(error.response.data))
        if (error.response.data.code == 'mint.genericMessage') {
          logger.info(figures('▶ ') + 'Tip: Check whether the currency you\'re trying to add is already available in your supported currencies.')
          logger.info('https://apidocs.apigee.com/monetize/apis/get/organizations/%7Borg_name%7D/supported-currencies')
        }
        process.exit()
      }
    })
    return results;
  },

  getCurrencies: async () => {
    const results = await axios({
      method: 'get',
      url: 'https://api.enterprise.apigee.com/v1/mint/organizations/' + ORG + '/supported-currencies',
      params: {
        format: 'json'
      }
    })
    return results;
  },

  getDeveloperUsage: async (devId) => {
    const results = await axios({
      method: 'get',
      url: 'https://api.enterprise.apigee.com/v1/mint/organizations/' + ORG + '/developers/' + devId + '/developer-balances',
      params: {
        format: 'json'
      }
    })
    return results;
  },


  executeTestCall: async (targetUrl) => {
    const results = await axios({
      method: 'get',
      url: targetUrl,
      params: {
        format: 'json'
      }
    })
    return results;
  },

  addTermsAndConditions: async (payload) => {
    const results = await axios({
      method: 'post',
      url: 'https://api.enterprise.apigee.com/v1/mint/organizations/' + ORG + '/tncs',
      params: {
        format: 'json'
      },
      data: payload
    }).catch(function (error) {
      if (error.response) {
        logger.error(figures('✖ ') + 'Error when adding terms and conditions, find more details below:')
        logger.error('HTTP ' + error.response.status + ' | ' + JSON.stringify(error.response.data))
        if (error.response.data.code == 'mint.resourceAlreadyExists') {
          logger.info(figures('▶ ') + 'Tip: Change the version tag in the termsAndConditions.yml file')
        }
        process.exit()
      }
    })
    return results;
  },

  getTermsAndConditions: async () => {
    const results = await axios({
      method: 'get',
      url: 'https://api.enterprise.apigee.com/v1/mint/organizations/' + ORG + '/tncs',
      params: {
        format: 'json'
      }
    })
    return results;
  },


  createAPIProduct: async (payload) => {
    const results = await axios({
      method: 'post',
      url: 'https://api.enterprise.apigee.com/v1/organizations/' + ORG + '/apiproducts',
      params: {
        format: 'json'
      },
      data: payload
    }).catch(function (error) {
      if (error.response) {
        logger.error(figures('✖ ') + 'Error when creating API product, find more details below:')
        logger.error('HTTP ' + error.response.status + ' | ' + JSON.stringify(error.response.data))
        if (error.response.data.code == 'mint.resourceAlreadyExists') {
          logger.info(figures('▶ ') + 'Tip: Remove the existing API Product with the same ID or rename the new one, then retry')
        }
        process.exit()
      }
    })
    return results;
  },




  createAPIProductBundle: async (payload) => {
    const results = await axios({
      method: 'post',
      url: 'https://api.enterprise.apigee.com/v1/mint/organizations/' + ORG + '/monetization-packages',
      params: {
        format: 'json'
      },
      data: payload
    }).catch(function (error) {
      if (error.response) {
        logger.error(figures('✖ ') + 'Error when creating API product bundle, find more details below:')
        logger.error('HTTP ' + error.response.status + ' | ' + JSON.stringify(error.response.data))
        if(error.response.data.code == 'mint.resourceAlreadyExists'){
          logger.info(figures('▶ ') + 'Tip: Remove the existing API Product bundle with the same ID or rename the new one, then retry')
        }
        process.exit()
      }
    })
    return results;
  },


  createRatePlan: async (payload, productBundle) => {
    const results = await axios({
      method: 'post',
      url: 'https://api.enterprise.apigee.com/v1/mint/organizations/' + ORG + '/monetization-packages/' + productBundle + '/rate-plans',
      params: {
        format: 'json'
      },
      data: payload
    }).catch(function (error) {
      if (error.response) {
        logger.error(figures('✖ ') + 'Error when creating API rate plan, find more details below:')
        logger.error('HTTP ' + error.response.status + ' | ' + JSON.stringify(error.response.data))
        // if(error.response.data.code == 'mint.resourceAlreadyExists'){
        //   logger.info(figures('▶ ') + 'Tip: <some tip ...>')
        // }
        process.exit()
      }
    })
    return results;
  },


  createDeveloper: async (payload) => {
    const results = await axios({
      method: 'post',
      url: 'https://api.enterprise.apigee.com/v1/organizations/' + ORG + '/developers',
      params: {
        format: 'json'
      },
      data: payload
    }).catch(function (error) {
      if (error.response) {
        logger.error(figures('✖ ') + 'Error when creating Developer, find more details below:')
        logger.error('HTTP ' + error.response.status + ' | ' + JSON.stringify(error.response.data))
        // if(error.response.data.code == 'known_error_code'){
        //   logger.info(figures('▶ ') + 'Tip: <some tip ...>')
        // }
        process.exit()
      }
    })
    return results;
  },


  createDeveloperApp: async (payload, devEmail) => {
    const results = await axios({
      method: 'post',
      url: 'https://api.enterprise.apigee.com/v1/organizations/' + ORG + '/developers/' + devEmail + '/apps',
      params: {
        format: 'json'
      },
      data: payload
    }).catch(function (error) {
      if (error.response) {
        logger.error(figures('✖ ') + 'Error when creating Developer App, find more details below:')
        logger.error('HTTP ' + error.response.status + ' | ' + JSON.stringify(error.response.data))
        // if(error.response.data.code == 'known_error_code'){
        //   logger.info(figures('▶ ') + 'Tip: <some tip ...>')
        // }
        process.exit()
      }
    })
    return results;
  },

  reloadDeveloperBalance: async (payload, devId) => {
    const results = await axios({
      method: 'post',
      url: 'https://api.enterprise.apigee.com/v1/mint/organizations/' + ORG + '/developers/' + devId + '/developer-balances',
      params: {
        format: 'json'
      },
      data: payload
    }).catch(function (error) {
      if (error.response) {
        logger.error(figures('✖ ') + 'Error when adding developer balance, find more details below:')
        logger.error('HTTP ' + error.response.status + ' | ' + JSON.stringify(error.response.data))
        // if(error.response.data.code == 'known_error_code'){
        //   logger.info(figures('▶ ') + 'Tip: <some tip ...>')
        // }
        process.exit()
      }
    })
    return results;
  },

  purchaseRatePlan: async (payload, devId) => {
    const results = await axios({
      method: 'post',
      url: 'https://api.enterprise.apigee.com/v1/mint/organizations/' + ORG + '/developers/' + devId + '/developer-rateplans',
      params: {
        format: 'json'
      },
      data: payload
    }).catch(function (error) {
      if (error.response) {
        logger.error(figures('✖ ') + 'Error when purchasing rate plan, find more details below:')
        logger.error('HTTP ' + error.response.status + ' | ' + JSON.stringify(error.response.data))
        // if(error.response.data.code == 'known_error_code'){
        //   logger.info(figures('▶ ') + 'Tip: <some tip ...>')
        // }
        process.exit()
      }
    })
    return results;
  },

  issueCredit: async (packageId, ratePlanId, developerId, currencyId, creditAmount, creditDescription) => {
    const results = await axios({
      method: 'post',
      url: 'https://api.enterprise.apigee.com/v1/mint/organizations/' + ORG + '/monetization-packages/' + packageId + '/rate-plans/' + ratePlanId + '/real-currency-credit-transactions?currencyId=' +
        currencyId + '&developerId=' + developerId + '&transactionAmount=' + creditAmount + '&transactionNote=' + creditDescription,
      params: {
        format: 'json'
      }
    }).catch(function (error) {
      if (error.response) {
        logger.error(figures('✖ ') + 'Error when issuing credit, find more details below:')
        logger.error('HTTP ' + error.response.status + ' | ' + JSON.stringify(error.response.data))
        // if(error.response.data.code == 'known_error_code'){
        //   logger.info(figures('▶ ') + 'Tip: <some tip ...>')
        // }
        process.exit()
      }
    })
    return results;
  },

  // addPrepaidBalance: async (developerId) => {
  //   const results = await axios({
  //     method: 'post',
  //     url: 'https://api.enterprise.apigee.com/v1/mint/organizations/' + ORG + '/developers/' + developerId + '/developer-balances',
  //     params: {
  //       format: 'json'
  //     }
  //   }).catch(function (error) {
  //     if (error.response) {
  //       logger.error(figures('✖ ') + 'Error when issuing credit, find more details below:')
  //       logger.error('HTTP ' + error.response.status + ' | ' + JSON.stringify(error.response.data))
  //       // if(error.response.data.code == 'known_error_code'){
  //       //   logger.info(figures('▶ ') + 'Tip: <some tip ...>')
  //       // }
  //       process.exit()
  //     }
  //   })
  //   return results;
  // },

  setCredentialsAndOrg: (args) => {
    logger.debug('Setting credentials and org now ...');
    //first look at env vars as declarations in command have precedence
    UNAME = process.env.APIGEE_USERNAME;
    PASS = process.env.APIGEE_PASSWORD;
    ORG = process.env.APIGEE_ORGANIZATION;
    var requiredVarsFoundInEnv = false;
    if (UNAME && PASS && ORG) {
      requiredVarsFoundInEnv = true;
      logger.debug('username, password and organization name found as environment variables');
      logger.debug('taken from env vars: ' + ' ' + UNAME + ' ********** ' + ORG);
    }
    var UNAME_cmd = (args.u) ? args.u : args.username;
    var PASS_cmd = (args.p) ? args.p : args.password;
    var ORG_cmd = (args.o) ? args.o : args.organization;
    if (!UNAME_cmd && !PASS_cmd && !ORG_cmd) {
      if (requiredVarsFoundInEnv) {
        logger.debug('args not found in command, taking environment variables');
        setRequestDefaults();
        return [UNAME, PASS, ORG];
      } else {
        logger.error('required args (u (user),p (password),o (organization)) not found in command, quitting');
        return false;
      }
    } else {
      logger.debug('args found in command, thus overwriting environment variables');
      UNAME = UNAME_cmd;
      PASS = PASS_cmd;
      ORG = ORG_cmd;
      logger.debug('taken from args: ' + ' ' + UNAME + ' ********** ' + ORG);
      setRequestDefaults();
      return [UNAME, PASS, ORG];
      return true;
    }
  },

  setLogger: (currentLogger) => {
    logger = currentLogger;
    return [UNAME, PASS, ORG];;
  },


  ///// all for do.js below

  listResources: async (resource) => {
    var url;
    if (resource == 'productbundle') {
      url = 'https://api.enterprise.apigee.com/v1/mint/organizations/' + ORG + '/monetization-packages'
    } else if (resource == 'rateplan') {
      url = 'https://api.enterprise.apigee.com/v1/mint/organizations/' + ORG + '/rate-plans'
    } else if (resource == 'apiproduct') {
      url = 'https://api.enterprise.apigee.com/v1/organizations/' + ORG + '/apiproducts'
    } else if (resource == 'apiproxy') {
      url = 'https://api.enterprise.apigee.com/v1/organizations/' + ORG + '/apis'
    } else if (resource == 'developer') {
      url = 'https://api.enterprise.apigee.com/v1/organizations/' + ORG + '/developers'
    } else if (resource == 'company') {
      url = 'https://api.enterprise.apigee.com/v1/organizations/' + ORG + '/companies'
    }
    const results = await axios({
      method: 'get',
      url: url,
      params: {
        format: 'json'
      }
    })
    return results;
  },

  findResource: async (resource, id) => {
    var url
    if (resource == 'devId-byDevEmail' || resource == 'apps-byDevEmail' || resource == 'apps-byDevId') {
      url = 'https://api.enterprise.apigee.com/v1/organizations/' + ORG + '/developers/' + id
    } else if (resource == 'apiPackages-byDevId-activeOnly') {
      url = 'https://api.enterprise.apigee.com/v1/mint/organizations/' + ORG + '/developers/' + id +
        '/monetization-packages?allAvailable=false&current=true'
    } else if (resource == 'apiPackages-byDevId-includeExpired') {
      url = 'https://api.enterprise.apigee.com/v1/mint/organizations/' + ORG + '/developers/' + id +
        '/monetization-packages?allAvailable=false&current=false'
    } else if (resource == 'acceptedRatePlan-byDevId') {
      url = 'https://api.enterprise.apigee.com/v1/mint/organizations/' + ORG + '/developers/' + id +
        '/developer-accepted-rateplans?all=true'
    }
    const results = await axios({
      method: 'get',
      url: url,
      params: {
        format: 'json'
      }
    })
    return results;
  },

  getResource: async (resource, id, id2) => {
    var url
    if (resource == 'developerRatePlan') {
      url = 'https://api.enterprise.apigee.com/v1/mint/organizations/' + ORG + '/developers/' + id +
        '/developer-rateplans/' + id2
    }
    const results = await axios({
      method: 'get',
      url: url,
      params: {
        format: 'json'
      }
    })
    return results;
  },

  deleteResource: async (resource, id) => {
    var url;
    if (resource == 'productbundle') {
      url = 'https://api.enterprise.apigee.com/v1/mint/organizations/' + ORG + '/monetization-packages/' + id
    } else if (resource == 'rateplan') {
      url = 'https://api.enterprise.apigee.com/v1/mint/organizations/' + ORG + '/rate-plans/' + id
    } else if (resource == 'apiproduct') {
      url = 'https://api.enterprise.apigee.com/v1/organizations/' + ORG + '/apiproducts/' + id
    } else if (resource == 'apiproxy') {
      url = 'https://api.enterprise.apigee.com/v1/organizations/' + ORG + '/apis/' + id
    }
    const results = await axios({
      method: 'delete',
      url: url,
      params: {
        format: 'json'
      }
    })
    return results;
  },


}


function setRequestDefaults() {
  AUTH_TOKEN = 'Basic ' + Buffer.from(UNAME + ':' + PASS).toString('base64');
  axios.defaults.headers.common['Authorization'] = AUTH_TOKEN;
  axios.defaults.headers.post['Content-Type'] = 'application/json';
  logger.debug('default auth header successfully set');
}