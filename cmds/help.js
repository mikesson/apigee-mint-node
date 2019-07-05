const chalk = require('chalk')
const figlet = require('figlet')

const menus = {
    main: `
      apigee-mint [command] <options>

      version .............. shows package version
      kickstart ............ initializes an org with ready-to-demo monetization configurations
      do .............. retrieves or removes monetization entities
      \n`
  
    // cleanup: `
    //   apigee-mint cleanup <options>
  
    //   --something, -sth ..... something to do which is to be done
    //   \n`,
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