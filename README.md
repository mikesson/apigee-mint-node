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

The parameters below are used across all operations. For more specific parameters, please refer to the commands list below.

|Parameter      | Description   | Env. Variable | Required?
|---------------| --------------| --------------|------------|
| `--username -u` | Your Apigee account username | `APIGEE_USERNAME` | Yes |
| `--password -p` | Your Apigee account password | `APIGEE_PASSWORD` | Yes |
| `--organization -o` | The name of the organization to operate on| `APIGEE_ORGANIZATION` | Yes |
| `--logLevel -l` | Log level, defaults to `info` if not specified | `LOG_LEVEL` | Optional |


# Commands


## kickstart

Deploys a chain of entities for a read-to-use sample configuration. This command makes use of the `/config` directory where all YML files reside.
If you are familiar with the monetization settings, you can edit all configuration files.

### Examples

Executes kickstart configuration for specified organization and environment, considering existing settings ([What does that mean?](#Parameters))
```./mint kickstart -u user@domain.com -o my-nonprod -e test -l info -c true```

Executes kickstart configuration for specified organization and environment, overwriting/ignoring existing settings 
```./mint kickstart -u user@domain.com -o my-nonprod -e test -l info -c false```


### Parameters

## ```--considerExistingSettings -c```




### Details



## do

Performs common CRUD operations on Monetization resources such as
-- listing entity IDS
-- removing entities

### Examples

```./mint do -a list -r productbundle -l info```
```./mint do -a delete -r productbundle -i <id_of_bundle> -l info```

### Parameters



### Details


# Sample commands

// do actions
./bin/mint do -a list -r productbundle --logLevel info
./bin/mint do -a list -r rateplans

