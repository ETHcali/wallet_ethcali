#!/usr/bin/env node
/**
 * Pin swag artwork and metadata to IPFS and write the CIDs back into the
 * catalogue.
 *
 *   node --env-file=.env scripts/swag-pin.mjs images   <catalogue.json> <images-dir>
 *   node --env-file=.env scripts/swag-pin.mjs metadata <catalogue.json>
 *
 * Idempotent: a variant that already has the CID for a phase is skipped, and
 * two designs that share one image file pin it once. Bare CIDs are stored;
 * `ipfs://` is added only where a URI is required (metadataURI, and the
 * `image` field inside the metadata). Never a gateway URL: gateways rot.
 *
 * The on-chain URI is not permanent. Swag1155 admins can re-point a token with
 * setVariantWithURI, so a better photo later is a re-pin plus one admin tx.
 */
import fs from 'node:fs';
import path from 'node:path';
import PinataSDK from '@pinata/sdk';

const [phase, cataloguePath, imagesDir] = process.argv.slice(2);
if (!['images', 'metadata'].includes(phase) || !cataloguePath) {
  console.error('usage: swag-pin.mjs images <catalogue.json> <images-dir> | metadata <catalogue.json>');
  process.exit(1);
}
if (!process.env.PINATA_JWT) {
  console.error('Missing PINATA_JWT');
  process.exit(1);
}

const pinata = new PinataSDK({ pinataJWTKey: process.env.PINATA_JWT });
const catalogue = JSON.parse(fs.readFileSync(cataloguePath, 'utf8'));
const variants = catalogue.products.flatMap((p) => p.variants);
const year = 2026;

function save() {
  fs.writeFileSync(cataloguePath, JSON.stringify(catalogue, null, 2) + '\n');
}

if (phase === 'images') {
  if (!imagesDir) {
    console.error('images phase needs <images-dir>');
    process.exit(1);
  }
  const cidByFile = new Map(variants.filter((v) => v.imageCid).map((v) => [v.image, v.imageCid]));
  for (const v of variants) {
    if (v.imageCid) continue;
    if (cidByFile.has(v.image)) {
      v.imageCid = cidByFile.get(v.image);
      console.log(`${v.designSku}: reuse ${v.image} -> ${v.imageCid}`);
      save();
      continue;
    }
    const file = path.join(imagesDir, v.image);
    if (!fs.existsSync(file)) {
      console.error(`${v.designSku}: missing ${file}`);
      process.exit(1);
    }
    const res = await pinata.pinFileToIPFS(fs.createReadStream(file), {
      pinataMetadata: { name: `swag-${year}-${v.image}` },
      pinataOptions: { cidVersion: 1 },
    });
    v.imageCid = res.IpfsHash;
    cidByFile.set(v.image, res.IpfsHash);
    save();
    console.log(`${v.designSku}: pinned ${v.image} -> ${res.IpfsHash} (${res.PinSize} bytes)`);
  }
}

if (phase === 'metadata') {
  for (const v of variants) {
    if (v.metadataCid) continue;
    if (!v.imageCid) {
      console.error(`${v.designSku}: no imageCid yet, run the images phase first`);
      process.exit(1);
    }
    const metadata = {
      name: `${v.name.en} — ETH Cali ${year}`,
      description: `${v.description.en}\n\n${v.description.es}`,
      image: `ipfs://${v.imageCid}`,
      external_url: 'https://ethcali.org/swag',
      attributes: [
        { trait_type: 'Category', value: v.category },
        { trait_type: 'Design', value: v.name.en },
        { trait_type: 'Edition', value: year, display_type: 'number' },
      ],
    };
    const res = await pinata.pinJSONToIPFS(metadata, {
      pinataMetadata: { name: `swag-${year}-${v.designSku}.json` },
      pinataOptions: { cidVersion: 1 },
    });
    v.metadataCid = res.IpfsHash;
    v.metadataURI = `ipfs://${res.IpfsHash}`;
    save();
    console.log(`${v.designSku}: metadata -> ${res.IpfsHash}`);
  }
}

const pending = variants.filter((v) => v.metadataURI === 'ipfs://PENDING').length;
console.log(`done. ${variants.length} variants, ${pending} still pending metadata.`);
