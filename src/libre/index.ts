// Entry point propio de la versión estilo libre.
// Render: npx remotion render src/libre/index.ts ReelLibre <salida.mp4>
import { registerRoot } from "remotion";
import { LibreRoot } from "./Root";

registerRoot(LibreRoot);
