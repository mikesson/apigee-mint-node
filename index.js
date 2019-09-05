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
        case 'kickstart':
            require('./cmds/kickstart.js')(args)
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
        case 'wheresMyConfig':
            require('./cmds/wheresMyConfig.js')(args)
            break
        case 'cleanup':
            require('./cmds/cleanup.js')(args)
            break
        default:
            console.error(`"${cmd}" is not a valid command`)
            break
    }
}