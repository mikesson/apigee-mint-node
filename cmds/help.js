const chalk = require('chalk')
const figlet = require('figlet')

const menus = {
    main: `
      m10n-cli [command] <options>
  
      version .............. show package version
      cleanup .............. cleans up m10n data in an org
      init-demo ............ initializes an org with ready-to-demo m10n configurations
      \n`,
  
    cleanup: `
      m10n-cli cleanup <options>
  
      --something, -sth ..... something to do which is to be done
      \n`,
  }
  
  module.exports = (args) => {
    const subCmd = args._[0] === 'help'
      ? args._[1]
      : args._[0]
  

    console.log(
        chalk.green(
            figlet.textSync("M10n CLI", {
                font: "univers",
                horizontalLayout: "default",
                verticalLayout: "default"
            })
        )
    );
    //console.log('Welcome to the M10n CLI')

    console.log(menus[subCmd] || menus.main)
  }