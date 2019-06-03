# Mint - Apigee Monetization Node.js tool

This tool allows you to interact with Apigee Monetization settings and entities through automated scripts and YML config files.


#Installation



# Sample commands

./bin/mint kickstart-dev --env test --logLevel silly

// do actions
./bin/mint do -a list -r productbundle --logLevel info
./bin/mint do -a list -r rateplans

// kickstart setup 
./bin/mint kickstart-dev -e test -l info -c true