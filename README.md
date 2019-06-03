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

Deploys a chain of entities for a ready-to-use sample configuration. This command makes use of the `/config` directory where all YML files reside.
If you are familiar with the monetization settings, you can edit all configuration files.

### Examples

Executes kickstart configuration for specified organization and environment, considering existing settings ([What does that mean?](#Parameters))

```./mint kickstart -u user@domain.com -o my-nonprod -e test -l info -c true```

Executes kickstart configuration for specified organization and environment, overwriting/ignoring existing settings 

```./mint kickstart -u user@domain.com -o my-nonprod -e test -l info -c false```


### Parameters

**```--considerExistingSettings -c```**

(optional, `true/false`, default: `true`)
As the kickstart command modifies a range of settings from the _organization profile_ over to _currencies_ and _T&Cs_, you can choose to (a) overwrite all settings or (b) keep them and add the proxy, product and bundle to your existing configuration.

Choose `false` if you run this command on a clean/empty environment, choose `true` if you have already run this command before or if you would like to keep your existing org settings. **Please be aware** that config file changes might be necessary in order for the kickstart setup to work (e.g. clash of supported currencies).

### Details

_TBD - detailed configuration sequence explained_

## do

Performs common CRUD operations on Monetization resources such as
-- listing entity IDS
-- removing entities

### Examples

First, list the resources (returns IDs)

```./mint do -a list -r productbundle -l info```

Second, delete the chosen resource by specifying its ID

```./mint do -a delete -r productbundle -i <id_of_bundle> -l info```

### Parameters

***```--action -a```***

(required, `list/delete`, default: `N/A`)
The action you want to perform.

***```--resource -r```***

(required, `apiproxy/apiproduct/productbundle/rateplan`, default: `N/A`)
The resource type you want to perform the action on.

***```--id -i```***

(required, `<id of a specific resource>`, default: `N/A`)
The ID of a specified resource you want to perform the action on.


### Details


