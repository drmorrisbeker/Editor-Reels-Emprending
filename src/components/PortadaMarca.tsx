import type { Brand } from "../brand";
import { getPortadaPropia } from "../marcas";
import { Portada } from "./Portada";

// Elige la portada según la marca:
//   "default" → la portada de la plantilla (components/Portada.tsx)
//   "propia"  → marcas/<id>/Portada.tsx (si no existe, cae a la default)
//   "ninguna" → no dibuja nada
export const PortadaMarca: React.FC<{ titulo: string; linea2?: string; brand: Brand }> = ({ titulo, linea2, brand }) => {
  if (brand.portada === "ninguna") return null;
  const Propia = brand.portada === "propia" ? getPortadaPropia(brand.id) : undefined;
  const C = Propia ?? Portada;
  return <C titulo={titulo} linea2={linea2} brand={brand} />;
};

export const usaPortada = (brand: Brand) => brand.portada !== "ninguna";
