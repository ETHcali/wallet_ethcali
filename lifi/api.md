> ## Documentation Index
> Fetch the complete documentation index at: https://docs.li.fi/llms.txt
> Use this file to discover all available pages before exploring further.

# Overview

> Fundamentals of LI.FI`s API.

## Base URL

LI.FI’s API is built on REST principles and is served over HTTPS.

The Base URL for all API endpoints is:

```javascript  theme={"system"}
https://li.quest/v1
```

## Authentication

<Note>All LI.FI APIs do not require API key. API key is only needed for higher rate limits</Note>

Authentication to LI.FI's API is performed via the custom HTTP header `x-lifi-api-key` with an API key. If you are using the Client SDK, you will set the API when constructing a client, and then the SDK will send the header on your behalf with every request. If integrating directly with the API, you’ll need to send this header yourself like so:

```curl  theme={"system"}
curl --location 'https://li.quest/v1/quote?fromChain=100&fromAmount=1000000&fromToken=0x4ecaba5870353805a9f068101a40e0f32ed605c6&fromAddress=0x552008c0f6870c2f77e5cC1d2eb9bdff03e30Ea0&toChain=137&toToken=0x2791bca1f2de4661ed88a30c99a7a9449aa84174&slippage=0.03' \
--header 'x-lifi-api-key: YOUR_CUSTOM_KEY'
```

API key can be tested using the following endpoint:

```javascript  theme={"system"}
curl --location 'https://li.quest/v1/keys/test' 
--header 'x-lifi-api-key: YOUR_CUSTOM_KEY'
```

<Note> Never expose your `x-lifi-api-key` in client-side environments such as browser-based JavaScript or direct Widget integrations. Using the API key on the client side can lead to unauthorized usage or abuse of your key, as it becomes publicly accessible in the browser's developer tools or network tab.
If you're using the LI.FI Widget, you **do not need to pass an API key**. The Widget operates securely without requiring a key in the frontend. For server-side integrations (e.g. SDK or API requests from your backend), always keep your key secret and secure. </Note>

## Rate Limit

Rate limit is counted per IP without API key and per API Key with authenticated requests.

Please refer to [Rate limits and API authentication](/api-reference/rate-limits) page.

## Error Message

Errors consist of three parts:

1. HTTP error code
2. LI.FI error code
3. Error message

Specific error codes and messages are defined on [Error Codes](/api-reference/error-codes) page
