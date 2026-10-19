/**
 * PoundMart newsletter ("The Bundle Drop") sign-up config.
 *
 * Sign-ups go straight from the browser to Klaviyo's public Client
 * Subscriptions API. No Klaviyo tracking script is loaded and no cookies are
 * set, so the cookie banner and Cookie Policy stay accurate.
 *
 * Both values are public by design (Klaviyo's "public API key" is the 6
 * character company id). Set them in Vercel:
 *   NEXT_PUBLIC_KLAVIYO_COMPANY_ID  e.g. "AbC123"
 *   NEXT_PUBLIC_KLAVIYO_LIST_ID     e.g. "XyZ789"
 * Until both are set the form still renders but explains that sign-ups open soon.
 */
export const newsletter = {
  name: "The Bundle Drop",
  pitch: "New bundles, price drops and restocks from our Amazon store, once a week. No spam, unsubscribe any time.",
  companyId: process.env.NEXT_PUBLIC_KLAVIYO_COMPANY_ID ?? "",
  listId: process.env.NEXT_PUBLIC_KLAVIYO_LIST_ID ?? "",
} as const;

export const newsletterReady = Boolean(newsletter.companyId && newsletter.listId);

const KLAVIYO_REVISION = "2024-10-15";

/** Subscribe an email to the PoundMart list. Resolves true on success. */
export async function subscribe(email: string, source: string): Promise<boolean> {
  if (!newsletterReady) return false;
  const res = await fetch(
    `https://a.klaviyo.com/client/subscriptions/?company_id=${encodeURIComponent(newsletter.companyId)}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/vnd.api+json",
        Accept: "application/vnd.api+json",
        revision: KLAVIYO_REVISION,
      },
      body: JSON.stringify({
        data: {
          type: "subscription",
          attributes: {
            custom_source: `poundmart.co.uk ${source}`,
            profile: { data: { type: "profile", attributes: { email } } },
          },
          relationships: { list: { data: { type: "list", id: newsletter.listId } } },
        },
      }),
    },
  );
  // Klaviyo answers 202 Accepted on success.
  return res.ok;
}
