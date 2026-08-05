import { useState } from "react";
import type { ReactElement } from "react";
import type {
  CornerDotType,
  CornerSquareType,
  DotType,
  ErrorCorrectionLevel,
  Gradient,
  GradientType,
  QRCodeStyleOptions,
  ShapeType,
} from "@rifrocket/fdt-plugin-qrcode";

const DOT_TYPES: DotType[] = ["square", "dots", "rounded", "classy", "classy-rounded", "extra-rounded"];
const CORNER_TYPES: (CornerSquareType | CornerDotType)[] = [
  "dot",
  "square",
  "dots",
  "rounded",
  "classy",
  "classy-rounded",
  "extra-rounded",
];
const SHAPES: ShapeType[] = ["square", "circle"];
const ERROR_CORRECTION_LEVELS: ErrorCorrectionLevel[] = ["L", "M", "Q", "H"];
const GRADIENT_TYPES: GradientType[] = ["linear", "radial"];

interface ColorOrGradientState {
  mode: "color" | "gradient";
  transparent: boolean;
  color: string;
  gradientType: GradientType;
  gradientRotation: number;
  gradientStart: string;
  gradientEnd: string;
}

const defaultColorState = (color: string): ColorOrGradientState => ({
  mode: "color",
  transparent: false,
  color,
  gradientType: "linear",
  gradientRotation: 0,
  gradientStart: color,
  gradientEnd: "#000000",
});

export interface QRStyleFormState {
  shape: ShapeType;
  margin: number;
  errorCorrectionLevel: ErrorCorrectionLevel;
  dotsType: DotType;
  dots: ColorOrGradientState;
  cornersSquareType: CornerSquareType;
  cornersSquare: ColorOrGradientState;
  cornersDotType: CornerDotType;
  cornersDot: ColorOrGradientState;
  background: ColorOrGradientState;
  logoImage: string | null;
  logoImageSize: number;
  logoMargin: number;
  logoHideBackgroundDots: boolean;
}

export const DEFAULT_QR_STYLE_STATE: QRStyleFormState = {
  shape: "square",
  margin: 10,
  errorCorrectionLevel: "Q",
  dotsType: "square",
  dots: defaultColorState("#000000"),
  cornersSquareType: "square",
  cornersSquare: defaultColorState("#000000"),
  cornersDotType: "square",
  cornersDot: defaultColorState("#000000"),
  background: defaultColorState("#ffffff"),
  logoImage: null,
  logoImageSize: 0.3,
  logoMargin: 8,
  logoHideBackgroundDots: true,
};

function toColorOrGradient(state: ColorOrGradientState): { color?: string; gradient?: Gradient } {
  if (state.transparent) return { color: "transparent" };
  if (state.mode === "color") return { color: state.color };
  return {
    gradient: {
      type: state.gradientType,
      rotation: (state.gradientRotation * Math.PI) / 180,
      colorStops: [
        { offset: 0, color: state.gradientStart },
        { offset: 1, color: state.gradientEnd },
      ],
    },
  };
}

// Mirrors @rifrocket/fdt-plugin-qrcode's QRCodeStyleOptions groups directly — this is the bridge
// between the dialog's flat form state and the nested shape generateQRCodeSVG/addObjectOfType expect.
export function buildQRStyleOptions(state: QRStyleFormState): QRCodeStyleOptions {
  return {
    margin: state.margin,
    shape: state.shape,
    qrOptions: { errorCorrectionLevel: state.errorCorrectionLevel },
    dotsOptions: { type: state.dotsType, ...toColorOrGradient(state.dots) },
    cornersSquareOptions: { type: state.cornersSquareType, ...toColorOrGradient(state.cornersSquare) },
    cornersDotOptions: { type: state.cornersDotType, ...toColorOrGradient(state.cornersDot) },
    backgroundOptions: toColorOrGradient(state.background),
    ...(state.logoImage
      ? {
          image: state.logoImage,
          imageOptions: {
            imageSize: state.logoImageSize,
            margin: state.logoMargin,
            hideBackgroundDots: state.logoHideBackgroundDots,
          },
        }
      : {}),
  };
}

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

const LABEL_CLASS = "flex flex-col gap-1 text-xs text-fdt-fg-muted";
const SELECT_CLASS =
  "rounded-md border border-fdt-border bg-fdt-bg px-2.5 py-1.5 text-sm text-fdt-fg outline-none focus:border-fdt-accent";
const COLOR_INPUT_CLASS = "h-7 w-11 cursor-pointer rounded border border-fdt-border bg-fdt-bg";

function StyleSelect<T extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: T;
  options: readonly T[];
  onChange: (value: T) => void;
}): ReactElement {
  return (
    <label className={LABEL_CLASS}>
      {label}
      <select value={value} onChange={(e) => onChange(e.target.value as T)} className={SELECT_CLASS}>
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </label>
  );
}

function StyleSlider({
  label,
  value,
  min,
  max,
  step = 1,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (value: number) => void;
}): ReactElement {
  return (
    <label className={LABEL_CLASS}>
      <span className="flex items-center justify-between gap-2">
        <span>{label}</span>
        <span>{value}</span>
      </span>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="accent-fdt-accent"
      />
    </label>
  );
}

const CHECKERBOARD_STYLE = {
  backgroundImage:
    "linear-gradient(45deg, #80808055 25%, transparent 25%), linear-gradient(-45deg, #80808055 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #80808055 75%), linear-gradient(-45deg, transparent 75%, #80808055 75%)",
  backgroundSize: "8px 8px",
  backgroundPosition: "0 0, 0 4px, 4px -4px, -4px 0",
};

function ColorOrGradientControl({
  label,
  value,
  onChange,
  allowTransparent,
}: {
  label: string;
  value: ColorOrGradientState;
  onChange: (value: ColorOrGradientState) => void;
  allowTransparent?: boolean;
}): ReactElement {
  return (
    <div className="flex flex-col gap-1.5 rounded-md border border-fdt-border p-2">
      <div className="flex items-center justify-between gap-2 text-xs text-fdt-fg-muted">
        <span>{label}</span>
        <div className="flex items-center gap-2">
          {allowTransparent && (
            <label className="flex items-center gap-1">
              <input
                type="checkbox"
                checked={value.transparent}
                onChange={(e) => onChange({ ...value, transparent: e.target.checked })}
              />
              Transparent
            </label>
          )}
          <label className="flex items-center gap-1">
            <input
              type="checkbox"
              checked={value.mode === "gradient"}
              disabled={value.transparent}
              onChange={(e) => onChange({ ...value, mode: e.target.checked ? "gradient" : "color" })}
            />
            Gradient
          </label>
        </div>
      </div>
      {value.transparent ? (
        <div className={`${COLOR_INPUT_CLASS} cursor-default`} style={CHECKERBOARD_STYLE} title="Transparent" />
      ) : value.mode === "color" ? (
        <input
          type="color"
          value={value.color}
          onChange={(e) => onChange({ ...value, color: e.target.value })}
          className={COLOR_INPUT_CLASS}
        />
      ) : (
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={value.gradientStart}
              onChange={(e) => onChange({ ...value, gradientStart: e.target.value })}
              className={COLOR_INPUT_CLASS}
            />
            <input
              type="color"
              value={value.gradientEnd}
              onChange={(e) => onChange({ ...value, gradientEnd: e.target.value })}
              className={COLOR_INPUT_CLASS}
            />
            <select
              value={value.gradientType}
              onChange={(e) => onChange({ ...value, gradientType: e.target.value as GradientType })}
              className={`${SELECT_CLASS} flex-1`}
            >
              {GRADIENT_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>
          {value.gradientType === "linear" && (
            <StyleSlider
              label="Rotation"
              value={value.gradientRotation}
              min={0}
              max={360}
              onChange={(rotation) => onChange({ ...value, gradientRotation: rotation })}
            />
          )}
        </div>
      )}
    </div>
  );
}

export function useQRStyleState(): [QRStyleFormState, (updater: (state: QRStyleFormState) => QRStyleFormState) => void] {
  const [state, setState] = useState<QRStyleFormState>(DEFAULT_QR_STYLE_STATE);
  return [state, setState];
}

export function QRStyleFields({
  state,
  onChange,
}: {
  state: QRStyleFormState;
  onChange: (updater: (state: QRStyleFormState) => QRStyleFormState) => void;
}): ReactElement {
  const set = <K extends keyof QRStyleFormState>(key: K, value: QRStyleFormState[K]) =>
    onChange((prev) => ({ ...prev, [key]: value }));

  const handleLogoUpload = async (file: File | undefined) => {
    if (!file) {
      set("logoImage", null);
      return;
    }
    set("logoImage", await readFileAsDataUrl(file));
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="grid grid-cols-2 gap-3">
        <StyleSelect label="Shape" value={state.shape} options={SHAPES} onChange={(v) => set("shape", v)} />
        <StyleSelect
          label="Error correction"
          value={state.errorCorrectionLevel}
          options={ERROR_CORRECTION_LEVELS}
          onChange={(v) => set("errorCorrectionLevel", v)}
        />
      </div>

      <StyleSlider label="Margin" value={state.margin} min={0} max={40} onChange={(v) => set("margin", v)} />

      <div className="grid grid-cols-2 gap-3">
        <StyleSelect label="Dot style" value={state.dotsType} options={DOT_TYPES} onChange={(v) => set("dotsType", v)} />
        <StyleSelect
          label="Corner square style"
          value={state.cornersSquareType}
          options={CORNER_TYPES as CornerSquareType[]}
          onChange={(v) => set("cornersSquareType", v)}
        />
      </div>
      <StyleSelect
        label="Corner dot style"
        value={state.cornersDotType}
        options={CORNER_TYPES as CornerDotType[]}
        onChange={(v) => set("cornersDotType", v)}
      />

      <ColorOrGradientControl label="Dots" value={state.dots} onChange={(v) => set("dots", v)} />
      <ColorOrGradientControl label="Corner squares" value={state.cornersSquare} onChange={(v) => set("cornersSquare", v)} />
      <ColorOrGradientControl label="Corner dots" value={state.cornersDot} onChange={(v) => set("cornersDot", v)} />
      <ColorOrGradientControl
        label="Background"
        value={state.background}
        onChange={(v) => set("background", v)}
        allowTransparent
      />

      <div className="flex flex-col gap-2 rounded-md border border-fdt-border p-2">
        <label className="flex flex-col gap-1 text-xs text-fdt-fg-muted">
          Logo
          <input
            type="file"
            accept="image/*"
            onChange={(e) => void handleLogoUpload(e.target.files?.[0])}
            className="text-xs"
          />
        </label>
        {state.logoImage && (
          <>
            <StyleSlider
              label="Logo size"
              value={state.logoImageSize}
              min={0.1}
              max={0.5}
              step={0.05}
              onChange={(v) => set("logoImageSize", v)}
            />
            <StyleSlider label="Logo margin" value={state.logoMargin} min={0} max={30} onChange={(v) => set("logoMargin", v)} />
            <label className="flex items-center gap-1.5 text-xs text-fdt-fg-muted">
              <input
                type="checkbox"
                checked={state.logoHideBackgroundDots}
                onChange={(e) => set("logoHideBackgroundDots", e.target.checked)}
              />
              Hide dots behind logo
            </label>
          </>
        )}
      </div>
    </div>
  );
}
