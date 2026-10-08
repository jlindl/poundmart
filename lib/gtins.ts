/**
 * Barcodes (GTIN / EAN-13) per Amazon ASIN, used in Product structured data.
 * Google needs a GTIN to match products in Shopping results and product
 * snippets. Copy each 13-digit EAN from Seller Central (Inventory > Manage
 * All Inventory > the "Product ID" column, or the listing's "Vital info"
 * tab). Leave a value empty if the ASIN has a GTIN exemption (common for
 * "PoundMart Exclusive" bundles); empty values are simply not output.
 */
export const GTINS: Record<string, string> = {
  // Nice Smile 12 Pack Toothpaste Bundle
  "B0HBXLVW4S": "",
  // Nice Smile 6 Pack Flavoured Toothpaste Bundle
  "B0G318R9JG": "",
  // Nice Smile 6 Pack Flavoured Toothpaste Bundle
  "B0GTWGV3Q5": "",
  // Nice Smile 3 Pack Toothpaste Bundle
  "B0FLFZ2Z6C": "",
  // Nice Smile 3 Pack Toothpaste Bundle
  "B0FLWZ7D6T": "",
  // Nice Smile Watermelon Flavour
  "B0FNYGR43T": "",
  // Nice Smile Gummy Bear Flavour Toothpaste
  "B0FPDJHWN8": "",
  // Nice Smile Grape Flavour Toothpaste
  "B0FNYH9TFC": "",
  // Nice Smile Candy Clean Flavour
  "B0FPDJXQRG": "",
  // Nice Smile Candy Clean Flavour
  "B0H34TJ7QT": "",
  // Nice Smile Grape Flavour Toothpaste
  "B0H34WYZB2": "",
  // Nice Smile Gummy Bear Flavour Toothpaste
  "B0H34VYVVM": "",
  // XHC Vegan No Rinse Conditioner 3 Pack (Cherry & Almond, Dragon Fruit &
  "B0G3BS11B8": "",
  // XHC Vegan No Rinse Conditioner Twin Pack (Cherry & Almond, Dragon Frui
  "B0GK9LFDFX": "",
  // XHC Vegan No Rinse Mango & Coconut Conditioner
  "B0G3Y4NC1Y": "",
  // XHC Vegan No Rinse Dragon Fruit & Vanilla Conditioner
  "B0G3XM5FWJ": "",
  // XHC Vegan No Rinse Conditioner (Cherry & Almond, Dragon Fruit & Vanill
  "B0G3Y49RX7": "",
  // XHC Rosemary & Mint Shampoo 3 Pack (3 × 300ml)
  "B0GMXQNCYN": "",
  // XHC Argan Oil Shampoo Twin Pack (2 × 300ml)
  "B0GG7J6QCM": "",
  // XHC Argan Oil Shampoo Twin Pack (2 × 300ml)
  "B0H34SJXPD": "",
  // XHC Argan Oil Conditioner Twin Pack (2 × 300ml)
  "B0GG7YNXRZ": "",
  // XHC Argan Oil Shampoo 3 Pack (3 × 300ml)
  "B0GNS29WY9": "",
  // XHC Argan Oil Shampoo & Conditioner Set (2 × 300ml)
  "B0GBMH1N54": "",
  // Argan Oil Hair Conditioner 3 Pack (3 × 300ml)
  "B0GBMTMS6T": "",
  // XHC Shampoo & Conditioner Bars 3 Pack (Coconut, Banana & Papaya)
  "B0GKYHKMRG": "",
  // Shampoo & Conditioner Bars 6 Pack (2x Coconut, 2x Banana & 2x Papaya)
  "B0H9YX3DG3": "",
};

/** Valid GTIN-8/12/13/14 for an ASIN, or undefined. */
export function gtinFor(asin: string): string | undefined {
  const g = (GTINS[asin] || "").replace(/\D/g, "");
  return [8, 12, 13, 14].includes(g.length) ? g : undefined;
}
