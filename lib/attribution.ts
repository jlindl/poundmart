/**
 * Amazon Attribution tags for every Amazon link on the site.
 *
 * Amazon Attribution campaign "PoundMart website" (publisher poundmart.co.uk, channel Search),
 * exported 26 Oct 2026. There is one ad group per destination, so Attribution reports clicks and
 * sales for each product and store page, and the sales qualify for the Brand Referral Bonus.
 *
 * Each value is the query string of that ad group's tag. amazon.store() and amazon.product() in
 * lib/site.ts append it to the matching Amazon URL. Only use a tag on the URL it was created for.
 *
 * Retired 27 Oct 2026, because Amazon delisted the ASIN: "PM - NS 6 Pack" (B0G318R9JG), "PM - NS 6 Pack Sweet
 * Six" (B0GTWGV3Q5), "PM - NS Candy Clean" (B0FPDJXQRG), "PM - NS Candy Clean 4 Pack" (B0H34TJ7QT) and
 * "PM - XHC Argan Shampoo 6 Pack" (B0H34SJXPD).
 *
 * Linking a new product or store page? Create an ad group for its URL in Amazon Attribution (same
 * campaign, publisher and channel), then add its tag here. Until then the link falls back to
 * NEXT_PUBLIC_AMAZON_ATTRIBUTION if that is set, or goes untagged.
 */

/** Brand store pages, keyed like amazonStore in lib/site.ts. */
export const storeAttribution: Record<string, string> = {
  // PM Store - Main
  home: "maas=maas_adg_AAA3DD8FBF11BAB465B27524BC0C9EB3_afap_abs&ref_=aa_maas&tag=maas",
  // PM Store - Full range
  shopAll: "maas=maas_adg_AF93A098A7A2401AF61B1140A653BF49_afap_abs&ref_=aa_maas&tag=maas",
  // PM Store - Toothpaste
  toothpaste: "maas=maas_adg_3FF9C321AE08FCA251541CF3462C29BE_afap_abs&ref_=aa_maas&tag=maas",
  // PM Store - Haircare
  haircare: "maas=maas_adg_46F0A5B340C777B877C0482582D19A44_afap_abs&ref_=aa_maas&tag=maas",
  // PM Store - New arrivals
  newArrivals: "maas=maas_adg_2C4AC6F679A2F41D60FA7595D069A169_afap_abs&ref_=aa_maas&tag=maas",
};

/** Product detail pages, keyed by ASIN. */
export const productAttribution: Record<string, string> = {
  // PM - NS 12 Pack
  B0HBXLVW4S: "maas=maas_adg_8B5C3303F1027D8E184B43A5595AEC84_afap_abs&ref_=aa_maas&tag=maas",
  // PM - NS 3 Pack Berry Gummy Candy
  B0FLFZ2Z6C: "maas=maas_adg_EE642A01EFA254120AF6E57C8EFC3A53_afap_abs&ref_=aa_maas&tag=maas",
  // PM - NS 3 Pack Watermelon Grape Peach
  B0FLWZ7D6T: "maas=maas_adg_4326EB45699DC30E008D9322F0D6246A_afap_abs&ref_=aa_maas&tag=maas",
  // PM - NS Feelin Grape
  B0FNYH9TFC: "maas=maas_adg_7E77E5EF6D6E91DCB4959ADDF53DC56B_afap_abs&ref_=aa_maas&tag=maas",
  // PM - NS Feelin Grape 2 Pack
  B0H34WYZB2: "maas=maas_adg_A8C32D0E521ECC1D37563208E69E53F6_afap_abs&ref_=aa_maas&tag=maas",
  // PM - NS Watermelon Fresh
  B0FNYGR43T: "maas=maas_adg_1B1F6EFBBAEAF9E9E14D1D7E6F2B489F_afap_abs&ref_=aa_maas&tag=maas",
  // PM - NS Yummy Gummy
  B0FPDJHWN8: "maas=maas_adg_A981B9FA80C74E4187AB0D68C1ACE2B0_afap_abs&ref_=aa_maas&tag=maas",
  // PM - NS Yummy Gummy 2 Pack
  B0H34VYVVM: "maas=maas_adg_A4D43E9738BDB55D5477AB55AE73BA64_afap_abs&ref_=aa_maas&tag=maas",
  // PM - XHC 2in1 Bars 3 Pack
  B0GKYHKMRG: "maas=maas_adg_A857DFB24935B89BEA4F0E62B8DB025E_afap_abs&ref_=aa_maas&tag=maas",
  // PM - XHC 2in1 Bars 6 Pack
  B0H9YX3DG3: "maas=maas_adg_70343FC729BBB4D661ADBC991F628E56_afap_abs&ref_=aa_maas&tag=maas",
  // PM - XHC Argan Conditioner 3 Pack
  B0GBMTMS6T: "maas=maas_adg_657C7298271459B97B3E07D7ED2ED954_afap_abs&ref_=aa_maas&tag=maas",
  // PM - XHC Argan Conditioner Twin
  B0GG7YNXRZ: "maas=maas_adg_A6BBC2497E900E841D9F9E86E52D6C36_afap_abs&ref_=aa_maas&tag=maas",
  // PM - XHC Argan Set
  B0GBMH1N54: "maas=maas_adg_3DC7F9F6DB3BCAF17A625489113F0A59_afap_abs&ref_=aa_maas&tag=maas",
  // PM - XHC Argan Shampoo 3 Pack
  B0GNS29WY9: "maas=maas_adg_F5DFDAF4AB38D7FD50C324E89D94E869_afap_abs&ref_=aa_maas&tag=maas",
  // PM - XHC Argan Shampoo Twin
  B0GG7J6QCM: "maas=maas_adg_76959591BE21751FDD0BC8E885DC38C6_afap_abs&ref_=aa_maas&tag=maas",
  // PM - XHC No Rinse 3 Pack
  B0G3BS11B8: "maas=maas_adg_2E45AB9F14272422F8E96C888552CF72_afap_abs&ref_=aa_maas&tag=maas",
  // PM - XHC No Rinse Cherry Almond
  B0G3Y49RX7: "maas=maas_adg_5FD3D524D93D7F5E369AEE5F70E63F2F_afap_abs&ref_=aa_maas&tag=maas",
  // PM - XHC No Rinse Dragon Fruit Vanilla
  B0G3XM5FWJ: "maas=maas_adg_9D59A32173468246D761C6890498C814_afap_abs&ref_=aa_maas&tag=maas",
  // PM - XHC No Rinse Mango Coconut
  B0G3Y4NC1Y: "maas=maas_adg_A545C99C3654E511BEC4ABE054D0EEA9_afap_abs&ref_=aa_maas&tag=maas",
  // PM - XHC No Rinse Twin
  B0GK9LFDFX: "maas=maas_adg_1E0CBD0FE32C5051114FB2FDAC31CC0B_afap_abs&ref_=aa_maas&tag=maas",
  // PM - XHC Rosemary Mint 3 Pack
  B0GMXQNCYN: "maas=maas_adg_3F59C1E18FA09A34473B9907C624B9B0_afap_abs&ref_=aa_maas&tag=maas",
};
