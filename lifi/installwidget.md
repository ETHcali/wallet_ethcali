Install Widget

> ## Documentation Index
> Fetch the complete documentation index at: https://docs.li.fi/llms.txt
> Use this file to discover all available pages before exploring further.

# Install Widget

> Easy installation to go multi-chain

To get started, install the latest version of LI.FI Widget.

<CodeGroup>
  ```typescript yarn theme={"system"}
  yarn add @lifi/widget wagmi@2 @bigmi/react @solana/wallet-adapter-react @mysten/dapp-kit @tanstack/react-query
  ```

  ```typescript pnpm theme={"system"}
  pnpm add @lifi/widget wagmi@2 @bigmi/react @solana/wallet-adapter-react @mysten/dapp-kit @tanstack/react-query
  ```

  ```typescript bun theme={"system"}
  bun add @lifi/widget wagmi@2 @bigmi/react @solana/wallet-adapter-react @mysten/dapp-kit @tanstack/react-query
  ```

  ```typescript npm theme={"system"}
  npm install @lifi/widget wagmi@2 @bigmi/react @solana/wallet-adapter-react @mysten/dapp-kit @tanstack/react-query
  ```
</CodeGroup>

[Wagmi](https://wagmi.sh/) is type safe, extensible, and modular library for building Ethereum apps.

[Bigmi](https://github.com/lifinance/bigmi) is modular TypeScript library that provides reactive primitives for building Bitcoin applications.

[@solana/wallet-adapter-react](https://github.com/anza-xyz/wallet-adapter) is modular TypeScript wallet adapters and components for Solana applications.

[@mysten/dapp-kit](https://sdk.mystenlabs.com/dapp-kit) provides React tools for wallet integration and data access in Sui blockchain dApps.

[TanStack Query](https://tanstack.com/query/v5) is an async state manager that handles requests, caching, and more.

## Compatibility

List of environments, libraries and frameworks we've tested the widget with so far:

* React 18+ ([Example](https://github.com/lifinance/widget/tree/main/examples/create-react-app))

* Vite ([Example](https://github.com/lifinance/widget/tree/main/examples/vite))

* Next.js ([Compatibility with Next.js, Remix, Nuxt, etc.](/widget/compatibility), [example](https://github.com/lifinance/widget/tree/main/examples/nextjs))

* Remix ([Example](https://github.com/lifinance/widget/tree/main/examples/remix))

* Vue 3 ([Example](https://github.com/lifinance/widget/tree/main/examples/vue))

* Svelte ([Example](https://github.com/lifinance/widget/tree/main/examples/svelte))

* Nuxt.js ([Example](https://github.com/lifinance/widget/tree/main/examples/nuxt))

* Gatsby ([Example](https://github.com/lifinance/widget/tree/main/examples/gatsby))

* RainbowKit ([Example](https://github.com/lifinance/widget/tree/main/examples/rainbowkit))

See the compatibility pages for more information.

Check out our complete examples in the [widget repository](https://github.com/lifinance/widget/tree/main/examples) or [file an issue](https://github.com/lifinance/widget/issues) if you have any incompatibilities.

<Note>
  Check out our [LI.FI Playground](https://playground.li.fi/) to play with customization options in
  real time.
</Note>

## Basic example

Here is a basic example using LI.FI Widget with container customization.

```typescript  theme={"system"}
import { LiFiWidget, WidgetConfig } from '@lifi/widget'

const widgetConfig: WidgetConfig = {
  theme: {
    container: {
      border: '1px solid rgb(234, 234, 234)',
      borderRadius: '16px',
    },
  },
}

export const WidgetPage = () => {
  return <LiFiWidget integrator="Your dApp/company name" config={widgetConfig} />
}
```
