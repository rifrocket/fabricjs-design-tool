import { describe, expect, it } from "vitest";
import { generateContentString, validateContent } from "./content";

describe("generateContentString", () => {
  it("adds https:// to a bare URL but leaves an explicit scheme alone", () => {
    expect(generateContentString("url", { url: "example.com" })).toBe("https://example.com");
    expect(generateContentString("url", { url: "http://example.com" })).toBe("http://example.com");
  });

  it("builds a mailto: link, adding subject/body params only when present", () => {
    expect(generateContentString("email", { email: "a@b.com" })).toBe("mailto:a@b.com");
    expect(generateContentString("email", { email: "a@b.com", subject: "Hi there" })).toBe(
      "mailto:a@b.com?subject=Hi%20there",
    );
  });

  it("builds a tel: link", () => {
    expect(generateContentString("phone", { phone: "+1234567890" })).toBe("tel:+1234567890");
  });

  it("builds an sms: link with an optional body", () => {
    expect(generateContentString("sms", { phone: "123" })).toBe("sms:123");
    expect(generateContentString("sms", { phone: "123", message: "hi" })).toBe("sms:123?body=hi");
  });

  it("builds a VCARD payload with only the provided optional fields", () => {
    const vcard = generateContentString("vcard", { firstName: "Ada", lastName: "Lovelace", email: "ada@example.com" });
    expect(vcard).toContain("BEGIN:VCARD");
    expect(vcard).toContain("FN:Ada Lovelace");
    expect(vcard).toContain("EMAIL:ada@example.com");
    expect(vcard).not.toContain("ORG:");
    expect(vcard).toContain("END:VCARD");
  });

  it("builds a VEVENT payload with colons/dashes stripped from dates", () => {
    const event = generateContentString("event", { title: "Launch", startDate: "2026-08-01T10:00:00" });
    expect(event).toContain("BEGIN:VEVENT");
    expect(event).toContain("DTSTART:20260801T100000");
    expect(event).toContain("END:VEVENT");
  });
});

describe("validateContent", () => {
  it("requires a URL and rejects an invalid one", () => {
    expect(validateContent("url", { url: "" }).isValid).toBe(false);
    expect(validateContent("url", { url: "not a url" }).isValid).toBe(false);
    expect(validateContent("url", { url: "example.com" }).isValid).toBe(true);
  });

  it("requires a valid email address", () => {
    expect(validateContent("email", { email: "not-an-email" }).isValid).toBe(false);
    expect(validateContent("email", { email: "a@b.com" }).isValid).toBe(true);
  });

  it("requires first and last name for a vCard, validating optional fields when present", () => {
    const missingName = validateContent("vcard", { firstName: "", lastName: "" });
    expect(missingName.isValid).toBe(false);
    expect(missingName.errors).toContain("First name is required");
    expect(missingName.errors).toContain("Last name is required");

    const badEmail = validateContent("vcard", { firstName: "Ada", lastName: "Lovelace", email: "bad" });
    expect(badEmail.isValid).toBe(false);
  });

  it("requires a title and start date for an event", () => {
    const result = validateContent("event", { title: "", startDate: "" });
    expect(result.isValid).toBe(false);
    expect(result.errors).toEqual(["Event title is required", "Start date is required"]);
  });
});
