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

//--organization -o (required) The name of the organization to deploy to. May be set as an environment variable APIGEE_ORGANIZATION.
//--password -p (required) Your Apigee account password. May be set as an environment variable APIGEE_PASSWORD.
//--username -u (required) Your Apigee account username. May be set as an environment variable APIGEE_USERNAME.
// log level as LOG_LEVEL env variable, defaults to info (-v as verbose)

module.exports = (args) => {
    //console.log('today is sunny - JK, we're in london)
}

module.exports = async (args) => {
    const spinner = ora().start()
    try {

      if(apicaller.setCredentialsAndOrg(args)){
        // Step 1 - get Org data and check if features.isMintOrgDataDeletionAllowed = true
        const response = await apicaller.getOrgData()
        logger.debug('response status is ' + response.status)
        logger.debug('response is:')
        logger.debug(JSON.stringify(response.data, null, '\t'))
        if(response.status != 200){
          logger.error('call to obtain org details failed with status code ' + response.status)
          return;
        }
        var data = response.data
        var mintDeletionAllowedIsInPayload = false
        var needsOrgUpdate = false
        var newData = data
        for (var iter in data.properties.property){
          var p = data.properties.property[iter]
          if(p.name == 'features.isMintOrgDataDeletionAllowed'){
            logger.debug('iteration ' + iter + ' ' + JSON.stringify(p))
            mintDeletionAllowedIsInPayload = true
            if(p.value == 'false'){
              newData.properties.property[iter].value = 'true'
              needsOrgUpdate = true
            }
          }
        }
        logger.debug('mintDeletionAllowedIsInPayload = ' + mintDeletionAllowedIsInPayload)
        if(!mintDeletionAllowedIsInPayload){
          needsOrgUpdate = true
          newData.properties.property.push({
              "name": "features.isMintOrgDataDeletionAllowed",
              "value": "true"
            })
        }
        // remove unnecessary attributes
        delete newData['type']
        delete newData['lastModifiedBy']
        delete newData['lastModifiedAt']
        delete newData['environments']
        delete newData['displayName']
        delete newData['createdBy']
        delete newData['createdAt']

        logger.debug('new data object:')
        logger.debug(JSON.stringify(newData, null, '\t'))

        // Step 2 - if features.isMintOrgDataDeletionAllowed = false or not found, add this to payload and submit changes
        if(needsOrgUpdate){
          const response2 = await apicaller.updateOrgData(newData)
          var status = response2.status
          logger.debug('response status is ' + response2.status)
          logger.debug('response is:')
          logger.debug(JSON.stringify(response2.data, null, '\t'))
          if(response2.status != 200){
            logger.error('call to update org details failed with status code ' + status)
            return;
          }
        }
       
        // Step 3 - delete m10n data by hitting /delete-org-data
        const response3 = await apicaller.deleteAllM10nData()
        var status = response3.status
        logger.debug('response status is ' + response3.status)
        logger.debug('response is:')
        logger.debug(JSON.stringify(response3.data, null, '\t'))
        if(response3.status != 200){
          logger.error('call to kick off m10n data removal failed with status code ' + response3.status)
          return;
        }

        logger.info('Deletion has been successfully triggered (Job ID: ' + response3.data.id + ', Status: ' + response3.data.status + ')')

        spinner.stop()
      }else{
        logger.error('credentials not found (set them either as arguments or environment variables)')
        process.exit()
      }
    } catch (err) {
      spinner.stop()
      logger.error(err)
    }

  }


