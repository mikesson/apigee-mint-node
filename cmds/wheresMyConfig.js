// Copyright 2019 Google LLC

// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at

//     https://www.apache.org/licenses/LICENSE-2.0

// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

const ora = require('ora')
const apicaller = require('../utils/apicaller')
const figures = require('figures')
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
    console.log(' ')
    console.log('Determining the directory being used to retrieve the config files ...')
    console.log(' ')
    var CONFIGDIR = 'config'
    var dirInEnvVar = (process.env.DIR_CONFIG) ? process.env.DIR_CONFIG : false
    if (!dirInEnvVar) {
      console.log('DIR_CONFIG parameter not found as environment variable, thus currently defaulting to:')
      console.log(process.cwd() + '/' + CONFIGDIR)
      console.log('(your current working directory + default "/config" directory)')
      console.log(' ')
      logger.info(figures('ℹ ') + 'Suggestion: Make a copy of the original /config directory and export its path as follows:')
      logger.info('export DIR_CONFIG="<custom-config-dir>" (both relative and absolute paths work)')
      console.log(' ')
    } else {
      CONFIGDIR = dirInEnvVar
      console.log('Nice one, the config directory is stored as an environment variable:')
      console.log('$DIR_CONFIG="' + CONFIGDIR + '"')
      if (path.isAbsolute(CONFIGDIR)) {
        console.log('Path is absolute, resulting in the following target directory:')
        console.log(CONFIGDIR)
      } else {
        console.log('Path is relative, resulting in the following target directory:')
        console.log(process.cwd() + '/' + CONFIGDIR)
      }
    }
    console.log(' ')
    process.exit()
  } catch (err) {
    spinner.stop()
    logger.error(err)
    process.exit()
  }
}