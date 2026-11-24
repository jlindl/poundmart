/**
 * Blog posts retired in the November 2026 clean-up. Each one overlapped a
 * stronger guide, so its URL 301s to that guide (next.config.ts) and it is
 * left out of the blog, the sitemap and related posts (lib/blog.ts).
 * The MDX files are kept so the SEO engine still sees the topics as taken.
 */
export const retiredPosts: Record<string, string> = {
  "how-to-choose-toothpaste-for-kids-without-the-guesswork": "best-toothpaste-for-kids-uk-parents-can-actually-rely-on",
  "how-to-pick-a-toothpaste-flavour-for-kids": "best-flavoured-toothpaste-for-kids",
  "is-flavoured-toothpaste-as-good-as-mint": "best-flavoured-toothpaste-for-kids",
  "bedtime-brushing-routine-for-kids-that-actually-works": "how-to-get-kids-to-brush-their-teeth",
  "how-to-build-a-brushing-routine-that-actually-sticks": "how-to-get-kids-to-brush-their-teeth",
  "family-brushing-routine": "how-to-get-kids-to-brush-their-teeth",
  "fluoride-toothpaste-explained": "how-to-read-fluoride-levels-on-toothpaste",
  "cruelty-free-toothpaste-uk-an-honest-look-for-parents": "vegan-toothpaste-guide-uk",
  "how-to-check-if-toothpaste-is-vegan-before-you-buy": "vegan-toothpaste-guide-uk",
  "shampoo-bar-mistakes-budget-shoppers-make-and-how-to-fix-them": "how-to-use-a-shampoo-bar",
  "how-to-store-a-shampoo-bar-for-curly-and-afro-hair": "how-to-use-a-shampoo-bar",
  "how-to-wash-your-hair-properly-curly-afro-hair": "wash-day-routine-for-afro-hair",
  "leave-in-conditioner-mistakes-that-leave-curls-dry-and-frizzy": "leave-in-conditioner-for-curly-hair",
  "post-workout-hair-routine-for-curly-and-afro-hair": "gym-hair-care-routine",
  "rosemary-shampoo-vs-rosemary-oil-for-uk-hair": "rosemary-shampoo-benefits",
  "freshers-packing-mistakes-to-avoid-before-moving-into-halls": "university-toiletries-checklist",
  "gym-bag-toiletries-checklist-for-students": "university-toiletries-checklist",
  "packing-mistakes-for-hand-luggage-toiletries-students-make": "travel-toiletries-checklist",
  "travel-toiletries-for-kids-that-actually-work-for-families": "travel-toiletries-checklist",
  "small-bathroom-storage-ideas-for-students": "family-bathroom-organisation-ideas",
  "bathroom-storage-mistakes-that-cost-budget-shoppers-money": "family-bathroom-organisation-ideas",
  "eco-friendly-bathroom-products-for-students": "plastic-free-bathroom-swaps",
  "are-solid-toiletries-better-for-the-environment": "plastic-free-bathroom-swaps",
  "is-buying-toiletries-in-bulk-worth-it-for-students": "are-multipacks-cheaper",
  "how-to-make-toiletries-last-longer-and-spend-less": "how-to-save-money-on-toiletries",
};
