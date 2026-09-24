import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { brandFacts, site } from "@/lib/site";

export const alt = `${site.name}: ${site.tagline}. Nice Smile toothpaste and XHC haircare multi-packs, sold on Amazon.`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const INK = "#04406C";
const INK_DEEP = "#022A48";
const SUN = "#FCD000";
const CREAM = "#FBF7EE";

async function dataUrl(path: string, type: "image/png" | "image/jpeg") {
  const file = await readFile(join(process.cwd(), "public", path));
  return `data:${type};base64,${file.toString("base64")}`;
}

export default async function OpengraphImage() {
  const [logo, twelvePack, arganSet] = await Promise.all([
    dataUrl("brand/logo-white.png", "image/png"),
    dataUrl("products/B0HBXLVW4S/g1.jpg", "image/jpeg"),
    dataUrl("products/B0GBMH1N54/g1.jpg", "image/jpeg"),
  ]);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          position: "relative",
          overflow: "hidden",
          backgroundColor: INK,
          backgroundImage: `radial-gradient(circle at 12% 0%, #2A5F88 0%, rgba(4,64,108,0) 55%), radial-gradient(circle at 100% 100%, ${INK_DEEP} 0%, rgba(2,42,72,0) 60%)`,
          color: CREAM,
        }}
      >
        {/* Sun disc with product cards */}
        <div
          style={{
            position: "absolute",
            right: -130,
            top: 40,
            width: 640,
            height: 640,
            borderRadius: 9999,
            backgroundColor: SUN,
            display: "flex",
          }}
        />
        <div
          style={{
            position: "absolute",
            right: 250,
            top: 118,
            width: 250,
            height: 330,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "#FFFFFF",
            borderRadius: 36,
            transform: "rotate(-7deg)",
            boxShadow: "0 30px 60px rgba(1,25,44,0.35)",
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element -- next/og renders plain <img> */}
          <img src={twelvePack} alt="" width={190} height={285} style={{ objectFit: "contain" }} />
        </div>
        <div
          style={{
            position: "absolute",
            right: 56,
            top: 206,
            width: 236,
            height: 300,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "#FFFFFF",
            borderRadius: 36,
            transform: "rotate(8deg)",
            boxShadow: "0 30px 60px rgba(1,25,44,0.35)",
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element -- next/og renders plain <img> */}
          <img src={arganSet} alt="" width={190} height={252} style={{ objectFit: "contain" }} />
        </div>

        {/* Copy */}
        <div
          style={{
            position: "relative",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            padding: "56px 0 52px 72px",
            width: 740,
            height: "100%",
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element -- next/og renders plain <img> */}
          <img src={logo} alt={site.name} width={224} height={88} />
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ display: "flex", flexDirection: "column", fontSize: 80, lineHeight: 0.95, letterSpacing: -3.5 }}>
              <span>Home of</span>
              <span style={{ color: SUN }}>Great Value</span>
              <span>Bundles</span>
            </div>
            <div style={{ display: "flex", marginTop: 20, fontSize: 24, lineHeight: 1.35, color: "rgba(251,247,238,0.82)", maxWidth: 540 }}>
              Nice Smile toothpaste and XHC haircare, bundled into great value multi-packs.
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                padding: "14px 26px",
                borderRadius: 9999,
                backgroundColor: SUN,
                color: INK_DEEP,
                fontSize: 22,
                whiteSpace: "nowrap",
                flexShrink: 0,
              }}
            >
              Shop on Amazon
            </div>
            <div style={{ display: "flex", fontSize: 18, whiteSpace: "nowrap", color: "rgba(251,247,238,0.72)" }}>
              {`${brandFacts.soldBy} · ${brandFacts.dispatchedBy}`}
            </div>
          </div>
        </div>
      </div>
    ),
    { ...size },
  );
}
