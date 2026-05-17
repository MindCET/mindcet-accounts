import { Audio } from "@remotion/media";
import {
  AbsoluteFill,
  Easing,
  Sequence,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

const script = [
  { from: 0, to: 84, text: "לא תאמינו מה מצאתי היום" },
  { from: 84, to: 156, text: "קלוד קוד ורימושן עובדים יחד" },
  { from: 156, to: 246, text: "ובכמה רגעים אפשר להפוך רעיון לסרטון אמיתי" },
  { from: 246, to: 330, text: "הכול בעברית, עם כתוביות ותנועה" },
  { from: 330, to: 420, text: "וזה מרגיש כמו מוצר מוכן" },
];

const colors = {
  ink: "#111318",
  paper: "#f5f0e8",
  red: "#e34f3f",
  cyan: "#39a7b7",
  green: "#8bbf55",
  yellow: "#f3c852",
  purple: "#6854d8",
};

const fit = (value: number, input: [number, number], output: [number, number]) =>
  interpolate(value, input, output, {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.bezier(0.16, 1, 0.3, 1),
  });

const Subtitle = () => {
  const frame = useCurrentFrame();
  const active = script.find((line) => frame >= line.from && frame < line.to);
  const lineFrame = active ? frame - active.from : 0;
  const opacity = active ? fit(lineFrame, [0, 10], [0, 1]) : 0;
  const y = active ? fit(lineFrame, [0, 14], [28, 0]) : 28;

  return (
    <div
      style={{
        position: "absolute",
        bottom: 72,
        left: 230,
        right: 230,
        direction: "rtl",
        opacity,
        transform: `translateY(${y}px)`,
        fontSize: 54,
        lineHeight: 1.22,
        fontWeight: 900,
        color: colors.paper,
        textAlign: "center",
        textShadow: "0 4px 0 rgba(0,0,0,0.24)",
        background: "rgba(17,19,24,0.82)",
        border: `4px solid ${colors.yellow}`,
        borderRadius: 18,
        padding: "22px 46px 26px",
      }}
    >
      {active?.text}
    </div>
  );
};

const Presenter = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const entrance = spring({ frame, fps, config: { damping: 16, stiffness: 90 } });
  const mouth = Math.abs(Math.sin(frame * 0.42)) * 18 + 8;
  const hand = Math.sin(frame * 0.14) * 8;
  const cameraPulse = fit(Math.sin(frame * 0.08), [-1, 1], [0.88, 1]);

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        transform: `translateX(${fit(entrance, [0, 1], [-220, 0])}px)`,
      }}
    >
      <div
        style={{
          position: "absolute",
          top: 112,
          left: 130,
          width: 390,
          height: 390,
          borderRadius: "50%",
          background: "#f1b68e",
          border: `12px solid ${colors.ink}`,
          boxShadow: "18px 22px 0 rgba(17,19,24,0.14)",
        }}
      />
      <div
        style={{
          position: "absolute",
          top: 94,
          left: 154,
          width: 342,
          height: 122,
          borderRadius: "180px 180px 48px 48px",
          background: colors.ink,
        }}
      />
      {[235, 385].map((left) => (
        <div
          key={left}
          style={{
            position: "absolute",
            top: 272,
            left,
            width: 34,
            height: 34,
            borderRadius: "50%",
            background: colors.ink,
          }}
        />
      ))}
      <div
        style={{
          position: "absolute",
          top: 352,
          left: 290,
          width: 82,
          height: mouth,
          borderRadius: 40,
          background: colors.ink,
        }}
      />
      <div
        style={{
          position: "absolute",
          top: 522,
          left: 96,
          width: 455,
          height: 420,
          borderRadius: "130px 130px 44px 44px",
          background: colors.red,
          border: `12px solid ${colors.ink}`,
        }}
      />
      <div
        style={{
          position: "absolute",
          top: 552,
          left: 170,
          width: 310,
          height: 86,
          borderRadius: 56,
          background: colors.paper,
          border: `10px solid ${colors.ink}`,
        }}
      />
      <div
        style={{
          position: "absolute",
          top: 594 + hand,
          left: 470,
          width: 230,
          height: 92,
          borderRadius: 60,
          background: "#f1b68e",
          border: `10px solid ${colors.ink}`,
          transform: "rotate(-16deg)",
        }}
      />
      <div
        style={{
          position: "absolute",
          top: 74,
          left: 706,
          width: 138,
          height: 138,
          borderRadius: "50%",
          background: colors.ink,
          border: `10px solid ${colors.paper}`,
          transform: `scale(${cameraPulse})`,
          boxShadow: `0 0 0 18px ${colors.cyan}`,
        }}
      />
      <div
        style={{
          position: "absolute",
          top: 118,
          left: 750,
          width: 50,
          height: 50,
          borderRadius: "50%",
          background: colors.paper,
        }}
      />
    </div>
  );
};

const ProductWindow = ({
  side,
  delay,
  title,
  accent,
  rows,
}: {
  side: "left" | "right";
  delay: number;
  title: string;
  accent: string;
  rows: string[];
}) => {
  const frame = useCurrentFrame();
  const local = frame - delay;
  const progress = spring({
    frame: local,
    fps: 30,
    config: { damping: 15, stiffness: 100 },
  });

  return (
    <div
      style={{
        position: "absolute",
        top: side === "left" ? 150 : 255,
        right: side === "left" ? 640 : 112,
        width: 610,
        height: 430,
        borderRadius: 16,
        border: `8px solid ${colors.ink}`,
        background: "#fbfaf7",
        boxShadow: "18px 22px 0 rgba(17,19,24,0.16)",
        overflow: "hidden",
        transform: `translateY(${fit(progress, [0, 1], [80, 0])}px) rotate(${side === "left" ? -2 : 2}deg)`,
        opacity: fit(progress, [0, 0.8], [0, 1]),
      }}
    >
      <div
        style={{
          height: 74,
          background: accent,
          borderBottom: `8px solid ${colors.ink}`,
          display: "flex",
          alignItems: "center",
          padding: "0 28px",
          gap: 14,
          direction: "rtl",
        }}
      >
        <div style={{ fontSize: 34, fontWeight: 900, color: colors.ink }}>
          {title}
        </div>
        <div
          style={{
            marginRight: "auto",
            width: 18,
            height: 18,
            borderRadius: "50%",
            background: colors.paper,
            boxShadow: `30px 0 0 ${colors.paper}, 60px 0 0 ${colors.paper}`,
          }}
        />
      </div>
      <div style={{ padding: "34px 34px 0", direction: "rtl" }}>
        {rows.map((row, index) => {
          const rowProgress = fit(local - index * 12, [0, 18], [0, 1]);
          return (
            <div
              key={row}
              style={{
                marginBottom: 22,
                opacity: rowProgress,
                transform: `translateX(${fit(rowProgress, [0, 1], [36, 0])}px)`,
                fontSize: 28,
                fontWeight: 800,
                color: colors.ink,
                display: "flex",
                alignItems: "center",
                gap: 16,
              }}
            >
              <span
                style={{
                  width: 24,
                  height: 24,
                  borderRadius: 6,
                  background: index % 2 === 0 ? colors.green : colors.yellow,
                  border: `4px solid ${colors.ink}`,
                  flex: "0 0 auto",
                }}
              />
              {row}
            </div>
          );
        })}
      </div>
    </div>
  );
};

const Background = () => {
  const frame = useCurrentFrame();
  const sweep = fit((frame % 180) / 180, [0, 1], [-360, 2100]);

  return (
    <AbsoluteFill
      style={{
        background: colors.paper,
        overflow: "hidden",
        fontFamily:
          "'Segoe UI', Arial, 'Noto Sans Hebrew', 'Rubik', sans-serif",
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "linear-gradient(135deg, rgba(57,167,183,0.22), transparent 38%, rgba(243,200,82,0.24) 72%, rgba(227,79,63,0.18))",
        }}
      />
      <div
        style={{
          position: "absolute",
          top: 0,
          left: sweep,
          width: 210,
          height: 1200,
          background: "rgba(255,255,255,0.38)",
          transform: "rotate(18deg)",
        }}
      />
      <div
        style={{
          position: "absolute",
          top: 42,
          right: 76,
          direction: "rtl",
          color: colors.ink,
          fontSize: 42,
          fontWeight: 900,
          letterSpacing: 0,
        }}
      >
        סרטון Remotion בעברית
      </div>
    </AbsoluteFill>
  );
};

export const MyComposition = () => {
  const frame = useCurrentFrame();
  const headlineScale = spring({
    frame,
    fps: 30,
    config: { damping: 14, stiffness: 120 },
  });
  const headlineOpacity = fit(frame, [96, 126], [1, 0]);

  return (
    <AbsoluteFill>
      <Audio src={staticFile("voiceover/hebrew-discovery.mp3")} />
      <Background />
      <Sequence>
        <Presenter />
      </Sequence>
      <div
        style={{
          position: "absolute",
          top: 118,
          right: 92,
          width: 1110,
          direction: "rtl",
          opacity: headlineOpacity,
          transform: `scale(${fit(headlineScale, [0, 1], [0.82, 1])})`,
          transformOrigin: "right top",
        }}
      >
        <div
          style={{
            fontSize: 110,
            lineHeight: 1,
            fontWeight: 950,
            color: colors.ink,
            textShadow: `8px 8px 0 ${colors.yellow}`,
          }}
        >
          לא תאמינו מה מצאתי היום
        </div>
      </div>
      <ProductWindow
        side="left"
        delay={84}
        title="Claude Code"
        accent={colors.purple}
        rows={[
          "פותח רעיון מתוך שיחה",
          "כותב קומפוזיציה ב-React",
          "בודק ומרנדר בלי לצאת מהזרימה",
        ]}
      />
      <ProductWindow
        side="right"
        delay={150}
        title="Remotion"
        accent={colors.cyan}
        rows={[
          "אנימציה לפי פריימים",
          "כתוביות בעברית",
          "וידאו אמיתי מקוד",
        ]}
      />
      <div
        style={{
          position: "absolute",
          right: 166,
          bottom: 258,
          direction: "rtl",
          color: colors.ink,
          fontSize: 42,
          fontWeight: 900,
          opacity: fit(frame, [236, 270], [0, 1]),
          transform: `translateY(${fit(frame, [236, 270], [30, 0])}px)`,
        }}
      >
        רעיון + קוד + תנועה = סרטון מוכן
      </div>
      <Subtitle />
    </AbsoluteFill>
  );
};
