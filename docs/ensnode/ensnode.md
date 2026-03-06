ENSNode Quickstart
The fastest way to query ENSNode is to use the NameHash Labs hosted instances of ENSNode. The alpha instance provides support for mainnet, base.eth, linea.eth, and 3DNS ENS names.

https://api.alpha.ensnode.io

For more information about the hosted instances, refer to the following documentation.

Hosted ENSNode Instances
Using ENSNode with ensjs
You can use ENSNode with ensjs by providing an ENSNode url in place of the subgraph url in viem’s Chain object.

import { http, createClient } from "viem";
import { mainnet } from "viem/chains";
import { addEnsContracts } from "@ensdomains/ensjs";
import { getSubgraphRecords } from "@ensdomains/ensjs/subgraph";

const client = createClient({
  chain: {
    ...addEnsContracts(mainnet),
    subgraphs: { ens: { url: "https://api.alpha.ensnode.io/subgraph" } },
  },
  transport: http(),
});

const names = await getNamesForAddress(client, { name: "validator.eth" });

See the following documentation for examples of how to query ENSNode from ensjs:

Using ENSNode with ensjs
Using ENSNode’s APIs
For querying ENSNode via its GraphQL API, refer to the following documentation:

Using ENSNode's API
Using ENSNode with viem/chain
If you’re integrating with a library that retrieves the url for the ENS Subgraph in a provided viem/chain object, see the following documentation for integration.

