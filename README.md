# Mint Node - Apigee Monetization tool

This tool allows you to interact with Apigee Monetization settings and entities through automated scripts and YML config files.


# Install & Prepare

clone this repo to your local directory
```
git clone git@github.com:mikesson/apigee-mint-node.git
```

change directory
```
cd apigee-mint-node
```


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

Deploys a chain of entities for a ready-to-use sample configuration. This command makes use of a config directory where all YML files reside.
Familiarize yourself with the Apigee Monetization concepts and entities before customizing the config files.

*Recommendation:* Keep the versioning tags in the entity names & IDs to increment in case of a failed execution.

### Examples

Executes kickstart configuration for specified organization and environment, considering existing settings ([What does that mean?](#Parameters))

```.bin/mint kickstart -u user@domain.com -o my-nonprod -e test -l info -c true```

Executes kickstart configuration for specified organization and environment, overwriting/ignoring existing settings 

```.bin/mint kickstart -u user@domain.com -o my-nonprod -e test -l info -c false```


### Parameters

**```--environment -e```**

(required, the name of the target environment)

Specify the environment name for the setup, e.g. dev/test/prod

**```--directory -d```**

(optional, the directory where the config files reside, default: `config`)

You can also store this in an environment variable:

```
export DIR_CONFIG="config-myorg"
```


**```--considerExistingSettings -c```**

(optional, `true/false`, default: `true`)

As the kickstart command modifies a range of settings from the _organization profile_ over to _currencies_ and _T&Cs_, you can choose to (a) overwrite all settings or (b) keep them and add the proxy, product and bundle to your existing configuration.

Choose `false` if you run this command on a clean/empty environment, choose `true` if you have already run this command before or if you would like to keep your existing org settings. **Please be aware** that config file changes might be necessary in order for the kickstart setup to work (e.g. clash of supported currencies and necessary changes to the organization profile).

In more detail, the `-c false` flag executes two additional steps:
1. Checks whether the currency specified in `1-orgProfile.yml` is already available. If `true`, no new currency is being added
2. Checks whether there are existing T&Cs which have not expired yet. If `true`, no new T&Cs are added.



### Steps

Follow these steps to run the kickstart setup

1. Create a copy of the config directory for your own setup, with e.g. the target org name as suffix

```
cp -r config config-{yourSuffix}
```

2. Set environment variables

```
export APIGEE_ORGANIZATION={orgName}
export APIGEE_USERNAME={username}
export APIGEE_PASSWORD={password}
export LOG_LEVEL=info
export DIR_CONFIG=config-{yourSuffix}
```

3. Prepare configuration files (Required)

- 3.1 Set start date of T&Cs (e.g. _today_ and _now + 1 hour_)

  `3-termsAndConditions.yml -> startDate`

- 3.2 Set start date of rate plan (e.g. _today_ 00:00:00)

  `8-ratePlan.yml -> startDate`

- 3.3 Set end date of rate plan (any date in the future)

  `8-ratePlan.yml -> endDate` 

4. Run the command

- `.bin/mint kickstart -e test -l info -c true`

For reference, this is how a successful kickstart execution looks like:

![successful kickstart execution](https://raw.githubusercontent.com/mikesson/apigee-mint-node/master/img/successful-kickstart.png)


### Customizations

You can use tour copied config directory to adjust all setup settings. Here's a list of common customizations, referencing the target file name and attribute: 

#### Set new API Proxy name:

`4-apiProductMint.yml -> proxies[0]`

#### Set new API Product Name:

`4-apiProductMint.yml -> name`

`4-apiProductMint.yml -> displayName`

The API Product name also appears in the following files, so change the name there, too:

`7-productBundle.yml -> product.id`

`10-developerApp.yml -> apiProducts[0]`

#### Set new default currency for organization:

`1-orgProfile.yml -> currency`

`2-currency.yml -> name`

As you change the currency code, you might want to change the display name and description, too:

`2-currency.yml -> description`

`2-currency.yml -> displayName`

#### Set new developer name and email

`9-developer.yml -> email`

`9-developer.yml -> firstName`

`9-developer.yml -> lastName`

As you change the currency code, you might want to change the display name and description, too:

`2-currency.yml -> description`

`2-currency.yml -> displayName`



### Configuration Reference

This section lists all available config files and a link to the full [Apigee Docs](https://docs.apigee.com) page

|File      | Description   |
|---------------| --------------|
| `1-orgProfile.yml` | [Docs Link](https://docs.apigee.com/api-platform/monetization/edit-organization-profile#api) |
| `2-currency.yml` | [Docs Link](https://docs.apigee.com/api-platform/monetization/manage-supported-currencies#api) |
| `3-termsAndConditions.yml` | [Docs Link](https://docs.apigee.com/api-platform/monetization/specify-terms-and-conditions#api) |
| `4-apiProductMint.yml` | [Docs Link]() |
| `5-transactionRecordingPaths.yml` | [Docs Link](https://docs.apigee.com/api-platform/monetization/create-transaction-recording-policy#createtrpapi) |
| `6-transactionRecordingPolicy.yml` | [Docs Link](https://docs.apigee.com/api-platform/monetization/create-transaction-recording-policy#createtrpapi) |
| `7-productBundle.yml` | [Docs Link](https://docs.apigee.com/api-platform/monetization/api-product-bundles#api) |
| `8-ratePlan.yml` | [Docs Link](https://docs.apigee.com/api-platform/monetization/create-rate-plans#api) |
| `9-developer.yml` | [Docs Link](https://docs.apigee.com/api-platform/publish/adding-developers-your-api-product#monetization-attributes) |
| `10-developerApp.yml` | [Docs Link](https://docs.apigee.com/api-platform/publish/using-edge-management-api-publish-apis#registeringdeveloperapps) |
| `11-purchaseRatePlan.yml` | [Docs Link](https://docs.apigee.com/api-platform/monetization/subscribe-published-rate-plan-using-api) |
| `12-reloadAccountBalance.yml` | [Docs Link](https://docs.apigee.com/api-platform/monetization/manage-prepaid-balances#getbalancesapi) |


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


### Supported resources and actions


|Resource      | Actions   | 
|---------------| --------------|
| `productbundle` | `list`, `delete` |
| `rateplan` | `list`, `delete` |
| `apiproxy` | `list`, `delete` |


# Known Issues


```
error: ✖ Error when adding developer balance, find more details below:
error: HTTP 400 | {"code":"mint.invalidTransaction","message":"Invalid transaction: Datastore Error","contexts":[],"cause":{"message":"Invalid transaction: Datastore Error","contexts":[]}}
```






#

This is not an official Google product