import { z } from "zod";

// Props del reel yapping (una persona hablando a cámara). TODO lo que cambia por video vive acá
// (en Root.tsx): Reel.tsx no se edita. Cámara quieta, cortes secos: sin escenas ni zoom.
export const ReelPropsSchema = z.object({
  brand: z.string().default("default"), // <id> = carpeta en marcas/ (si no existe, marca por defecto)
  videoSrc: z.string(), // ediciones/<proyecto>/clip_edit.mp4
  captionsSrc: z.string(), // ediciones/<proyecto>/clip_edit_captions.json
  bgMusicSrc: z.string().default(""), // opcional, muy sutil (vol 0.02)
  portadaTitulo: z.string().default(""), // portada (frames 0-1, tapa del feed). "\n" = salto de línea
  portadaLinea2: z.string().default(""), // segunda línea, en el color destacado de la marca
  portadaBgMs: z.number().optional(), // frame del video que se usa de fondo de la portada
  hookText: z.string(), // cartel de gancho de los primeros segundos ("" = sin cartel)
  titleCardDurationMs: z.number().default(5000),
  clicksMs: z.array(z.number()).default([]), // clicks sutiles en 3-4 frases clave (ms del clip)
  durationSeconds: z.number(),
});

export type ReelProps = z.infer<typeof ReelPropsSchema>;
