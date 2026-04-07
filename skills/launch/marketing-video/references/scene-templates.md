# Scene Templates — Mix-and-Match LEGO Blocks

Pre-built, production-ready scene components. Pick scenes, arrange them, customize the props. Every scene follows the professional quality rules: spring damping 200 default, staggered entrances, dwell time, clamped interpolation, mobile safe zones.

**How to use:** Import any scene into your composition. Wire them together with `<TransitionSeries>`. Swap props to match your product.

---

## Shared Setup (use in every project)

```tsx
import {
  AbsoluteFill, Sequence, useCurrentFrame, useVideoConfig,
  interpolate, spring, Img, Audio, staticFile, Easing
} from "remotion";
import { TransitionSeries, linearTiming, springTiming } from "@remotion/transitions";
import { fade } from "@remotion/transitions/fade";
import { slide } from "@remotion/transitions/slide";
import { noise3D } from "@remotion/noise";
import { loadFont } from "@remotion/google-fonts/Inter";
import { loadFont as loadMono } from "@remotion/google-fonts/JetBrainsMono";

const { fontFamily } = loadFont();
const { fontFamily: mono } = loadMono();

// Brand palette — customize per project
const C = {
  bg: "#0a0a0f",
  bgAlt: "#12101a",
  primary: "#9945FF",
  accent: "#14F195",
  text: "#ffffff",
  textMuted: "rgba(255,255,255,0.6)",
  danger: "#e94560",
  warning: "#f5a623",
};

// Spring presets
const SPRING = {
  smooth: { damping: 200 },
  snappy: { damping: 20, stiffness: 200 },
  bouncy: { damping: 8 },
  heavy: { damping: 15, stiffness: 80, mass: 2 },
};
```

---

## HOOK SCENES

### 1. MetricHook — Giant number that demands attention

Best for: Opening any video with a scroll-stopping stat.

```tsx
type MetricHookProps = {
  metric: string;       // "$2.1M"
  subtitle: string;     // "settled in 30 days"
  accentColor?: string; // defaults to C.accent
};

const MetricHook: React.FC<MetricHookProps> = ({
  metric, subtitle, accentColor = C.accent,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const metricScale = spring({ frame, fps, config: SPRING.heavy });
  const subtitleProgress = spring({ frame: frame - 20, fps, config: SPRING.smooth });
  const subtitleOpacity = interpolate(subtitleProgress, [0, 1], [0, 1]);
  const subtitleY = interpolate(subtitleProgress, [0, 1], [30, 0]);

  // Breathing background glow
  const glowPulse = Math.sin(frame * 0.015) * 0.5 + 0.5;
  const glowOpacity = interpolate(glowPulse, [0, 1], [0.03, 0.08]);

  return (
    <AbsoluteFill style={{
      backgroundColor: C.bg,
      justifyContent: "center",
      alignItems: "center",
    }}>
      {/* Ambient glow */}
      <div style={{
        position: "absolute", inset: 0,
        background: `radial-gradient(ellipse at center, rgba(153,69,255,${glowOpacity}) 0%, transparent 70%)`,
      }} />

      <div style={{
        fontSize: 160, fontWeight: 900, color: accentColor,
        fontFamily, transform: `scale(${metricScale})`,
        letterSpacing: -4,
      }}>
        {metric}
      </div>
      <div style={{
        fontSize: 40, color: C.textMuted, fontFamily,
        opacity: subtitleOpacity,
        transform: `translateY(${subtitleY}px)`,
        marginTop: 16,
      }}>
        {subtitle}
      </div>
    </AbsoluteFill>
  );
};
```

---

### 2. QuestionHook — Provocative question that creates tension

Best for: Problem-Demo-Result videos, social content.

```tsx
type QuestionHookProps = {
  line1: string;  // "What if AI agents"
  line2: string;  // "could pay each other?"
  emphasisWord?: string; // word to highlight in line2
};

const QuestionHook: React.FC<QuestionHookProps> = ({
  line1, line2, emphasisWord,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const line1Progress = spring({ frame, fps, config: SPRING.smooth });
  const line2Progress = spring({ frame: frame - 15, fps, config: SPRING.smooth });

  const renderLine2 = () => {
    if (!emphasisWord || !line2.includes(emphasisWord)) {
      return line2;
    }
    const parts = line2.split(emphasisWord);
    const highlightScale = spring({ frame: frame - 30, fps, config: SPRING.snappy });
    return (
      <>
        {parts[0]}
        <span style={{ position: "relative", display: "inline" }}>
          <span style={{
            position: "absolute", bottom: 0, left: -4, right: -4,
            height: "35%", backgroundColor: C.primary, opacity: 0.3,
            transform: `scaleX(${highlightScale})`, transformOrigin: "left",
          }} />
          <span style={{ position: "relative" }}>{emphasisWord}</span>
        </span>
        {parts[1]}
      </>
    );
  };

  return (
    <AbsoluteFill style={{
      backgroundColor: C.bg, justifyContent: "center",
      alignItems: "center", padding: 80,
    }}>
      <div style={{
        fontSize: 64, fontWeight: 600, color: C.textMuted, fontFamily,
        textAlign: "center",
        opacity: interpolate(line1Progress, [0, 1], [0, 1]),
        transform: `translateY(${interpolate(line1Progress, [0, 1], [20, 0])}px)`,
      }}>
        {line1}
      </div>
      <div style={{
        fontSize: 72, fontWeight: 800, color: C.text, fontFamily,
        textAlign: "center", marginTop: 12,
        opacity: interpolate(line2Progress, [0, 1], [0, 1]),
        transform: `translateY(${interpolate(line2Progress, [0, 1], [20, 0])}px)`,
      }}>
        {renderLine2()}
      </div>
    </AbsoluteFill>
  );
};
```

---

### 3. POVHook — TikTok/Reels style "POV:" opener (vertical)

Best for: Vertical social clips (9:16). Pattern interrupt.

```tsx
type POVHookProps = {
  povText: string;    // "Your Solana app just got 10x faster"
  emoji?: string;     // optional emoji before text
};

const POVHook: React.FC<POVHookProps> = ({ povText, emoji }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const labelProgress = spring({ frame, fps, config: SPRING.snappy });
  const textProgress = spring({ frame: frame - 10, fps, config: SPRING.smooth });

  return (
    <AbsoluteFill style={{
      backgroundColor: C.bg, justifyContent: "center",
      alignItems: "center", padding: 60,
    }}>
      {/* POV label */}
      <div style={{
        fontSize: 28, fontWeight: 700, color: C.primary, fontFamily,
        letterSpacing: 6, textTransform: "uppercase",
        opacity: interpolate(labelProgress, [0, 1], [0, 1]),
        transform: `scale(${labelProgress})`,
        marginBottom: 24,
      }}>
        POV:
      </div>

      {/* Main text */}
      <div style={{
        fontSize: 52, fontWeight: 800, color: C.text, fontFamily,
        textAlign: "center", lineHeight: 1.3,
        opacity: interpolate(textProgress, [0, 1], [0, 1]),
        transform: `translateY(${interpolate(textProgress, [0, 1], [40, 0])}px)`,
      }}>
        {emoji && <span style={{ fontSize: 64 }}>{emoji}</span>}
        {emoji && <br />}
        {povText}
      </div>
    </AbsoluteFill>
  );
};
```

---

## PROBLEM SCENES

### 4. ProblemStatement — Text reveals the pain point

Best for: Scene 2 of Problem-Demo-Result. Sets up the tension.

```tsx
type ProblemStatementProps = {
  lines: string[];  // ["AI agents can't pay each other", "without a human co-signer."]
  tint?: "red" | "neutral";
};

const ProblemStatement: React.FC<ProblemStatementProps> = ({
  lines, tint = "red",
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const bgTint = tint === "red"
    ? "linear-gradient(180deg, rgba(233,69,96,0.05) 0%, rgba(10,10,15,1) 100%)"
    : `linear-gradient(180deg, ${C.bgAlt} 0%, ${C.bg} 100%)`;

  return (
    <AbsoluteFill style={{ background: bgTint, justifyContent: "center", padding: 100 }}>
      {lines.map((line, i) => {
        const progress = spring({
          frame: frame - i * 12,
          fps,
          config: SPRING.smooth,
        });
        return (
          <div key={i} style={{ overflow: "hidden", marginBottom: 8 }}>
            <div style={{
              fontSize: 56, fontWeight: 700, color: C.text, fontFamily,
              lineHeight: 1.3,
              transform: `translateY(${(1 - progress) * 100}%)`,
              opacity: progress,
            }}>
              {line}
            </div>
          </div>
        );
      })}
    </AbsoluteFill>
  );
};
```

---

### 5. BeforeSplit — "The Old Way" with pain indicators

Best for: Before/After videos. Left side of comparison.

```tsx
type BeforeSplitProps = {
  title?: string;         // "The old way"
  painPoints: string[];   // ["$4.50 in fees", "3-5 day settlement", "Manual reconciliation"]
  screenshot?: string;    // optional staticFile path
};

const BeforeSplit: React.FC<BeforeSplitProps> = ({
  title = "The old way", painPoints, screenshot,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const titleProgress = spring({ frame, fps, config: SPRING.smooth });

  return (
    <AbsoluteFill style={{
      backgroundColor: C.bg,
      filter: "saturate(0.4) brightness(0.85)",
    }}>
      {/* Red tint overlay */}
      <AbsoluteFill style={{
        background: "linear-gradient(180deg, rgba(233,69,96,0.08) 0%, transparent 60%)",
      }} />

      <div style={{ padding: 80, display: "flex", flexDirection: "column", gap: 32 }}>
        <div style={{
          fontSize: 28, fontWeight: 600, color: C.danger, fontFamily,
          letterSpacing: 4, textTransform: "uppercase",
          opacity: titleProgress,
        }}>
          {title}
        </div>

        {screenshot && (
          <Img src={staticFile(screenshot)} style={{
            width: "80%", borderRadius: 12, border: "1px solid rgba(255,255,255,0.1)",
            opacity: spring({ frame: frame - 15, fps, config: SPRING.smooth }),
          }} />
        )}

        {painPoints.map((point, i) => {
          const p = spring({ frame: frame - 20 - i * 10, fps, config: SPRING.smooth });
          return (
            <div key={i} style={{
              display: "flex", alignItems: "center", gap: 16,
              opacity: p,
              transform: `translateX(${(1 - p) * -30}px)`,
            }}>
              <div style={{
                width: 8, height: 8, borderRadius: "50%",
                backgroundColor: C.danger,
              }} />
              <div style={{ fontSize: 36, color: C.textMuted, fontFamily }}>
                {point}
              </div>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};
```

---

## DEMO SCENES

### 6. ProductScreenshot — Animated screenshot with callout arrows

Best for: Showcasing your product UI. The centerpiece scene.

```tsx
type CalloutArrow = {
  x: number;       // percentage (0-100) of image width
  y: number;       // percentage (0-100) of image height
  label: string;   // "One-click swap"
  delay: number;   // frame delay before this callout appears
};

type ProductScreenshotProps = {
  screenshotPath: string;   // "product-screenshot.png"
  callouts: CalloutArrow[];
  zoomTo?: { x: number; y: number; scale: number; atFrame: number };
};

const ProductScreenshot: React.FC<ProductScreenshotProps> = ({
  screenshotPath, callouts, zoomTo,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const enterProgress = spring({ frame, fps, config: SPRING.smooth });
  const imgScale = zoomTo
    ? interpolate(frame, [0, zoomTo.atFrame, zoomTo.atFrame + 30], [1, 1, zoomTo.scale], {
        extrapolateRight: "clamp", easing: Easing.inOut(Easing.cubic),
      })
    : 1;
  const imgX = zoomTo
    ? interpolate(frame, [0, zoomTo.atFrame, zoomTo.atFrame + 30], [0, 0, -(zoomTo.x - 50) * zoomTo.scale], {
        extrapolateRight: "clamp",
      })
    : 0;
  const imgY = zoomTo
    ? interpolate(frame, [0, zoomTo.atFrame, zoomTo.atFrame + 30], [0, 0, -(zoomTo.y - 50) * zoomTo.scale], {
        extrapolateRight: "clamp",
      })
    : 0;

  return (
    <AbsoluteFill style={{ backgroundColor: C.bg }}>
      {/* Screenshot container */}
      <AbsoluteFill style={{
        justifyContent: "center", alignItems: "center",
        padding: 60,
        opacity: enterProgress,
        transform: `scale(${0.95 + enterProgress * 0.05})`,
      }}>
        <div style={{
          position: "relative", width: "100%", height: "100%",
          transform: `scale(${imgScale}) translate(${imgX}%, ${imgY}%)`,
        }}>
          <Img src={staticFile(screenshotPath)} style={{
            width: "100%", height: "100%", objectFit: "contain",
            borderRadius: 16,
            boxShadow: "0 20px 60px rgba(0,0,0,0.5)",
          }} />

          {/* Callout arrows */}
          {callouts.map((callout, i) => {
            const cp = spring({
              frame: frame - callout.delay,
              fps,
              config: SPRING.snappy,
            });
            return (
              <div key={i} style={{
                position: "absolute",
                left: `${callout.x}%`,
                top: `${callout.y}%`,
                transform: `translate(-50%, -50%) scale(${cp})`,
                opacity: cp,
              }}>
                <div style={{
                  backgroundColor: C.primary,
                  color: C.text,
                  padding: "8px 20px",
                  borderRadius: 24,
                  fontSize: 22,
                  fontWeight: 700,
                  fontFamily,
                  whiteSpace: "nowrap",
                  boxShadow: "0 4px 20px rgba(153,69,255,0.4)",
                }}>
                  {callout.label}
                </div>
                {/* Arrow pointing down */}
                <div style={{
                  width: 0, height: 0,
                  borderLeft: "8px solid transparent",
                  borderRight: "8px solid transparent",
                  borderTop: `10px solid ${C.primary}`,
                  margin: "0 auto",
                }} />
              </div>
            );
          })}
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
```

---

### 7. StepByStep — Numbered walkthrough

Best for: Showing a multi-step flow (connect wallet → select → confirm → done).

```tsx
type Step = {
  number: number;
  title: string;       // "Connect Wallet"
  description?: string; // "One click with Phantom"
  icon?: React.ReactNode; // optional Lucide icon
};

type StepByStepProps = {
  steps: Step[];
  activeStep: number;  // which step to highlight (0-indexed, or -1 for none yet)
};

const StepByStep: React.FC<StepByStepProps> = ({ steps, activeStep }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <AbsoluteFill style={{
      backgroundColor: C.bg, justifyContent: "center",
      padding: 80,
    }}>
      <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
        {steps.map((step, i) => {
          const enterProgress = spring({
            frame: frame - i * 15,
            fps,
            config: SPRING.smooth,
          });
          const isActive = i === activeStep;
          const isPast = i < activeStep;

          return (
            <div key={i} style={{
              display: "flex", alignItems: "center", gap: 24,
              opacity: enterProgress,
              transform: `translateX(${(1 - enterProgress) * 40}px)`,
            }}>
              {/* Step number circle */}
              <div style={{
                width: 56, height: 56, borderRadius: "50%",
                backgroundColor: isActive ? C.primary : isPast ? C.accent : "rgba(255,255,255,0.1)",
                display: "flex", justifyContent: "center", alignItems: "center",
                fontSize: 24, fontWeight: 800, fontFamily,
                color: isActive || isPast ? C.bg : C.textMuted,
                transition: "none",
              }}>
                {isPast ? "✓" : step.number}
              </div>

              <div>
                <div style={{
                  fontSize: 36, fontWeight: 700, fontFamily,
                  color: isActive ? C.text : C.textMuted,
                }}>
                  {step.title}
                </div>
                {step.description && isActive && (
                  <div style={{
                    fontSize: 24, color: C.textMuted, fontFamily,
                    marginTop: 4,
                  }}>
                    {step.description}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};
```

---

### 8. TerminalDemo — Code/CLI output with typewriter

Best for: Developer audiences. Showing terminal commands and output.

```tsx
type TerminalLine = {
  text: string;
  type: "command" | "output" | "success" | "error";
  delay: number;  // frame to start typing this line
};

type TerminalDemoProps = {
  title?: string;        // "Terminal" tab title
  lines: TerminalLine[];
  typingSpeed?: number;  // frames per character (default 1.5)
};

const TerminalDemo: React.FC<TerminalDemoProps> = ({
  title = "Terminal", lines, typingSpeed = 1.5,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const enterProgress = spring({ frame, fps, config: SPRING.smooth });

  const colorMap = {
    command: C.text,
    output: C.textMuted,
    success: C.accent,
    error: C.danger,
  };

  return (
    <AbsoluteFill style={{ backgroundColor: C.bg, justifyContent: "center", padding: 60 }}>
      <div style={{
        backgroundColor: "#1a1a2e",
        borderRadius: 16,
        overflow: "hidden",
        boxShadow: "0 20px 60px rgba(0,0,0,0.5)",
        opacity: enterProgress,
        transform: `scale(${0.95 + enterProgress * 0.05})`,
      }}>
        {/* Title bar */}
        <div style={{
          padding: "12px 20px",
          backgroundColor: "rgba(255,255,255,0.05)",
          display: "flex", alignItems: "center", gap: 8,
        }}>
          <div style={{ width: 12, height: 12, borderRadius: "50%", backgroundColor: "#ff5f56" }} />
          <div style={{ width: 12, height: 12, borderRadius: "50%", backgroundColor: "#ffbd2e" }} />
          <div style={{ width: 12, height: 12, borderRadius: "50%", backgroundColor: "#27c93f" }} />
          <span style={{ color: C.textMuted, fontSize: 14, fontFamily: mono, marginLeft: 8 }}>
            {title}
          </span>
        </div>

        {/* Terminal content */}
        <div style={{ padding: 32, fontFamily: mono, fontSize: 24, lineHeight: 1.8 }}>
          {lines.map((line, i) => {
            const adjustedFrame = frame - line.delay;
            if (adjustedFrame < 0) return null;

            const charsToShow = Math.min(
              Math.floor(adjustedFrame / typingSpeed),
              line.text.length,
            );
            const isComplete = charsToShow >= line.text.length;
            const showCursor = !isComplete && adjustedFrame % 30 < 20;

            return (
              <div key={i} style={{ color: colorMap[line.type] }}>
                {line.type === "command" && (
                  <span style={{ color: C.accent }}>$ </span>
                )}
                {line.text.slice(0, charsToShow)}
                {showCursor && <span style={{ opacity: 0.7 }}>|</span>}
              </div>
            );
          })}
        </div>
      </div>
    </AbsoluteFill>
  );
};
```

---

## METRICS / PROOF SCENES

### 9. MetricCards — Staggered stat cards

Best for: Social proof section. Shows 2-4 key metrics.

```tsx
type Metric = {
  value: string;   // "50K+"
  label: string;   // "Transactions"
  icon?: React.ReactNode;
};

type MetricCardsProps = {
  metrics: Metric[];
  layout?: "row" | "grid";  // row for 2-3, grid for 4+
};

const MetricCards: React.FC<MetricCardsProps> = ({
  metrics, layout = "row",
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const isGrid = layout === "grid" || metrics.length > 3;

  return (
    <AbsoluteFill style={{
      backgroundColor: C.bg, justifyContent: "center", alignItems: "center",
    }}>
      <div style={{
        display: "flex",
        flexWrap: isGrid ? "wrap" : "nowrap",
        justifyContent: "center",
        gap: 40,
        maxWidth: isGrid ? 900 : undefined,
      }}>
        {metrics.map((m, i) => {
          const p = spring({ frame: frame - i * 10, fps, config: SPRING.smooth });
          return (
            <div key={i} style={{
              textAlign: "center",
              transform: `translateY(${(1 - p) * 30}px)`,
              opacity: p,
              minWidth: isGrid ? 180 : undefined,
            }}>
              {m.icon && (
                <div style={{ marginBottom: 12, opacity: 0.6 }}>{m.icon}</div>
              )}
              <div style={{
                fontSize: 72, fontWeight: 900, color: C.accent, fontFamily,
                letterSpacing: -2,
              }}>
                {m.value}
              </div>
              <div style={{
                fontSize: 22, color: C.textMuted, fontFamily,
                marginTop: 8, fontWeight: 500,
              }}>
                {m.label}
              </div>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};
```

---

### 10. AnimatedCounter — Number counting up with label

Best for: Data story videos. Single focused metric with dramatic reveal.

```tsx
type AnimatedCounterSceneProps = {
  from: number;
  to: number;
  prefix?: string;   // "$"
  suffix?: string;   // "M"
  label: string;     // "Total Volume"
  duration?: number; // frames to count (default 60)
};

const AnimatedCounterScene: React.FC<AnimatedCounterSceneProps> = ({
  from, to, prefix = "", suffix = "", label, duration = 60,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const countProgress = interpolate(frame, [10, 10 + duration], [0, 1], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });
  const value = from + (to - from) * countProgress;
  const labelProgress = spring({ frame: frame - duration - 5, fps, config: SPRING.smooth });

  return (
    <AbsoluteFill style={{
      backgroundColor: C.bg, justifyContent: "center", alignItems: "center",
    }}>
      <div style={{
        fontSize: 144, fontWeight: 900, color: C.accent, fontFamily,
        letterSpacing: -4,
      }}>
        {prefix}{Math.round(value).toLocaleString()}{suffix}
      </div>
      <div style={{
        fontSize: 32, color: C.textMuted, fontFamily,
        marginTop: 16, fontWeight: 500,
        opacity: interpolate(labelProgress, [0, 1], [0, 1]),
        transform: `translateY(${interpolate(labelProgress, [0, 1], [15, 0])}px)`,
      }}>
        {label}
      </div>
    </AbsoluteFill>
  );
};
```

---

### 11. BarChartScene — Animated bar chart with labels

Best for: Data story comparisons. Your protocol vs others.

```tsx
type BarData = {
  label: string;
  value: number;
  color?: string;
  highlight?: boolean;
};

type BarChartSceneProps = {
  title: string;
  data: BarData[];
  showValues?: boolean;
};

const BarChartScene: React.FC<BarChartSceneProps> = ({
  title, data, showValues = true,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const maxValue = Math.max(...data.map(d => d.value));
  const titleProgress = spring({ frame, fps, config: SPRING.smooth });

  return (
    <AbsoluteFill style={{
      backgroundColor: C.bg, justifyContent: "center", padding: 80,
    }}>
      {/* Title */}
      <div style={{
        fontSize: 36, fontWeight: 700, color: C.text, fontFamily,
        marginBottom: 48,
        opacity: titleProgress,
      }}>
        {title}
      </div>

      {/* Bars */}
      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        {data.map((bar, i) => {
          const barProgress = spring({
            frame: frame - 15 - i * 8,
            fps,
            config: { damping: 20, stiffness: 80 },
          });
          const widthPercent = (bar.value / maxValue) * 100 * barProgress;
          const isHighlight = bar.highlight;

          return (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 16 }}>
              <div style={{
                width: 120, fontSize: 20, color: C.textMuted, fontFamily,
                textAlign: "right", flexShrink: 0,
              }}>
                {bar.label}
              </div>
              <div style={{ flex: 1, position: "relative", height: 40 }}>
                <div style={{
                  height: "100%",
                  width: `${widthPercent}%`,
                  borderRadius: 8,
                  background: isHighlight
                    ? `linear-gradient(90deg, ${C.primary}, ${C.accent})`
                    : bar.color || "rgba(255,255,255,0.15)",
                }} />
                {showValues && barProgress > 0.5 && (
                  <span style={{
                    position: "absolute", right: 8, top: "50%",
                    transform: "translateY(-50%)",
                    fontSize: 18, fontWeight: 700, fontFamily,
                    color: isHighlight ? C.text : C.textMuted,
                  }}>
                    {bar.value.toLocaleString()}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};
```

---

## CTA SCENES

### 12. SimpleCTA — Clean call to action with URL

Best for: Final scene of any video. Clear single action.

```tsx
type SimpleCTAProps = {
  headline: string;     // "Try it now"
  url: string;          // "yourproject.com"
  tagline?: string;     // "Start free. No wallet required."
  showQR?: boolean;
};

const SimpleCTA: React.FC<SimpleCTAProps> = ({
  headline, url, tagline, showQR = false,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const headlineProgress = spring({ frame, fps, config: SPRING.smooth });
  const urlProgress = spring({ frame: frame - 12, fps, config: SPRING.smooth });
  const taglineProgress = spring({ frame: frame - 24, fps, config: SPRING.smooth });

  return (
    <AbsoluteFill style={{
      backgroundColor: C.bg, justifyContent: "center", alignItems: "center",
    }}>
      {/* Accent glow behind CTA */}
      <div style={{
        position: "absolute",
        background: `radial-gradient(ellipse at center, rgba(20,241,149,0.08) 0%, transparent 60%)`,
        inset: 0,
      }} />

      <div style={{
        fontSize: 64, fontWeight: 800, color: C.accent, fontFamily,
        opacity: headlineProgress,
        transform: `scale(${0.9 + headlineProgress * 0.1})`,
      }}>
        {headline}
      </div>

      <div style={{
        fontSize: 36, color: C.text, fontFamily, fontWeight: 500,
        marginTop: 20,
        opacity: urlProgress,
        transform: `translateY(${(1 - urlProgress) * 15}px)`,
      }}>
        {url}
      </div>

      {tagline && (
        <div style={{
          fontSize: 24, color: C.textMuted, fontFamily,
          marginTop: 16,
          opacity: taglineProgress,
        }}>
          {tagline}
        </div>
      )}
    </AbsoluteFill>
  );
};
```

---

### 13. HackathonCTA — Built-at badge with repo link

Best for: Hackathon demo endings. Shows team, repo, and hackathon branding.

```tsx
type HackathonCTAProps = {
  projectName: string;
  hackathonName: string;
  repoUrl: string;        // "github.com/team/project"
  liveUrl?: string;       // "app.yourproject.com"
  teamNames?: string[];   // ["Alice", "Bob"]
};

const HackathonCTA: React.FC<HackathonCTAProps> = ({
  projectName, hackathonName, repoUrl, liveUrl, teamNames,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const nameProgress = spring({ frame, fps, config: SPRING.heavy });
  const badgeProgress = spring({ frame: frame - 15, fps, config: SPRING.smooth });
  const linksProgress = spring({ frame: frame - 30, fps, config: SPRING.smooth });

  return (
    <AbsoluteFill style={{
      backgroundColor: C.bg, justifyContent: "center", alignItems: "center",
    }}>
      {/* Project name */}
      <div style={{
        fontSize: 72, fontWeight: 900, fontFamily,
        background: `linear-gradient(135deg, ${C.primary}, ${C.accent})`,
        WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
        backgroundClip: "text",
        transform: `scale(${nameProgress})`,
      }}>
        {projectName}
      </div>

      {/* Built at badge */}
      <div style={{
        marginTop: 24,
        padding: "8px 24px",
        borderRadius: 24,
        border: `1px solid rgba(255,255,255,0.15)`,
        fontSize: 20, color: C.textMuted, fontFamily,
        opacity: badgeProgress,
      }}>
        Built at {hackathonName}
      </div>

      {/* Links */}
      <div style={{
        marginTop: 40, display: "flex", flexDirection: "column",
        alignItems: "center", gap: 12,
        opacity: linksProgress,
        transform: `translateY(${(1 - linksProgress) * 20}px)`,
      }}>
        <div style={{ fontSize: 24, color: C.text, fontFamily }}>
          {repoUrl}
        </div>
        {liveUrl && (
          <div style={{ fontSize: 24, color: C.accent, fontFamily }}>
            {liveUrl}
          </div>
        )}
        {teamNames && (
          <div style={{ fontSize: 18, color: C.textMuted, fontFamily, marginTop: 8 }}>
            by {teamNames.join(" & ")}
          </div>
        )}
      </div>
    </AbsoluteFill>
  );
};
```

---

## TESTIMONIAL SCENES

### 14. QuoteCard — User testimonial with attribution

Best for: Social proof. Real user quotes from Discord/Twitter.

```tsx
type QuoteCardProps = {
  quote: string;          // "This saved us 3 hours per week"
  author: string;         // "@cryptodev42"
  platform?: string;      // "Twitter" | "Discord"
  avatarColor?: string;   // fallback color for avatar circle
};

const QuoteCard: React.FC<QuoteCardProps> = ({
  quote, author, platform = "Twitter", avatarColor = C.primary,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const quoteProgress = spring({ frame, fps, config: SPRING.smooth });
  const authorProgress = spring({ frame: frame - 20, fps, config: SPRING.smooth });

  return (
    <AbsoluteFill style={{
      backgroundColor: C.bg, justifyContent: "center", alignItems: "center",
      padding: 100,
    }}>
      {/* Large quote mark */}
      <div style={{
        fontSize: 200, color: C.primary, opacity: 0.1,
        position: "absolute", top: 80, left: 80,
        fontFamily, fontWeight: 900, lineHeight: 1,
      }}>
        "
      </div>

      {/* Quote text */}
      <div style={{
        fontSize: 48, fontWeight: 600, color: C.text, fontFamily,
        textAlign: "center", lineHeight: 1.4,
        maxWidth: 900,
        opacity: quoteProgress,
        transform: `translateY(${(1 - quoteProgress) * 20}px)`,
      }}>
        "{quote}"
      </div>

      {/* Attribution */}
      <div style={{
        marginTop: 40, display: "flex", alignItems: "center", gap: 16,
        opacity: authorProgress,
      }}>
        <div style={{
          width: 48, height: 48, borderRadius: "50%",
          backgroundColor: avatarColor, opacity: 0.8,
        }} />
        <div>
          <div style={{ fontSize: 24, fontWeight: 700, color: C.text, fontFamily }}>
            {author}
          </div>
          <div style={{ fontSize: 18, color: C.textMuted, fontFamily }}>
            via {platform}
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};
```

---

## TRANSITION & UTILITY SCENES

### 15. TransitionCard — "Introducing..." or "There's a better way" interstitial

Best for: Scene break between Before/After. Narrative pivot.

```tsx
type TransitionCardProps = {
  text: string;          // "There's a better way."
  subtext?: string;      // "Introducing YourProduct"
  accentColor?: string;
};

const TransitionCard: React.FC<TransitionCardProps> = ({
  text, subtext, accentColor = C.primary,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const textProgress = spring({ frame: frame - 5, fps, config: SPRING.heavy });
  const subtextProgress = spring({ frame: frame - 25, fps, config: SPRING.smooth });

  // Subtle gradient sweep
  const sweepX = interpolate(frame, [0, 60], [-50, 150], { extrapolateRight: "clamp" });

  return (
    <AbsoluteFill style={{
      backgroundColor: C.bg, justifyContent: "center", alignItems: "center",
    }}>
      {/* Animated gradient sweep */}
      <div style={{
        position: "absolute", inset: 0,
        background: `linear-gradient(90deg, transparent ${sweepX - 30}%, ${accentColor}15 ${sweepX}%, transparent ${sweepX + 30}%)`,
      }} />

      <div style={{
        fontSize: 56, fontWeight: 700, color: C.text, fontFamily,
        textAlign: "center",
        opacity: interpolate(textProgress, [0, 1], [0, 1]),
        transform: `scale(${0.95 + textProgress * 0.05})`,
      }}>
        {text}
      </div>

      {subtext && (
        <div style={{
          fontSize: 36, fontWeight: 600, fontFamily,
          color: accentColor, marginTop: 16,
          opacity: subtextProgress,
        }}>
          {subtext}
        </div>
      )}
    </AbsoluteFill>
  );
};
```

---

### 16. LogoReveal — SVG path draw-on logo animation

Best for: Opening/closing brand reveal. Works with any SVG logo.

```tsx
// Requires: npx remotion add @remotion/paths
import { evolvePath } from "@remotion/paths";

type LogoRevealProps = {
  svgPath: string;          // SVG path data string
  viewBox: string;          // "0 0 200 200"
  strokeColor?: string;
  fillColor?: string;
  size?: number;
};

const LogoReveal: React.FC<LogoRevealProps> = ({
  svgPath, viewBox, strokeColor = C.accent,
  fillColor = C.accent, size = 200,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Draw-on progress
  const drawProgress = spring({ frame, fps, config: { damping: 30, stiffness: 60 } });
  const { strokeDasharray, strokeDashoffset } = evolvePath(drawProgress, svgPath);

  // Fill fades in after draw completes
  const fillOpacity = interpolate(frame, [40, 60], [0, 1], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill style={{
      backgroundColor: C.bg, justifyContent: "center", alignItems: "center",
    }}>
      <svg width={size} height={size} viewBox={viewBox}>
        {/* Fill layer (appears after stroke draws) */}
        <path d={svgPath} fill={fillColor} opacity={fillOpacity} />
        {/* Stroke draw-on layer */}
        <path
          d={svgPath}
          fill="none"
          stroke={strokeColor}
          strokeWidth={2}
          strokeDasharray={strokeDasharray}
          strokeDashoffset={strokeDashoffset}
        />
      </svg>
    </AbsoluteFill>
  );
};
```

---

## COMPOSITION RECIPES

### Recipe A: Product Demo (30s, Hook-Proof-CTA)

```tsx
export const ProductDemo: React.FC = () => (
  <TransitionSeries>
    <TransitionSeries.Sequence durationInFrames={90}>
      <MetricHook metric="$2.1M" subtitle="settled in 30 days" />
    </TransitionSeries.Sequence>

    <TransitionSeries.Transition presentation={fade()} timing={linearTiming({ durationInFrames: 15 })} />

    <TransitionSeries.Sequence durationInFrames={150}>
      <ProblemStatement lines={["AI agents can't pay each other", "without a human co-signer."]} />
    </TransitionSeries.Sequence>

    <TransitionSeries.Transition presentation={slide({ direction: "from-right" })} timing={springTiming({ config: SPRING.smooth, durationInFrames: 20 })} />

    <TransitionSeries.Sequence durationInFrames={390}>
      <ProductScreenshot
        screenshotPath="demo.png"
        callouts={[
          { x: 30, y: 40, label: "Connect wallet", delay: 30 },
          { x: 60, y: 55, label: "One-click send", delay: 90 },
          { x: 70, y: 70, label: "< 400ms", delay: 150 },
        ]}
      />
    </TransitionSeries.Sequence>

    <TransitionSeries.Transition presentation={fade()} timing={linearTiming({ durationInFrames: 15 })} />

    <TransitionSeries.Sequence durationInFrames={150}>
      <MetricCards metrics={[
        { value: "50K+", label: "Transactions" },
        { value: "120", label: "Agents" },
        { value: "<400ms", label: "Settlement" },
      ]} />
    </TransitionSeries.Sequence>

    <TransitionSeries.Transition presentation={fade()} timing={linearTiming({ durationInFrames: 10 })} />

    <TransitionSeries.Sequence durationInFrames={90}>
      <SimpleCTA headline="Try it now" url="yourproject.com" />
    </TransitionSeries.Sequence>
  </TransitionSeries>
);
```

### Recipe B: Before/After (30s)

```tsx
export const BeforeAfter: React.FC = () => (
  <TransitionSeries>
    <TransitionSeries.Sequence durationInFrames={240}>
      <BeforeSplit
        painPoints={["$4.50 in fees", "3-5 day settlement", "Manual reconciliation"]}
      />
    </TransitionSeries.Sequence>

    <TransitionSeries.Transition presentation={fade()} timing={linearTiming({ durationInFrames: 20 })} />

    <TransitionSeries.Sequence durationInFrames={60}>
      <TransitionCard text="There's a better way." subtext="Introducing YourProduct" />
    </TransitionSeries.Sequence>

    <TransitionSeries.Transition presentation={slide({ direction: "from-right" })} timing={springTiming({ config: SPRING.smooth, durationInFrames: 20 })} />

    <TransitionSeries.Sequence durationInFrames={390}>
      <ProductScreenshot
        screenshotPath="demo.png"
        callouts={[
          { x: 50, y: 40, label: "$0.002 fee", delay: 30 },
          { x: 50, y: 60, label: "400ms settlement", delay: 60 },
        ]}
      />
    </TransitionSeries.Sequence>

    <TransitionSeries.Transition presentation={fade()} timing={linearTiming({ durationInFrames: 15 })} />

    <TransitionSeries.Sequence durationInFrames={90}>
      <SimpleCTA headline="Switch now" url="yourproject.com" tagline="Start free. No wallet required." />
    </TransitionSeries.Sequence>
  </TransitionSeries>
);
```

### Recipe C: Hackathon Speedrun (60s)

```tsx
export const HackathonDemo: React.FC = () => (
  <TransitionSeries>
    <TransitionSeries.Sequence durationInFrames={120}>
      <QuestionHook
        line1="What if you could"
        line2="swap tokens in 400ms?"
        emphasisWord="400ms"
      />
    </TransitionSeries.Sequence>

    <TransitionSeries.Transition presentation={fade()} timing={linearTiming({ durationInFrames: 15 })} />

    <TransitionSeries.Sequence durationInFrames={600}>
      <TerminalDemo lines={[
        { text: "anchor build", type: "command", delay: 10 },
        { text: "Compiling swap_program...", type: "output", delay: 40 },
        { text: "Build successful!", type: "success", delay: 80 },
        { text: "anchor deploy --provider.cluster devnet", type: "command", delay: 120 },
        { text: "Program deployed: 7xKX...3mNq", type: "success", delay: 170 },
        { text: "anchor test", type: "command", delay: 220 },
        { text: "3 tests passed ✓", type: "success", delay: 280 },
      ]} />
    </TransitionSeries.Sequence>

    <TransitionSeries.Transition presentation={fade()} timing={linearTiming({ durationInFrames: 15 })} />

    <TransitionSeries.Sequence durationInFrames={300}>
      <ProductScreenshot
        screenshotPath="app-screenshot.png"
        callouts={[
          { x: 50, y: 35, label: "Connect → Swap → Done", delay: 30 },
        ]}
      />
    </TransitionSeries.Sequence>

    <TransitionSeries.Transition presentation={fade()} timing={linearTiming({ durationInFrames: 15 })} />

    <TransitionSeries.Sequence durationInFrames={150}>
      <MetricCards metrics={[
        { value: "400ms", label: "Swap Time" },
        { value: "$0.001", label: "Fee" },
        { value: "100%", label: "On-Chain" },
      ]} />
    </TransitionSeries.Sequence>

    <TransitionSeries.Transition presentation={fade()} timing={linearTiming({ durationInFrames: 10 })} />

    <TransitionSeries.Sequence durationInFrames={120}>
      <HackathonCTA
        projectName="SwapKit"
        hackathonName="Colosseum Radar"
        repoUrl="github.com/team/swapkit"
        liveUrl="swapkit.devnet.app"
        teamNames={["Alice", "Bob"]}
      />
    </TransitionSeries.Sequence>
  </TransitionSeries>
);
```

---

## Scene Index

Quick reference for building compositions:

| Scene | Type | Best For |
|-------|------|----------|
| `MetricHook` | Hook | Opening with a bold number |
| `QuestionHook` | Hook | Opening with a provocative question |
| `POVHook` | Hook | TikTok/Reels vertical opener |
| `ProblemStatement` | Problem | Revealing the pain point |
| `BeforeSplit` | Problem | "Old way" with pain indicators |
| `ProductScreenshot` | Demo | Showcasing UI with callout arrows |
| `StepByStep` | Demo | Multi-step product walkthrough |
| `TerminalDemo` | Demo | CLI/code output with typewriter |
| `MetricCards` | Proof | 2-4 key metrics display |
| `AnimatedCounterScene` | Proof | Single dramatic number reveal |
| `BarChartScene` | Proof | Comparative data visualization |
| `SimpleCTA` | CTA | Clean call-to-action with URL |
| `HackathonCTA` | CTA | Hackathon ending with repo + team |
| `QuoteCard` | Social Proof | User testimonial |
| `TransitionCard` | Utility | Scene break / narrative pivot |
| `LogoReveal` | Utility | SVG draw-on logo animation |
