"use client";

import { useEffect } from "react";
import { track } from "@/lib/gtag";

/** Fires GA4 "view_item" once when a product page is viewed. */
export function ViewItem({ id, name, brand, category, price }: { id: string; name: string; brand: string; category: string; price: number | null }) {
  useEffect(() => {
    track("view_item", {
      currency: "GBP",
      ...(price !== null ? { value: price } : {}),
      items: [{ item_id: id, item_name: name, item_brand: brand, item_category: category, ...(price !== null ? { price } : {}) }],
    });
  }, [id, name, brand, category, price]);
  return null;
}
