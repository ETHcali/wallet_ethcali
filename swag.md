╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌
 Rich Product Creation Form for Swag Admin                                                                  
                                                                                                            
 Goal                                                                                                       
                                                                                                            
 Replace the basic CreateProductModal (manual URI input) with a rich form that lets admins fill in product  
 name, description, traits, sizes, upload an image, and auto-generates + uploads metadata to IPFS before    
 creating the on-chain variant.                                                                             
                                                                                                            
 Existing Infrastructure (already working, no changes needed)                                               
                                                                                                            
 - pages/api/pinata/pin-image.ts — accepts base64 image, returns ipfs:// URI (10MB limit)                   
 - pages/api/pinata/pin-json.ts — accepts JSON metadata, returns ipfs:// URI                                
 - lib/pinata.ts — pinMetadataToIPFS() + getIPFSGatewayUrl()                                                
 - types/swag.ts — Swag1155Metadata, Swag1155MetadataAttribute, ProductTraits, SizeOption, GenderOption     
 - .env — PINATA_JWT, PINATA_GATEWAY, PINATASECRET, PINATA_APIKEY all configured                            
                                                                                                            
 Plan                                                                                                       
                                                                                                            
 1. Create components/swag/CreateProductModal.tsx (~280 lines)                                              
                                                                                                            
 Extract from AdminProductList.tsx into its own file.                                                       
                                                                                                            
 Form sections:                                                                                             
                                                                                                            
 A. Product Info                                                                                            
 - Product Name (text input, e.g. "ETH Cali Tee")                                                           
 - Description (textarea)                                                                                   
                                                                                                            
 B. Image Upload                                                                                            
 - Click-to-browse file picker with drag-and-drop zone                                                      
 - Accepts PNG, JPG, WebP (max 5MB client-side validation)                                                  
 - Shows image preview after file selection                                                                 
 - Hint text: "Recommended: 1200x1200px square, PNG or JPG, max 5MB"                                        
 - Image stored as base64 in state; uploaded to IPFS on submit via /api/pinata/pin-image                    
                                                                                                            
 C. Traits                                                                                                  
 - Gender: radio buttons (Male / Female / Unisex)                                                           
 - Color: text input (e.g. "Black")                                                                         
 - Style: text input (e.g. "Classic", "Oversized")                                                          
                                                                                                            
 D. Sizes & Pricing                                                                                         
 - Token ID base: number input ("Base ID × 10 + size offset. E.g. base 100 → 1001=S, 1002=M, 1003=L,        
 1004=XL, 1005=OneSize")                                                                                    
 - Price (USDC): single price for all sizes                                                                 
 - Size rows: check a size to enable it, then set its individual maxSupply                                  
 [x] S   — Max Supply: [___30___]                                                                           
 [x] M   — Max Supply: [___80___]                                                                           
 [x] L   — Max Supply: [___60___]                                                                           
 [ ] XL                                                                                                     
 [ ] NA (one-size)                                                                                          
 ─────────────────────────────────                                                                          
 Total Supply: 170                                                                                          
 - Each checked size creates a separate on-chain variant with its own tokenId and maxSupply                 
 - Total supply shown as read-only sum for reference                                                        
                                                                                                            
 E. Active toggle (same as current)                                                                         
                                                                                                            
 Submit flow:                                                                                               
 1. Validate all fields                                                                                     
 2. Upload image to IPFS → get imageUri                                                                     
 3. For each selected size, build Swag1155Metadata JSON with attributes array                               
 4. Upload each metadata JSON to IPFS via pinMetadataToIPFS()                                               
 5. Call setVariantWithURI() for each size variant                                                          
 6. Show step-by-step progress ("Uploading image...", "Creating S variant...", etc.)                        
                                                                                                            
 2. Update components/swag/AdminProductList.tsx                                                             
                                                                                                            
 - Remove inline CreateProductModal and CreateProductButton (~170 lines removed)                            
 - Import CreateProductModal from new file                                                                  
 - Keep VariantCard and AdminProductList in this file                                                       
                                                                                                            
 3. Add pinImageToIPFS helper to lib/pinata.ts                                                              
                                                                                                            
 Small helper that calls the existing /api/pinata/pin-image endpoint:                                       
 export async function pinImageToIPFS(base64: string, fileName?: string): Promise<string>                   
                                                                                                            
 4. Clean up types/swag.ts                                                                                  
                                                                                                            
 Remove the // Legacy - may be removed comment from ProductFormData since it will now be actively used.     
                                                                                                            
 Files                                                                                                      
 ┌────────────────────────────────────────┬──────────────────────────────────────────────────┐              
 │                  File                  │                      Action                      │              
 ├────────────────────────────────────────┼──────────────────────────────────────────────────┤              
 │ components/swag/CreateProductModal.tsx │ NEW — rich form with image upload, traits, sizes │              
 ├────────────────────────────────────────┼──────────────────────────────────────────────────┤              
 │ components/swag/AdminProductList.tsx   │ Remove inline modal, import new component        │              
 ├────────────────────────────────────────┼──────────────────────────────────────────────────┤              
 │ lib/pinata.ts                          │ Add pinImageToIPFS() helper (~10 lines)          │              
 ├────────────────────────────────────────┼──────────────────────────────────────────────────┤              
 │ types/swag.ts                          │ Remove legacy comment                            │              
 └────────────────────────────────────────┴──────────────────────────────────────────────────┘              
 Verification                                                                                               
                                                                                                            
 1. npm run typecheck → 0 errors                                                                            
 2. Swag admin → Products → "Create Product" opens the rich modal                                           
 3. Fill name, description, upload image, pick traits/sizes, set price/supply                               
 4. Submit uploads image + metadata to IPFS, then creates on-chain variants  