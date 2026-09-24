"use client";

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";

type VariantState = {
  /** Selected variant (option) index. */
  index: number;
  select: (i: number) => void;
  /** Gallery image index. */
  imageIndex: number;
  setImageIndex: (i: number) => void;
  /** The main Buy button, observed by the mobile buy bar. */
  ctaEl: HTMLElement | null;
  setCtaEl: (el: HTMLElement | null) => void;
};

const VariantContext = createContext<VariantState | null>(null);

/**
 * Shares the selected option between the gallery, the buy box and the mobile
 * buy bar. Choosing an option also shows that option's photo in the gallery.
 */
export function ProductVariantProvider({ children, variantImages }: { children: ReactNode; variantImages: number[] }) {
  const [index, setIndex] = useState(0);
  const [imageIndex, setImageIndex] = useState(0);
  const [ctaEl, setCtaEl] = useState<HTMLElement | null>(null);

  const select = useCallback(
    (i: number) => {
      setIndex(i);
      const img = variantImages[i];
      if (typeof img === "number" && img >= 0) setImageIndex(img);
    },
    [variantImages],
  );

  const value = useMemo(() => ({ index, select, imageIndex, setImageIndex, ctaEl, setCtaEl }), [index, select, imageIndex, ctaEl]);
  return <VariantContext.Provider value={value}>{children}</VariantContext.Provider>;
}

export function useProductVariant() {
  const ctx = useContext(VariantContext);
  if (!ctx) throw new Error("useProductVariant must be used inside <ProductVariantProvider>");
  return ctx;
}
