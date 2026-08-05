// @vitest-environment jsdom
// generator.ts drives qr-code-styling's SVG renderer, which needs DOM APIs the package's
// default "node" vitest environment doesn't provide.
import { describe, expect, it } from "vitest";
import { generateQRCodeSVG } from "./generator";

describe("generateQRCodeSVG", () => {
  it("renders a valid SVG with default black-on-white square styling", async () => {
    const svg = await generateQRCodeSVG("https://example.com");
    expect(svg).toContain("<svg");
    expect(svg).toContain("#000000");
    expect(svg).toContain("#ffffff");
  });

  it("applies a linear gradient to the dots", async () => {
    const svg = await generateQRCodeSVG("https://example.com", {
      dotsOptions: {
        gradient: {
          type: "linear",
          rotation: 0,
          colorStops: [
            { offset: 0, color: "#ff0000" },
            { offset: 1, color: "#0000ff" },
          ],
        },
      },
    });
    expect(svg).toContain("linearGradient");
    expect(svg).toContain("#ff0000");
    expect(svg).toContain("#0000ff");
  });

  it("applies a radial gradient to the background", async () => {
    const svg = await generateQRCodeSVG("https://example.com", {
      backgroundOptions: {
        gradient: {
          type: "radial",
          colorStops: [
            { offset: 0, color: "#fff000" },
            { offset: 1, color: "#000fff" },
          ],
        },
      },
    });
    expect(svg).toContain("radialGradient");
  });

  it("supports independent colors for dots, corner squares, and corner dots", async () => {
    const svg = await generateQRCodeSVG("https://example.com", {
      dotsOptions: { color: "#111111" },
      cornersSquareOptions: { color: "#222222" },
      cornersDotOptions: { color: "#333333" },
    });
    expect(svg).toContain("#111111");
    expect(svg).toContain("#222222");
    expect(svg).toContain("#333333");
  });

  it("accepts a circle shape", async () => {
    const svg = await generateQRCodeSVG("https://example.com", { shape: "circle" });
    expect(svg).toContain("<svg");
  });

  // Logo embedding (image/imageOptions) isn't covered here: jsdom never fires an <img>'s
  // load/error events, so qr-code-styling's image-loading promise never settles and the test
  // would hang. Covered by manual verification in a real browser instead.
});
