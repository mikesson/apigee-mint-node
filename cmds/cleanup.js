/**
  Copyright 2019 Google LLC

  Licensed under the Apache License, Version 2.0 (the "License");
  you may not use this file except in compliance with the License.
  You may obtain a copy of the License at

      https://www.apache.org/licenses/LICENSE-2.0

  Unless required by applicable law or agreed to in writing, software
  distributed under the License is distributed on an "AS IS" BASIS,
  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  See the License for the specific language governing permissions and
  limitations under the License.

*/

const ora = require('ora')
const apicaller = require('../utils/apicaller')
const winston = require('winston')
var sleep = require('sleep')
const figures = require('figures')
var sleep = require('sleep')


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


module.exports = async (args) => {
  const spinner = ora().start()
  try {
    apicaller.setCredentialsAndOrg(args)
    const response = await apicaller.getOrgData()
    logger.debug('response status is ' + response.status)
    logger.debug('response is:')
    logger.debug(JSON.stringify(response.data, null, '\t'))
    if (response.status != 200) {
      logger.error('call to obtain org details failed with status code ' + response.status)
      return;
    }
    var data = response.data
    var mintDeletionAllowedIsInPayload = false
    var needsOrgUpdate = false
    var newData = data
    for (var iter in data.properties.property) {
      var p = data.properties.property[iter]
      if (p.name == 'features.isMintOrgDataDeletionAllowed') {
        logger.debug('iteration ' + iter + ' ' + JSON.stringify(p))
        mintDeletionAllowedIsInPayload = true
        if (p.value == 'false') {
          newData.properties.property[iter].value = 'true'
          needsOrgUpdate = true
        }
      }
    }
    logger.debug('mintDeletionAllowedIsInPayload = ' + mintDeletionAllowedIsInPayload)
    if (!mintDeletionAllowedIsInPayload) {
      needsOrgUpdate = true
      newData.properties.property.push({
        "name": "features.isMintOrgDataDeletionAllowed",
        "value": "true"
      })
    }
    delete newData['type']
    delete newData['lastModifiedBy']
    delete newData['lastModifiedAt']
    delete newData['environments']
    delete newData['displayName']
    delete newData['createdBy']
    delete newData['createdAt']

    logger.debug('new data object:')
    logger.debug(JSON.stringify(newData, null, '\t'))

    if (needsOrgUpdate) {
      const response2 = await apicaller.updateOrgData(newData)
      var status = response2.status
      logger.debug('response status is ' + response2.status)
      logger.debug('response is:')
      logger.debug(JSON.stringify(response2.data, null, '\t'))
      if (response2.status != 200) {
        logger.error('call to update org details failed with status code ' + status)
        return;
      }
    }

    const response3 = await apicaller.deleteAllM10nData()
    var status = response3.status
    logger.debug('response status is ' + response3.status)
    logger.debug('response is:')
    logger.debug(JSON.stringify(response3.data, null, '\t'))
    if (response3.status != 200) {
      logger.error('Call to kick off Monetization data removal failed with status code ' + response3.status)
      return;
    }

    logger.info('Deletion has been successfully triggered (Job ID: ' + response3.data.id + ', Status: ' + response3.data.status + ')')
    logger.info('If you\'re running Apigee OPDK, you can also check the job status by hitting')
    logger.info('GET https://<yourdomain>.com/v1/mint/asyncjobs/' + response3.data.id)

    logger.info('Waiting for 1 minute allowing the cleanup to conclude ...')
    sleep.sleep(60)
    logger.info('Now syncing up Monetization with the org data (may take a few minutes)...')
    const response4 = await apicaller.syncUpMintData()
    var status = response4.status
    logger.debug('response status is ' + response4.status)
    logger.debug('response is:')
    logger.debug(JSON.stringify(response4.data, null, '\t'))
    if (response4.status != 200) {
      logger.error('call to sync up Monetization data failed with status code ' + response3.status)
      return;
    }
    logger.info('Synchronization job finished')
    logger.info('|==========================================|')
    logger.info('| ' + figures('★ ') + 'Monetization Cleanup Complete! |')
    logger.info('|==========================================|')
    console.log('')
    logger.info('Please check back to the Edge UI as some entities might still persist.')
    console.log('')
    spinner.stop()
  } catch (err) {
    spinner.stop()
    logger.error(err)
  }

}


