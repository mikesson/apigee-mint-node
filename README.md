# Mint Node - Apigee Monetization tool

This tool allows you to interact with Apigee Monetization settings and entities through automated scripts and YML config files.


# Installation

clone this repo to your local directory
cd into it
run ./bin/mint (+ args)

(available via npm in the future)


# About

An Apigee Edge account is required to perform any actions with mint-node. Also, the Monetization components needs to be enabled and configured.

You need to be familiar with basic concepts and features of Apigee Edge such as API Proxies, API Products and environments. For more information, refer to the [Apigee Edge Docs](http://docs.apigee.com).

You should be aware of the [Monetization concepts](https://docs.apigee.com/api-platform/monetization/basics-monetization) within Apigee Edge. 



# Common Parameters

--username -u (required) Your Apigee account username. May be set as an environment variable APIGEE_USERNAME.
--password -p (required) Your Apigee account password. May be set as an environment variable APIGEE_PASSWORD.
--organization -o (required) The name of the organization to deploy to. May be set as an environment variable APIGEE_ORGANIZATION.



# Commands


# Sample commands

./bin/mint kickstart-dev --env test --logLevel silly

// do actions
./bin/mint do -a list -r productbundle --logLevel info
./bin/mint do -a list -r rateplans

// kickstart setup 
./bin/mint kickstart-dev -e test -l info -c true
