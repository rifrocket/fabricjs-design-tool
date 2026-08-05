import type { ReactElement } from "react";
import { Group } from "fabric";
import type { FabricObject } from "fabric";
import { getObjectId, resolveObjectTypeId } from "@rifrocket/fabricjs-design-tool";
import { useEditor, useEditorState } from "@rifrocket/fdt-react";

function HierarchyNode({ object, depth }: { object: FabricObject; depth: number }): ReactElement {
  const engine = useEditor();
  const children = object instanceof Group ? object.getObjects() : [];

  return (
    <li>
      <button type="button" onClick={() => engine.selection.select(object)} style={{ paddingLeft: depth * 14 }}>
        {resolveObjectTypeId(object)}
      </button>
      {children.length > 0 && (
        <ul>
          {children.map((child) => (
            <HierarchyNode key={getObjectId(child)} object={child} depth={depth + 1} />
          ))}
        </ul>
      )}
    </li>
  );
}

export function HierarchyPanel(): ReactElement {
  const engine = useEditor();
  useEditorState((state) => state.objectIds);
  const objects = engine.layers.getObjects();

  return (
    <div>
      <p>Object hierarchy</p>
      {objects.length === 0 ? (
        <p>No objects yet.</p>
      ) : (
        <ul>
          {objects.map((object) => (
            <HierarchyNode key={getObjectId(object)} object={object} depth={0} />
          ))}
        </ul>
      )}
    </div>
  );
}
