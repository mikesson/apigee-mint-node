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


const chalk = require('chalk')
const figlet = require('figlet')

const menus = {
    main: `
      apigee-mint [command] <options>

      version .............. shows package version
      kickstart ............ initializes an org with a ready-to-use monetization configuration
      wheresMyConfig ....... returns the current directory of the kickstart config files  
      do ................... operate with Monetization entities (get, list, find, delete)
      cleanup .............. cleans up Monetization data for an org
      \n`

  }
  
  module.exports = (args) => {
    const subCmd = args._[0] === 'help'
      ? args._[1]
      : args._[0]
    console.log(
        chalk.green(
            figlet.textSync("apigee-mint", {
                font: "Univers",
                horizontalLayout: "default",
                verticalLayout: "default"
            })
        )
    );
    console.log(menus[subCmd] || menus.main)
  }