import { useCallback, useEffect, useState } from "react";
import type { ReactElement } from "react";
import { Globe, Mail, Phone, MessageCircle, User, Calendar, QrCode as QrCodeIcon, X } from "lucide-react";
import { useEditor, useFocusTrap } from "@rifrocket/fdt-react";
import { generateContentString, generateQRCodeSVG, validateContent } from "@rifrocket/fdt-plugin-qrcode";
import type { QRContentType, QRCodeContentMap } from "@rifrocket/fdt-plugin-qrcode";
import { InfoTooltip } from "../../docs/InfoTooltip";
import { QRStyleFields, buildQRStyleOptions, useQRStyleState } from "./QRStyleControls";

const CONTENT_TYPES: Array<{ value: QRContentType; label: string; Icon: typeof Globe; color: string }> = [
  { value: "url", label: "URL", Icon: Globe, color: "bg-blue-500" },
  { value: "email", label: "Email", Icon: Mail, color: "bg-emerald-500" },
  { value: "phone", label: "Phone", Icon: Phone, color: "bg-violet-500" },
  { value: "sms", label: "SMS", Icon: MessageCircle, color: "bg-orange-500" },
  { value: "vcard", label: "V-Card", Icon: User, color: "bg-indigo-500" },
  { value: "event", label: "Event", Icon: Calendar, color: "bg-rose-500" },
];

type FormState = Partial<Record<string, string>>;

const ICON_BUTTON_CLASS =
  "flex h-9 w-9 items-center justify-center rounded-lg text-fdt-fg-muted transition-colors duration-150 hover:bg-fdt-bg-elevated hover:text-fdt-fg";

const FIELD_CLASS =
  "rounded-md border border-fdt-border bg-fdt-bg px-2.5 py-1.5 text-sm text-fdt-fg outline-none focus:border-fdt-accent";

// A checkerboard, not a flat white fill, so a transparent QR background (Style tab -> Background
// -> Transparent) actually looks different from a white one in the preview.
const PREVIEW_CHECKERBOARD_STYLE = {
  backgroundColor: "#ffffff",
  backgroundImage:
    "linear-gradient(45deg, #80808033 25%, transparent 25%), linear-gradient(-45deg, #80808033 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #80808033 75%), linear-gradient(-45deg, transparent 75%, #80808033 75%)",
  backgroundSize: "16px 16px",
  backgroundPosition: "0 0, 0 8px, 8px -8px, -8px 0",
};

const DEFAULT_FORM: Record<QRContentType, FormState> = {
  url: { url: "https://github.com/rifrocket" },
  email: { email: "" },
  phone: { phone: "" },
  sms: { phone: "" },
  vcard: { firstName: "", lastName: "" },
  event: { title: "", startDate: "" },
};

function buildContentData(type: QRContentType, form: FormState): QRCodeContentMap[QRContentType] {
  switch (type) {
    case "url":
      return { url: form.url ?? "" };
    case "email":
      return { email: form.email ?? "", subject: form.subject, body: form.body };
    case "phone":
      return { phone: form.phone ?? "" };
    case "sms":
      return { phone: form.phone ?? "", message: form.message };
    case "vcard":
      return {
        firstName: form.firstName ?? "",
        lastName: form.lastName ?? "",
        organization: form.organization,
        phone: form.phone,
        email: form.email,
        website: form.website,
        address: form.address,
      };
    case "event":
      return {
        title: form.title ?? "",
        startDate: form.startDate ?? "",
        endDate: form.endDate,
        location: form.location,
        description: form.description,
      };
  }
}

// Every content type, its live SVG preview, and the eventual canvas object all go through
// the public @rifrocket/fdt-plugin-qrcode exports (generateContentString/validateContent for
// the form, generateQRCodeSVG for the preview, engine.addObjectOfType("qrcode", ...) to commit)
// — nothing here reaches into the plugin's internals.
export function QRCodeDialog(): ReactElement {
  const engine = useEditor();
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<"content" | "style">("content");
  const [contentType, setContentType] = useState<QRContentType>("url");
  const [form, setForm] = useState<FormState>(DEFAULT_FORM.url);
  const [styleState, setStyleState] = useQRStyleState();
  const styleOptions = buildQRStyleOptions(styleState);
  const [previewSvg, setPreviewSvg] = useState<string | null>(null);
  const [errors, setErrors] = useState<string[]>([]);
  // useCallback keeps a stable reference: an inline fn would re-run useFocusTrap's effect on
  // every keystroke (this form re-renders on every field edit), yanking focus out of the field mid-type.
  const handleEscape = useCallback(() => setOpen(false), []);
  const containerRef = useFocusTrap<HTMLDivElement>({ active: open, onEscape: handleEscape });

  useEffect(() => {
    if (!open) return;
    const data = buildContentData(contentType, form);
    const validation = validateContent(contentType, data);
    setErrors(validation.errors);
    if (!validation.isValid) {
      setPreviewSvg(null);
      return;
    }
    let cancelled = false;
    const content = generateContentString(contentType, data);
    generateQRCodeSVG(content, { ...styleOptions, size: 176 })
      .then((svg) => {
        if (!cancelled) setPreviewSvg(svg);
      })
      .catch(() => {
        if (!cancelled) setPreviewSvg(null);
      });
    return () => {
      cancelled = true;
    };
    // styleOptions is derived fresh from styleState every render; depending on styleState
    // directly (rather than the new styleOptions object) avoids re-running on every render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, contentType, form, styleState]);

  const setField = (key: string, value: string) => setForm((prev) => ({ ...prev, [key]: value }));

  const selectContentType = (type: QRContentType) => {
    setContentType(type);
    setForm(DEFAULT_FORM[type]);
  };

  const handleAdd = () => {
    const data = buildContentData(contentType, form);
    if (!validateContent(contentType, data).isValid) return;
    void engine.addObjectOfType("qrcode", { contentType, contentData: data, style: styleOptions });
    setOpen(false);
  };

  return (
    <>
      <button type="button" title="QR code" onClick={() => setOpen(true)} className={ICON_BUTTON_CLASS}>
        <QrCodeIcon size={17} strokeWidth={1.75} />
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div
            ref={containerRef}
            role="dialog"
            aria-modal="true"
            aria-label="Generate QR code"
            className="fdt-animate-scale-in flex max-h-[85vh] w-full max-w-2xl flex-col overflow-hidden rounded-xl border border-fdt-border bg-fdt-bg shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-fdt-border p-4">
              <div className="flex items-center gap-1.5">
                <h2 className="text-sm font-semibold text-fdt-fg">Generate QR Code</h2>
                <InfoTooltip featureKey="qrcode" />
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close"
                className="rounded p-1 text-fdt-fg-muted hover:bg-fdt-bg-elevated"
              >
                <X size={16} strokeWidth={2} />
              </button>
            </div>

            <div role="tablist" aria-label="QR code editor" className="flex border-b border-fdt-border px-4">
              {(["content", "style"] as const).map((t) => (
                <button
                  key={t}
                  type="button"
                  role="tab"
                  aria-selected={tab === t}
                  onClick={() => setTab(t)}
                  className={`px-3 py-2 text-xs font-medium capitalize transition-colors duration-150 ${
                    tab === t ? "border-b-2 border-fdt-accent text-fdt-fg" : "text-fdt-fg-muted hover:text-fdt-fg"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>

            <div className="grid flex-1 grid-cols-1 gap-5 overflow-y-auto p-4 sm:grid-cols-[1fr_180px]">
              <div className="flex flex-col gap-4">
                {tab === "content" ? (
                  <>
                    <div>
                      <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-fdt-fg-muted">Content Type</p>
                      <div className="grid grid-cols-3 gap-2">
                        {CONTENT_TYPES.map(({ value, label, Icon, color }) => (
                          <button
                            key={value}
                            type="button"
                            onClick={() => selectContentType(value)}
                            aria-pressed={contentType === value}
                            className={`flex flex-col items-center gap-1.5 rounded-lg border p-2.5 transition-colors duration-150 ${
                              contentType === value
                                ? "border-fdt-accent bg-fdt-bg-elevated"
                                : "border-fdt-border hover:border-fdt-accent"
                            }`}
                          >
                            <span className={`flex h-7 w-7 items-center justify-center rounded-full text-white ${color}`}>
                              <Icon size={15} strokeWidth={2} />
                            </span>
                            <span className="text-[11px] text-fdt-fg">{label}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    <QRContentFields type={contentType} form={form} setField={setField} />

                    {errors.length > 0 && (
                      <ul className="flex flex-col gap-0.5 text-xs text-fdt-danger">
                        {errors.map((error) => (
                          <li key={error}>{error}</li>
                        ))}
                      </ul>
                    )}
                  </>
                ) : (
                  <QRStyleFields state={styleState} onChange={setStyleState} />
                )}
              </div>

              <div className="flex flex-col items-center gap-2">
                <p className="text-xs font-semibold uppercase tracking-wide text-fdt-fg-muted">Preview</p>
                <div
                  className="flex h-[176px] w-[176px] items-center justify-center rounded-lg border border-fdt-border p-2"
                  style={PREVIEW_CHECKERBOARD_STYLE}
                >
                  {previewSvg ? (
                    // qr-code-styling's own SVG output, not user-supplied markup — safe to inline.
                    <div className="h-full w-full [&>svg]:h-full [&>svg]:w-full" dangerouslySetInnerHTML={{ __html: previewSvg }} />
                  ) : (
                    <QrCodeIcon size={32} strokeWidth={1.5} className="text-fdt-border" />
                  )}
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 border-t border-fdt-border p-4">
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-lg px-3 py-1.5 text-sm text-fdt-fg hover:bg-fdt-bg-elevated"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleAdd}
                disabled={errors.length > 0}
                className="rounded-lg bg-fdt-accent px-3 py-1.5 text-sm text-white transition-colors duration-150 hover:bg-fdt-accent-hover disabled:cursor-not-allowed disabled:opacity-40"
              >
                Add to canvas
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
  required,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  required?: boolean;
}): ReactElement {
  return (
    <label className="flex flex-col gap-1 text-xs text-fdt-fg-muted">
      {label}
      {required ? " *" : ""}
      <input type={type} value={value} onChange={(event) => onChange(event.target.value)} className={FIELD_CLASS} />
    </label>
  );
}

function QRContentFields({
  type,
  form,
  setField,
}: {
  type: QRContentType;
  form: FormState;
  setField: (key: string, value: string) => void;
}): ReactElement {
  const value = (key: string) => form[key] ?? "";

  switch (type) {
    case "url":
      return <Field label="Website URL" required value={value("url")} onChange={(v) => setField("url", v)} />;
    case "email":
      return (
        <div className="grid grid-cols-2 gap-3">
          <Field label="Email" required value={value("email")} onChange={(v) => setField("email", v)} />
          <Field label="Subject" value={value("subject")} onChange={(v) => setField("subject", v)} />
          <Field label="Message" value={value("body")} onChange={(v) => setField("body", v)} />
        </div>
      );
    case "phone":
      return <Field label="Phone number" required value={value("phone")} onChange={(v) => setField("phone", v)} />;
    case "sms":
      return (
        <div className="grid grid-cols-2 gap-3">
          <Field label="Phone number" required value={value("phone")} onChange={(v) => setField("phone", v)} />
          <Field label="Message" value={value("message")} onChange={(v) => setField("message", v)} />
        </div>
      );
    case "vcard":
      return (
        <div className="grid grid-cols-2 gap-3">
          <Field label="First name" required value={value("firstName")} onChange={(v) => setField("firstName", v)} />
          <Field label="Last name" required value={value("lastName")} onChange={(v) => setField("lastName", v)} />
          <Field label="Organization" value={value("organization")} onChange={(v) => setField("organization", v)} />
          <Field label="Phone" value={value("phone")} onChange={(v) => setField("phone", v)} />
          <Field label="Email" value={value("email")} onChange={(v) => setField("email", v)} />
          <Field label="Website" value={value("website")} onChange={(v) => setField("website", v)} />
        </div>
      );
    case "event":
      return (
        <div className="grid grid-cols-2 gap-3">
          <Field label="Title" required value={value("title")} onChange={(v) => setField("title", v)} />
          <Field label="Location" value={value("location")} onChange={(v) => setField("location", v)} />
          <Field label="Start date" required type="datetime-local" value={value("startDate")} onChange={(v) => setField("startDate", v)} />
          <Field label="End date" type="datetime-local" value={value("endDate")} onChange={(v) => setField("endDate", v)} />
        </div>
      );
  }
}
