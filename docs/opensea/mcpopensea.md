MCP Overview

# MCP Overview

Connect your AI tools to OpenSea using the Model Context Protocol (MCP), an open standard that lets AI assistants interact with NFTs, tokens, and blockchain data across multiple chains.

### What is OpenSea MCP?

OpenSea MCP is a hosted server that gives AI tools secure access to blockchain data across NFTs, tokens, and wallets. Query real-time prices, swap tokens, analyze portfolios, and mint NFTs—all through natural language. It's designed to work seamlessly with popular AI assistants like ChatGPT, Cursor, Claude, and Chorus.

### Why use OpenSea MCP?

* **Easy setup** — Connect through a simple URL configuration
* **Real-time data** — Access live prices for NFTs, tokens, and cryptocurrencies
* **Comprehensive blockchain coverage** — Support for Ethereum, Polygon, Base, Solana and other major chains
* **Optimized for AI** — Built specifically for AI agents with efficient data formatting and natural language search

### What can you do with OpenSea MCP?

* **Analyze tokens and cryptocurrencies** — Look up ERC-20 tokens, meme coins, and get real-time price data
* **Swap tokens** — Get quotes and transaction data for token swaps across supported chains
* **Research NFT collections** — Get floor prices, volume data, and trending collections
* **Check wallet portfolios** — View complete holdings including NFTs, tokens, and balances for any address
* **Track market trends** — Identify trending tokens, NFT collections, and monitor trading activity
* **Mint NFTs from drops** — Get drop details, check eligibility, and generate mint transactions
* **Deploy NFT contracts** — Deploy new SeaDrop NFT contracts and track deployment status

<br />

## Getting Started

<Callout icon="🚧" theme="warn">
  To use OpenSea MCP, you need an OpenSea developer account. Here's how to get one:

  1. Sign in to <Anchor label="opensea.io" target="_blank" href="https://opensea.io">opensea.io</Anchor>
  2. Go to **<Anchor label="Settings → Developer" target="_blank" href="https://opensea.io/settings/developer">Settings → Developer</Anchor>**
  3. If you don't have a developer account, click **Get access** and fill out the request form
  4. Once approved, your MCP token will appear on this page
  5. Copy your MCP token and use it as the `ACCESS_TOKEN` in the configuration below
</Callout>

### Connect through your AI tool

To connect OpenSea MCP to your AI assistant, use one of these connection methods:

### Streamable HTTP (Recommended)

* URL: `https://mcp.opensea.io/mcp`
* JSON config:

```json
{
    "mcpServers": {
      "OpenSea": {
        "url": "https://mcp.opensea.io/mcp",
         "headers": {
           "Authorization": "Bearer ACCESS_TOKEN"
         }
      }
    }
}
```

If your client does not support custom headers, the access token can be provided in-line:

`https://mcp.opensea.io/ACCESS_TOKEN/mcp`

### SSE (Server-Sent Events)

* URL: [`https://mcp.opensea.io/sse`](https://opensea-mcp.example.com/sse)
* JSON config:

```json
{
    "mcpServers": {
      "OpenSea": {
        "url": "https://mcp.opensea.io/sse",
        "headers": {
          "Authorization": "Bearer ACCESS_TOKEN"
        }
      }
    }
}
```

If your client does not support custom headers, the access token can be provided in-line:

`https://mcp.opensea.io/ACCESS_TOKEN/sse`

### Quick Start Examples

Once connected, try these prompts to explore OpenSea MCP capabilities:

1. "What's the price of PEPE token on Ethereum?"
2. "Show me trending tokens on Base"
3. "Quote a swap of 1 ETH to USDC"
4. "Check the complete portfolio for wallet 0x123..."
5. "What's the floor price of Pudgy Penguins?"
6. "Find the top meme coins by trading volume"

### Sample Project

Prefer a working app? Try the Next.js + Vercel AI SDK starter preconfigured with OpenSea MCP:\
[https://github.com/ProjectOpenSea/opensea-mcp-next-sample](https://github.com/ProjectOpenSea/opensea-mcp-next-sample)

## Supported Tools

Now that you have installed the OpenSea MCP, let's explore how AI assistants can use OpenSea MCP tools to search, analyze, and interact with blockchain and marketplace data.

These tools work seamlessly together through prompts, and their real power comes from combining them. With a single prompt, you can search for collections, check token prices, analyze wallet holdings, and get swap quotes across multiple blockchains.

<Table align={["left","left","left"]}>
  <thead>
    <tr>
      <th>
        Name
      </th>

      <th>
        Description
      </th>

      <th>
        Sample prompts
      </th>
    </tr>
  </thead>

  <tbody>
    <tr>
      <td>
        **search**
      </td>

      <td>
        AI-powered search across OpenSea marketplace data. The AI agent analyzes your query and uses multiple GraphQL endpoints to find relevant results.
      </td>

      <td>
        "Find BONK token on Solana"\
        "Show me trending NFTs"\
        "Search for gaming NFT collections"\
        "Find Pudgy Penguins collection"
      </td>
    </tr>

    <tr>
      <td>
        **fetch**
      </td>

      <td>
        Retrieve full details of a specific OpenSea entity by its unique identifier with maximum data including activity, analytics, offers, and all other available information.
      </td>

      <td>
        "Get details for entity abc123"
      </td>
    </tr>

    <tr>
      <td>
        **search\_collections**
      </td>

      <td>
        Search for NFT collections by name, description, or metadata. Returns minimal information (slug + name) for context efficiency.
      </td>

      <td>
        "Search for Azuki collections"\
        "Find art NFT collections on Ethereum"
      </td>
    </tr>

    <tr>
      <td>
        **get\_collections**
      </td>

      <td>
        Retrieve detailed information about multiple NFT collections at once. Supports lightweight includes like `recent_sales`, `sample_items`, `top_holders`, `basic_stats`, and `attributes`.
      </td>

      <td>
        "Get details for boredapeyachtclub"\
        "Show me stats for cryptopunks with trading activity"\
        "What's the floor price of doodles-official?"
      </td>
    </tr>

    <tr>
      <td>
        **search\_items**
      </td>

      <td>
        Search for individual NFT items/tokens across OpenSea. Returns minimal information (id + name + collection) for context efficiency.
      </td>

      <td>
        "Find Bored Ape #1234"\
        "Search for rare traits in Azuki"\
        "Look for NFTs priced under 0.1 ETH"
      </td>
    </tr>

    <tr>
      <td>
        **get\_items**
      </td>

      <td>
        Retrieve detailed information about multiple NFT items at once. Supports includes like `recent_activity`, `active_offers`, and `ownership_info`.
      </td>

      <td>
        "Get details for BAYC token 5678"\
        "Show me CryptoPunk #100 with price history"\
        "Check the owner of this NFT at 0x123..."
      </td>
    </tr>

    <tr>
      <td>
        **search\_tokens**
      </td>

      <td>
        Search for cryptocurrencies and tokens by name or symbol, including ERC-20 tokens and meme coins. Returns minimal information (id + name + symbol) for context efficiency.
      </td>

      <td>
        "Find USDC token"\
        "Search for PEPE coin"\
        "Look up SHIB token address"
      </td>
    </tr>

    <tr>
      <td>
        **get\_tokens**
      </td>

      <td>
        Retrieve detailed information about multiple cryptocurrencies/tokens at once, including current prices.
      </td>

      <td>
        "Get info for USDT at 0xdac17f..."\
        "Show WETH token with price history"\
        "What's the contract for DAI?"
      </td>
    </tr>

    <tr>
      <td>
        **get\_token\_swap\_quote**
      </td>

      <td>
        Get a swap quote and blockchain actions needed to perform a token swap. Requires sufficient wallet balance to cover amount and gas fees.
      </td>

      <td>
        "Quote swap 1 ETH to USDC"\
        "How much WETH can I get for 1000 USDT?"\
        "Calculate gas for swapping tokens"
      </td>
    </tr>

    <tr>
      <td>
        **get\_token\_balances**
      </td>

      <td>
        Retrieve token balances for a specific wallet address with USD values and detailed currency metadata. Supports filtering by contracts and sorting by various metrics.
      </td>

      <td>
        "Check token balances for 0x123..."\
        "Show my wallet's token portfolio"
      </td>
    </tr>

    <tr>
      <td>
        **get\_nft\_balances**
      </td>

      <td>
        Retrieve all NFTs owned by a specific wallet address with metadata, collection details, current listings, and offers. Sortable by price, recency, or rarity.
      </td>

      <td>
        "Show NFTs owned by 0x789..."\
        "What NFTs does snoop.eth own?"\
        "Check my NFT collection"
      </td>
    </tr>

    <tr>
      <td>
        **get\_activity**
      </td>

      <td>
        Retrieve trading activity (sales, transfers, listings) for collections, items, profiles, or tokens. Supports pagination and timeframe filtering.
      </td>

      <td>
        "Show recent sales for Bored Apes"\
        "Get trading history for wallet 0x123..."\
        "Find all USDC transfer activity"
      </td>
    </tr>

    <tr>
      <td>
        **get\_top\_collections**
      </td>

      <td>
        Retrieve top NFT collections with stats explaining why they're top-ranked. Filter by category, chains, verification status and sort by various metrics.
      </td>

      <td>
        "Show top NFT collections by volume"\
        "What are the highest floor price collections?"\
        "Top trending collections today"
      </td>
    </tr>

    <tr>
      <td>
        **get\_trending\_collections**
      </td>

      <td>
        Retrieve trending NFT collections with stats explaining why they're trending. Filter by category, chains, and specify timeframes (ONE\_HOUR, ONE\_DAY, SEVEN\_DAYS, THIRTY\_DAYS).
      </td>

      <td>
        "Show trending NFTs in the last hour"\
        "What collections are hot this week?"\
        "Find collections trending on Polygon"
      </td>
    </tr>

    <tr>
      <td>
        **get\_top\_tokens**
      </td>

      <td>
        Retrieve top cryptocurrencies and tokens sorted by ONE\_DAY\_VOLUME in descending order. Filter by chains to identify highest volume tokens.
      </td>

      <td>
        "Show top tokens by daily volume"\
        "What are the most traded tokens on Ethereum?"\
        "Find high volume meme coins"
      </td>
    </tr>

    <tr>
      <td>
        **get\_trending\_tokens**
      </td>

      <td>
        Retrieve trending cryptocurrencies and tokens sorted by ONE\_DAY\_PRICE\_CHANGE in descending order. Filter by chains to identify tokens with highest price increases.
      </td>

      <td>
        "Show tokens with biggest gains today"\
        "What cryptocurrencies are pumping?"\
        "Find trending tokens on Base"
      </td>
    </tr>

    <tr>
      <td>
        **get\_profile**
      </td>

      <td>
        Retrieve comprehensive profile information for a wallet address including basic details and optionally additional data like NFT holdings, trading activity, listings, offers, balances, and favorites.
      </td>

      <td>
        "Show profile for wallet 0xabc..."\
        "Get trading activity for vitalik.eth"\
        "Check complete portfolio for this address"
      </td>
    </tr>

    <tr>
      <td>
        **account\_lookup**
      </td>

      <td>
        Look up account information by ENS name, wallet address, or username. Resolves ENS names to addresses and finds usernames associated with addresses.
      </td>

      <td>
        "Look up vitalik.eth"\
        "Find username for wallet 0x123..."\
        "Resolve ENS name to address"
      </td>
    </tr>

    <tr>
      <td>
        **get\_chains**
      </td>

      <td>
        Retrieve a list of all blockchain networks supported by OpenSea with chain identifiers and display names.
      </td>

      <td>
        "What chains does OpenSea support?"
        "Show me all available blockchains"
        "List supported networks"
      </td>
    </tr>

    <tr>
      <td>
        **get\_drop\_details**
      </td>

      <td>
        Get detailed information about a specific NFT drop by collection slug. Returns drop stages, pricing, supply, minting status, and eligibility information. Optionally check eligibility for a specific wallet address.
      </td>

      <td>
        "Get drop details for pudgypenguins"
        "Check if my wallet is eligible for this mint"
        "What's the price for the current drop stage?"
      </td>
    </tr>

    <tr>
      <td>
        **get\_mint\_action**
      </td>

      <td>
        Get the transaction data to mint NFTs from a SeaDrop drop. Returns transaction data that must be signed and submitted by the user's wallet. Use `get_drop_details` first to check eligibility and pricing.
      </td>

      <td>
        "Mint 2 NFTs from this drop"
        "Get mint transaction for collection xyz"
        "Prepare a mint transaction for my wallet"
      </td>
    </tr>

    <tr>
      <td>
        **deploy\_seadrop\_contract**
      </td>

      <td>
        Get the transaction data to deploy a new SeaDrop NFT contract. Supports ERC721 (standard or clone) and ERC1155 (clone) token types. Returns transaction data that must be signed and submitted by the user's wallet.
      </td>

      <td>
        "Deploy a new ERC721 NFT contract on Base"
        "Create a SeaDrop collection called MyNFT"
        "Deploy an ERC1155 drop contract"
      </td>
    </tr>

    <tr>
      <td>
        **get\_deploy\_receipt**
      </td>

      <td>
        Check the status of a SeaDrop contract deployment by transaction hash. Returns the deployment status, contract address, and collection information once the transaction is confirmed.
      </td>

      <td>
        "Check if my contract deployment succeeded"
        "Get the contract address from this deployment tx"
        "What's the status of transaction 0x123...?"
      </td>
    </tr>
  </tbody>
</Table>

<br />

### Common Use Cases

**Token Trading:**

"Get a quote to swap 0.5 ETH for USDC on Base, then show me the transaction data"

**Token Discovery:**

"Find trending meme coins on Solana and show their 24-hour price changes"

**Portfolio Analysis:**

"Show me all tokens and NFTs owned by vitalik.eth with current USD values"

**Market Research:**

"What are the top tokens by trading volume on Ethereum today?"

**NFT Research:**

"Find NFT collections trending in the last 24 hours with floor price under 1 ETH"

**NFT Minting:**

"Check if I'm eligible for the upcoming drop and prepare the mint transaction for 2 NFTs"

### Chain Support

OpenSea MCP supports all of the blockchains supported on the OpenSea web front-end.

When using tools, you can specify the chain parameter to filter results to a specific blockchain.

### Best Practices

1. **Use natural language** - The AI-powered search understands context, so describe what you're looking for naturally
2. **Combine tools** - Get comprehensive insights by using multiple tools together
3. **Specify chains** - When looking for specific blockchain data, include the chain name
4. **Check balances first** - Before requesting swap quotes, verify wallet has sufficient tokens
5. **Use collection slugs** - For specific collections, use their OpenSea slug (e.g., 'boredapeyachtclub')
6. **Leverage includes parameters** - Many tools support optional 'includes' arrays for additional data (activity, analytics, offers, etc.)
7. **Specify amounts correctly** - For swaps, use native units (ETH/SOL) not smallest units (wei/lamports)

### Rate Limits and Performance

* Most queries return results within 1-3 seconds
* Rate limits apply per access token
* Use pagination for large result sets
* Cursor-based pagination available for trending and top collections/tokens

### Error Handling

The MCP server provides clear error messages:

* Invalid addresses or contract addresses
* Unsupported chains
* Rate limit exceeded
* Insufficient token balance for swaps

For questions, feedback or support, contact [mcp-support@opensea.io](mailto:mcp-support@opensea.io).