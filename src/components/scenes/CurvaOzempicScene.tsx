import { AbsoluteFill, Audio, interpolate, staticFile, useCurrentFrame, useVideoConfig } from "remotion";

export const CurvaOzempicScene: React.FC<{ fase: "bajada" | "rebote" }> = ({ fase }) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();

  const fadeIn  = interpolate(frame, [0, 4], [0, 1], { extrapolateRight: "clamp" });
  const fadeOut = interpolate(frame, [durationInFrames - 10, durationInFrames], [1, 0], { extrapolateLeft: "clamp" });
  const opacity = Math.min(fadeIn, fadeOut);

  const progress = interpolate(frame, [6, durationInFrames - 12], [0, 1], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });

  const W = 820;
  const H = 340;
  const PL = 50; // padding left (for Y axis)
  const PT = 24; // padding top
  const PB = 44; // padding bottom

  const labelAlpha = interpolate(frame, [4, 16], [0, 1], { extrapolateRight: "clamp" });
  const clipW = interpolate(progress, [0, 1], [0, W + 40]);

  // Bajada: high (top-left) to low (bottom-right)
  const bajadaPath = `M ${PL},${PT} C ${PL + 240},${PT} ${W - 200},${H - PB} ${W},${H - PB}`;

  // Rebote scene: dimmed first half + animated rebound from midpoint
  const midX = W / 2;
  const dimmedHalf = `M ${PL},${PT} C ${PL + 140},${PT} ${midX - 80},${H - PB} ${midX},${H - PB}`;
  const reboundPath = `M ${midX},${H - PB} C ${midX + 140},${H - PB} ${W - 180},${PT} ${W},${PT}`;
  const reboteClipW = interpolate(progress, [0, 1], [0, W / 2 + 40]);

  const endAlpha = interpolate(progress, [0.78, 1], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  return (
    <AbsoluteFill style={{ backgroundColor: "#f5e9d2", opacity }}>
      <Audio src={staticFile("sfx/woosh.mp3")} volume={0.18} />

      <AbsoluteFill style={{
        justifyContent: "center",
        alignItems: "center",
        flexDirection: "column",
        gap: 28,
        padding: "0 80px",
      }}>
        <div style={{
          fontFamily: "Inter, sans-serif",
          fontWeight: 900,
          fontSize: 66,
          color: "#162a3e",
          letterSpacing: "-0.02em",
          opacity: labelAlpha,
          textAlign: "center",
        }}>
          {fase === "bajada" ? "CON OZEMPIC" : "AL SUSPENDERLO"}
        </div>

        <svg width={W + 60} height={H + 60} viewBox={`-30 -20 ${W + 60} ${H + 60}`} overflow="visible">
          <defs>
            {fase === "bajada" ? (
              <clipPath id="ozempic-bajada-clip">
                <rect x={PL - 10} y={PT - 30} width={clipW} height={H + 60} />
              </clipPath>
            ) : (
              <clipPath id="ozempic-rebote-clip">
                <rect x={midX - 4} y={PT - 30} width={reboteClipW} height={H + 60} />
              </clipPath>
            )}
          </defs>

          {/* Y-axis */}
          <line x1={PL} y1={PT - 10} x2={PL} y2={H - PB + 10} stroke="rgba(22,42,62,0.25)" strokeWidth={3} />
          {/* X-axis */}
          <line x1={PL} y1={H - PB} x2={W} y2={H - PB} stroke="rgba(22,42,62,0.25)" strokeWidth={3} />

          {/* PESO label */}
          <text
            x={PL - 14}
            y={(H - PB + PT) / 2}
            fontFamily="Inter, sans-serif"
            fontWeight={800}
            fontSize={24}
            fill="rgba(22,42,62,0.45)"
            textAnchor="middle"
            transform={`rotate(-90, ${PL - 14}, ${(H - PB + PT) / 2})`}
          >PESO</text>

          {/* tiempo label */}
          <text
            x={W / 2}
            y={H + 20}
            fontFamily="Inter, sans-serif"
            fontWeight={600}
            fontSize={22}
            fill="rgba(22,42,62,0.35)"
            textAnchor="middle"
          >tiempo →</text>

          {fase === "bajada" ? (
            <>
              {/* Start dot */}
              <circle cx={PL} cy={PT} r={9} fill="#b18060" opacity={labelAlpha} />
              {/* "PESO ALTO" at start */}
              <text x={PL + 16} y={PT + 6} fontFamily="Inter, sans-serif" fontWeight={700} fontSize={26} fill="rgba(22,42,62,0.55)" opacity={labelAlpha}>
                PESO ALTO
              </text>

              {/* Descending curve */}
              <path
                d={bajadaPath}
                stroke="#b18060"
                strokeWidth={9}
                fill="none"
                strokeLinecap="round"
                clipPath="url(#ozempic-bajada-clip)"
              />

              {/* End dot + label */}
              <circle cx={W} cy={H - PB} r={9} fill="#b18060" opacity={endAlpha} />
              <text
                x={W - 14}
                y={H - PB - 20}
                fontFamily="Inter, sans-serif"
                fontWeight={900}
                fontSize={42}
                fill="#b18060"
                textAnchor="end"
                opacity={endAlpha}
              >PESO ↓</text>
            </>
          ) : (
            <>
              {/* Dimmed descent half */}
              <path
                d={dimmedHalf}
                stroke="rgba(22,42,62,0.2)"
                strokeWidth={9}
                fill="none"
                strokeLinecap="round"
              />

              {/* SUSPENDE vertical dashed line */}
              <line
                x1={midX}
                y1={PT - 10}
                x2={midX}
                y2={H - PB + 10}
                stroke="#b18060"
                strokeWidth={3}
                strokeDasharray="10 7"
                opacity={0.75}
              />
              <text
                x={midX + 12}
                y={(H - PB + PT) / 2 + 8}
                fontFamily="Inter, sans-serif"
                fontWeight={700}
                fontSize={24}
                fill="#b18060"
              >SUSPENDE</text>

              {/* Rebound curve */}
              <path
                d={reboundPath}
                stroke="#FF6B6B"
                strokeWidth={9}
                fill="none"
                strokeLinecap="round"
                clipPath="url(#ozempic-rebote-clip)"
              />

              {/* End dot */}
              <circle cx={W} cy={PT} r={9} fill="#FF6B6B" opacity={endAlpha} />
              {/* EFECTO REBOTE label */}
              <text
                x={W - 14}
                y={PT + 44}
                fontFamily="Inter, sans-serif"
                fontWeight={900}
                fontSize={38}
                fill="#FF6B6B"
                textAnchor="end"
                opacity={endAlpha}
              >EFECTO REBOTE ↑</text>
            </>
          )}
        </svg>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
