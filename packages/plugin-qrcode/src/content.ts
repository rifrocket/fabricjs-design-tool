import type { QRCodeContentMap, QRContentType } from "./types";

export function generateContentString(type: QRContentType, data: QRCodeContentMap[QRContentType]): string {
  switch (type) {
    case "url": {
      const { url } = data as QRCodeContentMap["url"];
      return url.startsWith("http") ? url : `https://${url}`;
    }

    case "email": {
      const { email, subject, body } = data as QRCodeContentMap["email"];
      const params: string[] = [];
      if (subject) params.push(`subject=${encodeURIComponent(subject)}`);
      if (body) params.push(`body=${encodeURIComponent(body)}`);
      return params.length > 0 ? `mailto:${email}?${params.join("&")}` : `mailto:${email}`;
    }

    case "phone": {
      const { phone } = data as QRCodeContentMap["phone"];
      return `tel:${phone}`;
    }

    case "sms": {
      const { phone, message } = data as QRCodeContentMap["sms"];
      return message ? `sms:${phone}?body=${encodeURIComponent(message)}` : `sms:${phone}`;
    }

    case "vcard": {
      const vcard = data as QRCodeContentMap["vcard"];
      const lines = [
        "BEGIN:VCARD",
        "VERSION:3.0",
        `FN:${vcard.firstName} ${vcard.lastName}`,
        `N:${vcard.lastName};${vcard.firstName};;;`,
      ];
      if (vcard.organization) lines.push(`ORG:${vcard.organization}`);
      if (vcard.phone) lines.push(`TEL:${vcard.phone}`);
      if (vcard.email) lines.push(`EMAIL:${vcard.email}`);
      if (vcard.website) lines.push(`URL:${vcard.website}`);
      if (vcard.address) lines.push(`ADR:;;${vcard.address};;;;`);
      lines.push("END:VCARD");
      return lines.join("\n");
    }

    case "event": {
      const event = data as QRCodeContentMap["event"];
      const lines = ["BEGIN:VEVENT", `SUMMARY:${event.title}`, `DTSTART:${event.startDate.replace(/[-:]/g, "")}`];
      if (event.endDate) lines.push(`DTEND:${event.endDate.replace(/[-:]/g, "")}`);
      if (event.location) lines.push(`LOCATION:${event.location}`);
      if (event.description) lines.push(`DESCRIPTION:${event.description}`);
      lines.push("END:VEVENT");
      return lines.join("\n");
    }
  }
}

export interface ContentValidationResult {
  isValid: boolean;
  errors: string[];
}

export function validateContent(type: QRContentType, data: QRCodeContentMap[QRContentType]): ContentValidationResult {
  const errors: string[] = [];

  switch (type) {
    case "url": {
      const { url } = data as QRCodeContentMap["url"];
      if (!url) errors.push("URL is required");
      else if (!isValidUrl(url)) errors.push("Please enter a valid URL");
      break;
    }

    case "email": {
      const { email } = data as QRCodeContentMap["email"];
      if (!email) errors.push("Email is required");
      else if (!isValidEmail(email)) errors.push("Please enter a valid email address");
      break;
    }

    case "phone": {
      const { phone } = data as QRCodeContentMap["phone"];
      if (!phone) errors.push("Phone number is required");
      else if (!isValidPhone(phone)) errors.push("Please enter a valid phone number");
      break;
    }

    case "sms": {
      const { phone } = data as QRCodeContentMap["sms"];
      if (!phone) errors.push("Phone number is required");
      else if (!isValidPhone(phone)) errors.push("Please enter a valid phone number");
      break;
    }

    case "vcard": {
      const vcard = data as QRCodeContentMap["vcard"];
      if (!vcard.firstName) errors.push("First name is required");
      if (!vcard.lastName) errors.push("Last name is required");
      if (vcard.email && !isValidEmail(vcard.email)) errors.push("Please enter a valid email address");
      if (vcard.phone && !isValidPhone(vcard.phone)) errors.push("Please enter a valid phone number");
      if (vcard.website && !isValidUrl(vcard.website)) errors.push("Please enter a valid website URL");
      break;
    }

    case "event": {
      const event = data as QRCodeContentMap["event"];
      if (!event.title) errors.push("Event title is required");
      if (!event.startDate) errors.push("Start date is required");
      break;
    }
  }

  return { isValid: errors.length === 0, errors };
}

function isValidUrl(url: string): boolean {
  try {
    const parsed = new URL(url.startsWith("http") ? url : `https://${url}`);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function isValidPhone(phone: string): boolean {
  return /^\+?[\d\s\-()]{10,}$/.test(phone);
}
