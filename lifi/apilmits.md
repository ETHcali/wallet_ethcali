> ## Documentation Index
> Fetch the complete documentation index at: https://docs.li.fi/llms.txt
> Use this file to discover all available pages before exploring further.

# Rate Limits and API Authentication

To mitigate misuse and manage capacity on our API, we have implemented limits on LI.FI API usage.

Rate limits apply to requests made using your `x-lifi-api-key` and are calculated per API key across all endpoints. These limits help prevent abuse and ensure a smooth experience for everyone.

# Current Rate Limits

The default rate limits for production usage are as follows:

### Unauthenticated

| Endpoint Scope                                                                                                        | Rate Limit                 |
| --------------------------------------------------------------------------------------------------------------------- | -------------------------- |
| <Tooltip tip="Consists of /quote, /advanced/routes, and /stepTransaction endpoints">Quote related endpoints</Tooltip> | 200 requests per two hours |
| Rest of endpoints                                                                                                     | 200 requests per two hours |

### Authenticated

| Endpoint Scope                                                                                                        | Rate Limit              |
| --------------------------------------------------------------------------------------------------------------------- | ----------------------- |
| <Tooltip tip="Consists of /quote, /advanced/routes, and /stepTransaction endpoints">Quote related endpoints</Tooltip> | 200 requests per minute |
| Rest of endpoints                                                                                                     | 200 requests per minute |

<Note> Rate limits are enforced on a two hour window to account for traffic spikes </Note>

> 🔒 Higher limits may be available for enterprise clients. Please see our [Plans page](https://li.fi/plans/) for more details.

# Handling Rate Limits

Every response includes your current rate limit in the headers. Keep in mind that limits can differ depending on the endpoint.

In the Partner Portal, you’ll see your requests-per-minute (RPM) limit. To give you flexibility during spikes, we don’t enforce it minute by minute. Instead, we multiply your RPM by 120 and apply it as a two-hour rolling window.

👉 Example: If your limit is 100 RPM, that means you can make up to 12,000 requests within any two-hour window — either all at once or spread out however you like.

### Rate Limit Information In Request Response

`ratelimit-reset`: in how many seconds will the rate limit reset (2 hours equal 7200)

`ratelimit-limit`: the total limit for the period of 2 hours

`ratelimit-remaining`: how much of the limit is still left until the reset

Here's how you can calculate your average RPM:

`(ratelimit-limit - ratelimit-remaining) / ((7200 - ratelimit-reset) / 60)`

If you exceed your rate limits, you'll receive a `429 Too Many Requests` HTTP response. When this occurs:

* You will get an error message showing when the rate limit will be lifted (e.g., 5 hours)
* Request higher rate limit

# Best Practices

To avoid hitting rate limits:

* Cache results from `GET /tokens`, `GET /chains`, and static endpoints
* Avoid polling frequently for the same data
* Batch or debounce user input that triggers API calls

# Abuse Prevention

To prevent abuse, LI.FI may temporarily block keys that:

* Consistently exceed rate limits
* Attempt to bypass limits through multiple keys or IPs
* Cause performance degradation to the service

# Using the API key

<Note>All LI.FI APIs do not require API key. API key is only needed for higher rate limits</Note>

Authentication to LI.FI's API is performed via the custom HTTP header `x-lifi-api-key` with an API key. If you are using the Client SDK, you will set the API when [creating a config](/sdk/configure-sdk), and then the SDK will send the header on your behalf with every request. If integrating directly with the API, you’ll need to send this header yourself like so:

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

# Need Higher Limits?

If you're building a high-volume integration or a production-grade product, we’re happy to support your scaling needs.

Please see our [Plans page](https://li.fi/plans/) for more details.
