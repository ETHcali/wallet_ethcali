/**
 * Explorer links, read from the chain registry.
 *
 * These two names are kept because `pages/swag/**` imports them; new code
 * imports `explorerTx` / `explorerAddress` from `config/chains` directly.
 * Both return `undefined` for a chain the registry does not know.
 */
export { explorerTx as getTxUrl, explorerAddress as getAddressUrl } from '../config/chains';
