> ## Documentation Index
> Fetch the complete documentation index at: https://docs.li.fi/llms.txt
> Use this file to discover all available pages before exploring further.

# Monetize Widget

> Learn how to configure fees and monetize your LI.FI Widget integration.

<Note>
  For more details about how fees work, fee collection on different chains, and
  setting up fee wallets, see the [Monetizing the
  integration](/introduction/integrating-lifi/monetizing-integration) guide.
</Note>

There are two ways to configure fees in the Widget: a simple `fee` prop for basic use cases, or an advanced `feeConfig` configuration that provides more flexibility and customization options.

### Simple fee configuration

```JavaScript  theme={"system"}
import { LiFiWidget, WidgetConfig } from '@lifi/widget';

const widgetConfig: WidgetConfig = {
  // Set fee parameter to 3%
  fee: 0.03,
  // Other options...
};

export const WidgetPage = () => {
  return (
    <LiFiWidget integrator="fee-demo" config={widgetConfig} />
  );
};
```

### Advanced fee configuration

For more advanced use cases, you can use the `feeConfig` parameter which provides additional customization options:

```JavaScript  theme={"system"}
import { LiFiWidget, WidgetConfig, WidgetFeeConfig } from '@lifi/widget';

// Basic advanced configuration
const basicFeeConfig: WidgetFeeConfig = {
  name: "DApp fee",
  logoURI: "https://yourdapp.com/logo.png",
  fee: 0.01, // 1% fee
  showFeePercentage: true,
  showFeeTooltip: true
};

// Dynamic fee calculation
const dynamicFeeConfig: WidgetFeeConfig = {
  name: "DApp fee",
  logoURI: "https://yourdapp.com/logo.png",
  showFeePercentage: true,
  showFeeTooltip: true,
  calculateFee: async (params) => {
    // Custom logic to calculate fees based on token, amount, etc.
    const { fromTokenAddress, toTokenAddress, fromAmount } = params;

    // Example: Different fees for different token pairs
    if (fromTokenAddress === "0x..." && toTokenAddress === "0x...") {
      return 0.02; // 2% for specific pair
    }

    // Example: Volume-based fee structure
    if (parseFloat(fromAmount) > 1000) {
      return 0.015; // 1.5% for large volumes
    }

    return 0.03; // Default 3% fee
  }
};

const widgetConfig: WidgetConfig = {
  feeConfig: basicFeeConfig, // or dynamicFeeConfig
  // Other options...
};

export const WidgetPage = () => {
  return (
    <LiFiWidget integrator="fee-demo" config={widgetConfig} />
  );
};
```

<Frame caption="Example of the advanced fee configuration">
  <img src="https://mintcdn.com/lifi/iGh0eCy-Q1v1j19-/images/widget-monetizing-integration.png?fit=max&auto=format&n=iGh0eCy-Q1v1j19-&q=85&s=a71a8dc0f48410fff17b1a40104d152e" data-og-width="1832" width="1832" data-og-height="1458" height="1458" data-path="images/widget-monetizing-integration.png" data-optimize="true" data-opv="3" srcset="https://mintcdn.com/lifi/iGh0eCy-Q1v1j19-/images/widget-monetizing-integration.png?w=280&fit=max&auto=format&n=iGh0eCy-Q1v1j19-&q=85&s=838b1b49e9d492db449528585d980126 280w, https://mintcdn.com/lifi/iGh0eCy-Q1v1j19-/images/widget-monetizing-integration.png?w=560&fit=max&auto=format&n=iGh0eCy-Q1v1j19-&q=85&s=03eb977868c8c4b6db8c2593d8c52f55 560w, https://mintcdn.com/lifi/iGh0eCy-Q1v1j19-/images/widget-monetizing-integration.png?w=840&fit=max&auto=format&n=iGh0eCy-Q1v1j19-&q=85&s=9ad9c2eb80e64a4a7edb173427d76bb4 840w, https://mintcdn.com/lifi/iGh0eCy-Q1v1j19-/images/widget-monetizing-integration.png?w=1100&fit=max&auto=format&n=iGh0eCy-Q1v1j19-&q=85&s=6b1b83ab709baf6d1f60f91ce9b54eba 1100w, https://mintcdn.com/lifi/iGh0eCy-Q1v1j19-/images/widget-monetizing-integration.png?w=1650&fit=max&auto=format&n=iGh0eCy-Q1v1j19-&q=85&s=462344fda8dd4a5c255303aeef695fc8 1650w, https://mintcdn.com/lifi/iGh0eCy-Q1v1j19-/images/widget-monetizing-integration.png?w=2500&fit=max&auto=format&n=iGh0eCy-Q1v1j19-&q=85&s=b9097513f326a4029aaaf0eed23863c0 2500w" />
</Frame>

### WidgetFeeConfig interface

The `WidgetFeeConfig` interface provides the following options:

* **`name`** (optional): Display name for your integration shown in fee details
* **`logoURI`** (optional): URL to your logo displayed alongside fee information
* **`fee`** (optional): Fixed fee percentage (e.g., 0.03 for 3%)
* **`showFeePercentage`** (default: false): Whether to display the fee percentage in the UI
* **`showFeeTooltip`** (default: false): Whether to show a tooltip with fee details (requires `name` or `feeTooltipComponent`)
* **`feeTooltipComponent`** (optional): Custom React component for the fee tooltip
* **`calculateFee`** (optional): Function for dynamic fee calculation based on transaction parameters

<Note>
  Only use either `fee` or `calculateFee` - not both. The `calculateFee`
  function allows for dynamic fee calculation based on factors like token pairs,
  transaction amounts, user tiers, or any other custom logic.
</Note>
