const minimist = require('minimist')

module.exports = () => {
    const args = minimist(process.argv.slice(2))
    let cmd = args._[0] || 'help'
    if (args.version || args.v) {
        cmd = 'version'
    }
    if (args.help || args.h) {
        cmd = 'help'
    }

    switch (cmd) {
        case 'cleanup':
            require('./cmds/cleanup.js')(args)
            break
        case 'verify-config':
            require('./cmds/verifyConfig.js')(args)
            break
        case 'scaffold':
            require('./cmds/scaffold.js')(args)
            break
        case 'kickstart':
            require('./cmds/kickstart.js')(args)
            break
        case 'kickstart-dev':
            require('./cmds/kickstart-dev.js')(args)
            break
        case 'do':
            require('./cmds/do.js')(args)
            break
        case 'version':
            require('./cmds/version.js')(args)
            break
        case 'help':
            require('./cmds/help.js')(args)
            break
        default:
            console.error(`"${cmd}" is not a valid command!`)
            break
    }
}