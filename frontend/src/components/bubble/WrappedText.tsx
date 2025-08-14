import { useEffect, useMemo, useRef, useState } from "react";
import { getExtents, segmentIntersectsPolygon } from "./geometry";

interface WrappedTextProps {
  bounds: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  text: string;
  fontSize: number;
  lineHeight: number;
  color?: string;
  fontFamily?: string;
  onTextChange?: (text: string) => void;
}

const WrappedText = ({
  bounds,
  text,
  fontSize,
  lineHeight,
  color = "black",
  fontFamily = "sans-serif",
  onTextChange,
}: WrappedTextProps) => {
  const measureRef = useRef<SVGTextElement>(null);
  const [textDimensions, setTextDimensions] = useState<{
    w: number;
    h: number;
  }>();

  useEffect(() => {
    if (measureRef.current) {
      const bbox = measureRef.current.getBBox();
      setTextDimensions({ w: bbox.width, h: bbox.height });
    }
  }, [bounds, text, fontSize, fontFamily]);

  const lines = useMemo(() => {
    if (textDimensions) {
      const { w, h } = textDimensions;
      const padding = fontSize / 2; // Use half font size as padding
      const simpleBounds = [
        { x: bounds.x, y: bounds.y },
        { x: bounds.x + bounds.width, y: bounds.y },
        { x: bounds.x + bounds.width, y: bounds.y + bounds.height },
        { x: bounds.x, y: bounds.y + bounds.height },
      ];
      const { minX, minY, maxX, maxY } = getExtents(simpleBounds);
      const width = maxX - minX - padding * 2;
      const rows = Math.ceil(w / width);

      const lh = lineHeight;
      const usedHeight = rows * lh;
      const charWidth = w / text.length;
      const yStart = minY + padding + fontSize; // Start from top with padding

      let words = text.trim().split(/\s+/);

      const lines = [];
      let prevIndex = 0;

      for (let row = 0; row < rows; row++) {
        const y = yStart + row * lh;

        // Find intersections with bounds at this y-level
        const intersections = segmentIntersectsPolygon(
          [
            { x: minX, y },
            { x: maxX, y },
          ],
          simpleBounds
        );

        if (intersections?.length >= 2) {
          const [a, b] = intersections;
          const from = { x: Math.max(minX, a.intersection.x) + padding, y };
          const to = { x: Math.min(maxX, b.intersection.x) - padding, y };
          const availableWidth = to.x - from.x;
          const maxChars = Math.floor(availableWidth / charWidth);

          const nextPart = getTextPart(words, maxChars);
          lines.push({
            from,
            to,
            center: { x: (to.x + from.x) / 2, y },
            text: nextPart.text,
          });
          words = nextPart.words;
          prevIndex = prevIndex + nextPart.endIndex;
        }
      }
      return lines;
    }
    return [];
  }, [text, bounds, textDimensions, fontSize, lineHeight]);

  return (
    <g>
      {/* Hidden text for measurement */}
      <defs>
        <text
          ref={measureRef}
          fontSize={fontSize}
          fontFamily={fontFamily}
          visibility="hidden"
        >
          {text}
        </text>
      </defs>

      {/* Visible text lines */}
      {lines.map(({ text, center }, i) => (
        <text
          key={i}
          x={center.x}
          y={center.y}
          textAnchor="middle"
          fontSize={fontSize}
          fontFamily={fontFamily}
          fill={color}
          style={{
            userSelect: "none",
            pointerEvents: onTextChange ? "auto" : "none",
          }}
          onClick={() => {
            if (onTextChange) {
              const newText = prompt("Edit text", text);
              if (newText !== null) {
                onTextChange(newText);
              }
            }
          }}
        >
          {text}
        </text>
      ))}
    </g>
  );
};

const getTextPart = (words: string[], maxChars: number) => {
  const line: string[] = [];
  let charCount = 0;

  for (let i = 0; i < words.length; i++) {
    const word = words[i];
    const newLength = charCount + (line.length > 0 ? 1 : 0) + word.length;

    if (newLength <= maxChars) {
      line.push(word);
      charCount = newLength;
    } else {
      return {
        text: line.join(" "),
        words: words.slice(i),
        endIndex: i,
      };
    }
  }

  return {
    text: line.join(" "),
    words: [],
    endIndex: words.length,
  };
};

export default WrappedText;
