import fitCurve from "fit-curve";
import { useCallback, useMemo } from "react";
import {
  addVectors,
  approximateRoundedRect,
  midpoint,
  mult,
  normalCCW,
  normalCW,
  segmentsFromCorners,
  unit,
  vector,
} from "./geometry";
import Random from "./Random";
import { curvesToPathDirectives, toPath, useId } from "./svg";
import useDragEvents from "./useDragEvents";
import WrappedText from "./WrappedText";

// Shape types
export const ROUNDED_RECT_BUBBLE_SHAPE = "ROUNDED_RECT";
export const SKETCH_BUBBLE_SHAPE = "SKETCH";
export const OVAL_CLOUD_BUBBLE_SHAPE = "OVAL_CLOUD";
export const OVAL_BUBBLE_SHAPE = "OVAL";
export const SHAPES = [
  ROUNDED_RECT_BUBBLE_SHAPE,
  OVAL_BUBBLE_SHAPE,
  SKETCH_BUBBLE_SHAPE,
  OVAL_CLOUD_BUBBLE_SHAPE,
] as const;

// Bubble types
export const SPEECH_TYPE = "SPEECH";
export const THOUGHT_TYPE = "THOUGHT";
export const SHOUT_TYPE = "SHOUT";
export const TYPES = [SPEECH_TYPE, THOUGHT_TYPE, SHOUT_TYPE] as const;

// Type definitions
type Point = { x: number; y: number };
type ShapeType = (typeof SHAPES)[number];
type BubbleType = (typeof TYPES)[number];

interface Tail {
  corners: Point[];
  tip: Point;
}

interface BubbleOutline {
  outline: Point[];
  textBounds: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}

export interface SpeechConfig {
  // Visual styling
  strokeWidth?: number;
  strokeColor?: string;
  fillColor?: string;
  strokeLinejoin?: "round" | "miter" | "bevel";
  strokeLinecap?: "round" | "butt" | "square";

  // Text styling
  fontSize?: number;
  lineHeight?: number;
  textColor?: string;
  fontFamily?: string;
  textPadding?: number;

  // Shape behavior
  minWidth?: number;
  minHeight?: number;
  cornerRadius?: number;
  tailWidthFactor?: number;

  // Control points
  controlPointSize?: number;
  controlPointFill?: string;
  controlPointStroke?: string;
  controlPointStrokeWidth?: number;
}

interface SpeechProps {
  // Required props
  w: number;
  h: number;
  text: string;
  c: Point;
  tail: Tail;

  // Configuration overrides
  config?: SpeechConfig;

  // Event handlers
  onUpdateCentre?: (delta: { dx: number; dy: number }) => void;
  onUpdateControlPoint?: (
    index: number,
    delta: { dx: number; dy: number }
  ) => void;
  onUpdateTip?: (delta: { dx: number; dy: number }) => void;
  onUpdateSize?: (size: { w: number; h: number }) => void;
  onTextChange?: (text: string) => void;
  conClick: () => void;

  // Additional props
  type?: BubbleType;
  shape?: ShapeType;
}

// Default configuration
const DEFAULT_CONFIG: Required<SpeechConfig> = {
  // Visual styling
  strokeWidth: 10,
  strokeColor: "black",
  fillColor: "white",
  strokeLinejoin: "round",
  strokeLinecap: "round",

  // Text styling
  fontSize: 40,
  lineHeight: 50,
  textColor: "black",
  fontFamily: "sans-serif",
  textPadding: 20,

  // Shape behavior
  minWidth: 100,
  minHeight: 100,
  cornerRadius: 20,
  tailWidthFactor: 4,

  // Control points
  controlPointSize: 40,
  controlPointFill: "rgba(51,153,255,0.25)",
  controlPointStroke: "rgba(51,153,255,0.5)",
  controlPointStrokeWidth: 3,
};

const Speech: React.FC<SpeechProps> = ({
  // Required props
  w,
  h,
  text,
  c,
  tail,

  // Configuration overrides
  config = {},

  // Event handlers
  onUpdateCentre,
  onUpdateControlPoint,
  onUpdateTip,
  onUpdateSize,
  onTextChange,
  conClick,
  // Additional props
  ...rest
}) => {
  // Merge default config with provided config
  const {
    strokeWidth,
    strokeColor,
    fillColor,
    strokeLinejoin,
    strokeLinecap,
    fontSize,
    lineHeight,
    textColor,
    fontFamily,
    textPadding,
    minWidth,
    minHeight,
    cornerRadius,
    tailWidthFactor,
    controlPointSize,
    controlPointFill,
    controlPointStroke,
    controlPointStrokeWidth,
  } = { ...DEFAULT_CONFIG, ...config };

  const pathId = useId("speech");
  const { corners, tip } = tail;

  const { path, textBounds } = useMemo(() => {
    const { outline, textBounds } = getOutlinePath({
      ...rest,
      c,
      w,
      h,
      tail,
      rx: cornerRadius,
      ry: cornerRadius,
      tailWidthFactor,
      textPadding,
    });
    return { path: toPath(outline), textBounds };
  }, [rest, c, w, h, tail, cornerRadius, tailWidthFactor, textPadding]);

  const handleUpdateSize = ({ dx, dy }: { dx: number; dy: number }) => {
    onUpdateSize?.({
      w: Math.max(minWidth, w + dx * 2),
      h: Math.max(minHeight, h - dy * 2),
    });
  };

  return (
    <g onClick={conClick}>
      <defs>
        <path id={pathId.id} d={path} />
      </defs>
      <use
        href={pathId.href}
        stroke={strokeColor}
        strokeWidth={strokeWidth}
        strokeLinejoin={strokeLinejoin}
        strokeLinecap={strokeLinecap}
        fill={fillColor}
        paintOrder="stroke"
      />

      <WrappedText
        bounds={textBounds}
        text={text}
        fontSize={fontSize}
        lineHeight={lineHeight}
        color={textColor}
        fontFamily={fontFamily}
        onTextChange={onTextChange}
      />

      {onUpdateCentre && (
        <ControlPoint
          x={c.x}
          y={c.y}
          onMove={onUpdateCentre}
          size={controlPointSize}
          fill={controlPointFill}
          stroke={controlPointStroke}
          strokeWidth={controlPointStrokeWidth}
        />
      )}

      {onUpdateControlPoint &&
        corners.map(({ x, y }, idx) => (
          <IndexedControlPoint
            key={idx}
            x={x}
            y={y}
            idx={idx}
            onMove={onUpdateControlPoint}
            size={controlPointSize}
            fill={controlPointFill}
            stroke={controlPointStroke}
            strokeWidth={controlPointStrokeWidth}
          />
        ))}

      {onUpdateTip && (
        <ControlPoint
          x={tip.x}
          y={tip.y}
          onMove={onUpdateTip}
          size={controlPointSize}
          fill={controlPointFill}
          stroke={controlPointStroke}
          strokeWidth={controlPointStrokeWidth}
        />
      )}

      {onUpdateSize && (
        <ControlPoint
          x={c.x + w / 2}
          y={c.y - h / 2}
          onMove={handleUpdateSize}
          size={controlPointSize}
          fill={controlPointFill}
          stroke={controlPointStroke}
          strokeWidth={controlPointStrokeWidth}
        />
      )}
    </g>
  );
};

interface ControlPointProps {
  x: number;
  y: number;
  onMove: (delta: { dx: number; dy: number }) => void;
  size: number;
  fill: string;
  stroke: string;
  strokeWidth: number;
}

const ControlPoint: React.FC<ControlPointProps> = ({
  x,
  y,
  onMove,
  size,
  fill,
  stroke,
  strokeWidth,
}) => {
  const { isDragging, ...pointerHandlers } = useDragEvents({
    onDragMove: onMove,
  });
  return (
    <g {...pointerHandlers}>
      <circle
        cx={x}
        cy={y}
        r={size}
        fill={fill}
        stroke={stroke}
        strokeWidth={strokeWidth}
      />
    </g>
  );
};

interface IndexedControlPointProps extends Omit<ControlPointProps, "onMove"> {
  idx: number;
  onMove: (index: number, delta: { dx: number; dy: number }) => void;
}

const IndexedControlPoint: React.FC<IndexedControlPointProps> = ({
  idx,
  x,
  y,
  onMove,
  size,
  fill,
  stroke,
  strokeWidth,
}) => {
  const onUpdate = useCallback(
    ({ dx, dy }: { dx: number; dy: number }) => {
      onMove(idx, { dx, dy });
    },
    [idx, onMove]
  );
  const { isDragging, ...pointerHandlers } = useDragEvents({
    onDragMove: onUpdate,
  });
  return (
    <g {...pointerHandlers}>
      <circle
        cx={x}
        cy={y}
        r={size}
        fill={fill}
        stroke={stroke}
        strokeWidth={strokeWidth}
      />
    </g>
  );
};

interface GetOutlinePathParams {
  type?: BubbleType;
  shape?: ShapeType;
  c: Point;
  rx: number;
  ry: number;
  w: number;
  h: number;
  tail: Tail;
  tailWidthFactor: number;
  textPadding: number;
}

const getOutlinePath = ({
  type,
  shape,
  c,
  rx,
  ry,
  w,
  h,
  tail,
  tailWidthFactor,
  textPadding,
}: GetOutlinePathParams): BubbleOutline => {
  // Adjust bubble dimensions to account for padding
  const paddedW = w - textPadding * 2;
  const paddedH = h - textPadding * 2;

  const bubblePoints = getBubbleOutline({
    type,
    shape,
    c,
    rx,
    ry,
    w: paddedW,
    h: paddedH,
  });

  const points = [c, ...tail.corners, tail.tip];
  const pairs = segmentsFromCorners(points).slice(0, -1);

  const { cornersFromTip } = getTailCornersFromTipToBubbleStart({
    pairs,
    bubble: bubblePoints,
    tip: tail.tip,
    widthFactor: tailWidthFactor,
  });

  const { cornersToTip } = getTailCornersFromBubbleEndToTip({
    pairs,
    bubble: bubblePoints,
    tip: tail.tip,
    widthFactor: tailWidthFactor,
  });

  const tailPath = fitCurvesAndGeneratePathDirectives(
    cornersFromTip,
    bubblePoints,
    cornersToTip,
    tail.tip
  );

  // Calculate text bounds based on bubble dimensions
  const minX = Math.min(...bubblePoints.map((p) => p.x));
  const maxX = Math.max(...bubblePoints.map((p) => p.x));
  const minY = Math.min(...bubblePoints.map((p) => p.y));
  const maxY = Math.max(...bubblePoints.map((p) => p.y));

  return {
    outline: tailPath,
    textBounds: {
      x: minX + textPadding,
      y: minY + textPadding,
      width: maxX - minX - textPadding * 2,
      height: maxY - minY - textPadding * 2,
    },
  };
};

interface TailCornersParams {
  pairs: [Point, Point][];
  bubble: Point[];
  tip: Point;
  widthFactor: number;
}

const getTailCornersFromTipToBubbleStart = ({
  pairs,
  bubble,
  tip,
  widthFactor,
}: TailCornersParams): { cornersFromTip: Point[] } => {
  const pairedNormals = pairs.map(([a, b], idx) => {
    const direction = vector(a, b);
    const normal = unit(normalCW(direction));
    const i = idx === 0 ? 0.75 : idx;
    const a_ = addVectors(a, mult(normal, widthFactor * (pairs.length - i)));
    const b_ = addVectors(
      b,
      mult(
        normal,
        widthFactor * (pairs.length - (i + widthFactor / (pairs.length * 2)))
      )
    );
    return [a_, b_];
  });

  const points = pairedNormals.flat();

  const corners = [pairedNormals[0][0]]
    .concat(
      segmentsFromCorners(points.slice(1, -1))
        .map(([a, b]: any) => midpoint(a, b))
        .filter((p: number, i: number) => i % 2 === 0)
        .concat(tip)
    )
    .reverse();

  return { cornersFromTip: corners };
};

const getTailCornersFromBubbleEndToTip = ({
  pairs,
  bubble,
  tip,
  widthFactor,
}: TailCornersParams): { cornersToTip: Point[] } => {
  const pairedNormals = pairs.map(([a, b], idx) => {
    const direction = vector(a, b);
    const normal = unit(normalCCW(direction));
    const i = idx === 0 ? 0.75 : idx;
    const a_ = addVectors(a, mult(normal, widthFactor * (pairs.length - i)));
    const b_ = addVectors(
      b,
      mult(
        normal,
        widthFactor * (pairs.length - (i + widthFactor / (pairs.length * 2)))
      )
    );
    return [a_, b_];
  });

  const points = pairedNormals.flat();

  const corners = [pairedNormals[0][0]].concat(
    segmentsFromCorners(points.slice(1, -1))
      .map(([a, b]: any) => midpoint(a, b))
      .filter((p: number, i: number) => i % 2 === 0)
  );

  return { cornersToTip: corners };
};

const fitCurvesAndGeneratePathDirectives = (
  cornersFromTip: Point[],
  bubble: Point[],
  cornersToTip: Point[],
  tip: Point
) => {
  return curvesToPathDirectives(
    fitCurve(
      cornersFromTip.map(({ x, y }) => [x, y]),
      0.01
    ).map(([a, b, c, d]) => [
      { x: a[0], y: a[1] },
      { x: b[0], y: b[1] },
      { x: c[0], y: c[1] },
      { x: d[0], y: d[1] },
    ])
  )
    .concat(cornersToTip[0])
    .concat(
      curvesToPathDirectives(
        fitCurve(
          cornersToTip.concat(tip).map(({ x, y }) => [x, y]),
          0.01
        ).map(([a, b, c, d]) => [
          { x: a[0], y: a[1] },
          { x: b[0], y: b[1] },
          { x: c[0], y: c[1] },
          { x: d[0], y: d[1] },
        ]),
        false
      )
    )
    .concat(
      getBubblePathWithTailCutout({
        outline: bubble,
      }).path
    );
};

interface GetBubbleOutlineParams {
  type?: BubbleType;
  shape?: ShapeType;
  c: Point;
  rx: number;
  ry: number;
  w: number;
  h: number;
}

const getBubbleOutline = ({
  type,
  shape,
  ...rest
}: GetBubbleOutlineParams): Point[] => {
  switch (shape) {
    case ROUNDED_RECT_BUBBLE_SHAPE: {
      return approximateRoundedRect({
        ...rest,
      });
    }
    case OVAL_BUBBLE_SHAPE: {
      return ovalShape({ ...rest });
    }
    case SKETCH_BUBBLE_SHAPE: {
      return sketchBubbleShape({
        ...rest,
      });
    }
    case OVAL_CLOUD_BUBBLE_SHAPE: {
      return ovalCloudBubbleShape({
        ...rest,
      });
    }
    default: {
      return approximateRoundedRect({
        ...rest,
      });
    }
  }
};

interface BubblePathWithCutoutParams {
  outline: Point[];
  start?: Point;
  end?: Point;
}

const getBubblePathWithTailCutout = ({
  outline,
}: BubblePathWithCutoutParams) => {
  return {
    path: [{ type: "M", ...outline[0] }].concat(
      outline
        .slice(1)
        .map((p) => ({ type: "L", ...p }))
        .concat([{ type: "L", ...outline[0] }])
    ),
    points: outline,
  };
};

const ovalShape = ({
  c,
  w,
  h,
  incDegrees = 5,
}: {
  c: Point;
  w: number;
  h: number;
  incDegrees?: number;
}): Point[] => {
  return approximateRoundedRect({ c, w, h, rx: w / 2, ry: h / 2, incDegrees });
};

const sketchBubbleShape = ({
  c,
  w,
  h,
  seed = 12345,
}: {
  c: Point;
  w: number;
  h: number;
  seed?: number;
}): Point[] => {
  const rnd = new Random(seed);
  const points: Point[] = [];
  const steps = 20;

  // Create a basic oval shape with some randomness
  for (let i = 0; i < steps; i++) {
    const angle = (i / steps) * Math.PI * 2;
    const radiusX = (w / 2) * (0.9 + rnd.nextFloat() * 0.2);
    const radiusY = (h / 2) * (0.9 + rnd.nextFloat() * 0.2);

    points.push({
      x: c.x + Math.cos(angle) * radiusX,
      y: c.y + Math.sin(angle) * radiusY,
    });
  }

  return points;
};

const ovalCloudBubbleShape = ({
  c,
  w,
  h,
  seed = 12345,
}: {
  c: Point;
  w: number;
  h: number;
  seed?: number;
}): Point[] => {
  const rnd = new Random(seed);
  const points: Point[] = [];
  const steps = 36;
  const baseRadiusX = w / 2;
  const baseRadiusY = h / 2;

  // Create a cloud-like shape with multiple lobes
  for (let i = 0; i < steps; i++) {
    const angle = (i / steps) * Math.PI * 2;
    // Add some randomness to create cloud-like lobes
    const noise = 0.2 + 0.3 * rnd.nextFloat();
    const radiusX = baseRadiusX * (0.7 + noise);
    const radiusY = baseRadiusY * (0.7 + noise);

    points.push({
      x: c.x + Math.cos(angle) * radiusX,
      y: c.y + Math.sin(angle) * radiusY,
    });
  }

  return points;
};

export default Speech;
