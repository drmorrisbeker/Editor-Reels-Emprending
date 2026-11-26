// Carga las marcas de la carpeta `marcas/` en tiempo de bundle (webpack require.context).
// Agregar una marca = crear `marcas/<id>/marca.json`. No hay que tocar este archivo.
import type React from "react";
import { DEFAULT_BRAND, type Brand, type BrandFile } from "./brand";

type Ctx = { keys(): string[]; (key: string): unknown };
type WebpackRequire = { context: (dir: string, recursive: boolean, re: RegExp) => Ctx };
const req = require as unknown as WebpackRequire;

// Solo marca.json de primer nivel, archivos de la marca (logo, fuentes) y Portada.tsx propia.
const jsons = req.context("../marcas", true, /^\.\/[^/]+\/marca\.json$/);
const assets = req.context("../marcas", true, /^\.\/[^/]+\/(?:[^/]+\/)?[^/]+\.(?:png|jpe?g|webp|svg|ttf|otf|woff2?)$/i);
const portadas = req.context("../marcas", true, /^\.\/[^/]+\/Portada\.tsx$/);

const asUrl = (m: unknown): string =>
  typeof m === "string" ? m : ((m as { default?: string })?.default ?? "");

const asset = (id: string, file: string): string | undefined => {
  const key = `./${id}/${file.replace(/^\.\//, "")}`;
  return assets.keys().includes(key) ? asUrl(assets(key)) : undefined;
};

export const marcasDisponibles = (): string[] =>
  jsons.keys().map((k) => k.split("/")[1]).filter((id) => id !== "ejemplo");

export const getBrand = (id: string | undefined): Brand => {
  const key = `./${id}/marca.json`;
  if (!id || !jsons.keys().includes(key)) return DEFAULT_BRAND;
  const raw = jsons(key) as BrandFile | { default: BrandFile };
  const f: BrandFile = (raw as { default?: BrandFile }).default ?? (raw as BrandFile);
  return {
    ...DEFAULT_BRAND,
    ...Object.fromEntries(Object.entries(f).filter(([, v]) => v !== undefined && v !== "")),
    id,
    nombre: f.nombre ?? id,
    logoImgUrl: f.logoImg ? asset(id, f.logoImg) : undefined,
    googleFonts: f.googleFonts ?? [],
    localFonts: (f.localFonts ?? [])
      .map((lf) => ({ family: lf.family, url: asset(id, lf.file) ?? "", weight: lf.weight, style: lf.style }))
      .filter((lf) => lf.url),
    portada: f.portada ?? "default",
  } as Brand;
};

export type PortadaProps = { titulo?: string; linea2?: string; bgSrc?: string; brand: Brand };

/** Portada propia de la marca (marcas/<id>/Portada.tsx, export `Portada`), si existe. */
export const getPortadaPropia = (id: string): React.FC<PortadaProps> | undefined => {
  const key = `./${id}/Portada.tsx`;
  if (!portadas.keys().includes(key)) return undefined;
  return (portadas(key) as { Portada?: React.FC<PortadaProps> }).Portada;
};
