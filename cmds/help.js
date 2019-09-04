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
                font: "univers",
                horizontalLayout: "default",
                verticalLayout: "default"
            })
        )
    );
    //console.log('Welcome to the M10n CLI')

    console.log(menus[subCmd] || menus.main)
  }