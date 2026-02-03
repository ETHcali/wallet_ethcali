> ## Documentation Index
> Fetch the complete documentation index at: https://docs.li.fi/llms.txt
> Use this file to discover all available pages before exploring further.

# OpenAPI Specification

> Download the LI.FI API OpenAPI specification for integration with AI agents, SDKs, and tools

## LI.FI OpenAPI Specification

The LI.FI API follows the OpenAPI 3.0 specification. You can use this spec to:

* Generate client SDKs in any language
* Import into API testing tools (Postman, Insomnia, etc.)
* Integrate with AI agents and LLM tools
* Build automated documentation

## Download

<Card title="OpenAPI YAML" icon="file-code" href="https://github.com/lifinance/public-docs/blob/main/openapi.yaml">
  Download the OpenAPI specification
</Card>

## API Base URLs

| Environment | Base URL                   |
| ----------- | -------------------------- |
| Production  | `https://li.quest`         |
| Staging     | `https://staging.li.quest` |

## Quick Links

* [API Introduction](/api-reference/introduction) - Get started with the LI.FI API
* [Authentication](/api-reference/authentication) - Learn about API keys and rate limits
* [Get a Quote](/api-reference/get-a-quote-for-a-token-transfer) - Request a cross-chain swap quote

## For AI Agents

AI agents can discover this API through:

```
https://docs.li.fi/.well-known/ai-plugin.json
```

This provides a standard discovery format compatible with most AI platforms.

## Specification Details

* **OpenAPI Version**: 3.0.2
* **API Version**: 1.0.0
* **Endpoints**: 28+ paths covering quotes, routes, tokens, chains, and more
