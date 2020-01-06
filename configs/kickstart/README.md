# Kickstart templates

This directory contains templates with different types of API monetization configurations.
Having multiple templates available helps you discover the different monetization options and charging models.

Here's the list of templates with its corresponding directory:

## Default (API calls with volume band)

Location: `/configs/kickstart/default`

### Configuration

- Setup fee
- Volume-banded rate card
- Charge based on: API calls

```
        0 -     100 : 0.05
      100 -   10000 : 0.025
    10000 - 1000000 : 0.0125
```

## Credits-based rate plan (custom attribute counter) 

Location: `/configs/kickstart/extensions/custom-credits-plan`

### Configuration

- Freemium, first 5 Credits for free
- Flat-rate
- Charge based on: Credits (custom attribute read from API response)

### Details

This template shows how a custom attribute can be used to charge for API use. As part of this example, the attribute is included in the request query parameter and mirrored in the backend response. The value is then deducted from the overall entitlement.

Request
<pre>
GET https://demo8-test.apigee.net/mint/kickstart/credits/v1/anything?apikey=<apikey><b>&credit-charge=50</b>
</pre>

Response

<pre>
{
  "args": {
    "credit-charge": "50" # <b><-- used as custom attribute</b>
  },
  ...
  },
  ...
}
</pre>

Other examples of custom attributes:
* message size
* number of returned objects in array
* time-restricted access to entities

