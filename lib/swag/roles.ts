/**
 * Role ids on the swag collection that the generated ABI does not name.
 * Shared by the server gate and the client menu so both hash the same string.
 *
 * FULFILLMENT_ROLE gates no function in Swag1155. It is a plain AccessControl
 * role whose admin is DEFAULT_ADMIN_ROLE (getRoleAdmin reads 0x00 on the live
 * clone), granted with grantRole and read with hasRole. The app treats it as
 * "may work the order desk".
 */
import { keccak256, toBytes, zeroHash } from 'viem';

export const FULFILLMENT_ROLE = keccak256(toBytes('FULFILLMENT_ROLE'));
export const DEFAULT_ADMIN_ROLE = zeroHash;
