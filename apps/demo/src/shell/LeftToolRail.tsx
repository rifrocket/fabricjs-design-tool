import type { ReactElement } from "react";
import { useEngineOrNull } from "../engine/useEngineOrNull";
import { ShapeGallery } from "../features/shapes/ShapeGallery";
import { QRCodeDialog } from "../features/shapes/QRCodeDialog";
import { ImageUploadButton } from "../features/shapes/ImageUploadButton";
import { SvgImportButton } from "../features/shapes/SvgImportButton";
import { StampToolButton } from "../features/shapes/StampToolButton";

export function LeftToolRail(): ReactElement {
  const engine = useEngineOrNull();

  return (
    <nav
      aria-label="Tools"
      data-tour="tool-rail"
      className="flex w-14 flex-col items-center gap-0.5 overflow-y-auto border-r border-fdt-border bg-fdt-bg py-2"
    >
      {engine ? <LeftToolRailContent /> : <LeftToolRailSkeleton />}
    </nav>
  );
}

function LeftToolRailContent(): ReactElement {
  return (
    <>
      <ShapeGallery />
      <QRCodeDialog />
      <ImageUploadButton />
      <SvgImportButton />
      <div className="my-1 h-px w-8 bg-fdt-border" />
      <StampToolButton />
    </>
  );
}

function LeftToolRailSkeleton(): ReactElement {
  return (
    <>
      {Array.from({ length: 5 }).map((_, index) => (
        <div key={index} className="h-9 w-9 animate-pulse rounded-lg bg-fdt-border" />
      ))}
    </>
  );
}
