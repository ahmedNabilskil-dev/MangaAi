import { useMemo } from "react";

export const curvesToPathDirectives = (curves, ignoreFirst = false) => {
  const rest = curves.map(([_, cp1, cp2, end]) => ({
    type: "C",
    points: [cp1, cp2, end],
  }));
  if (ignoreFirst) {
    return rest;
  } else {
    return [{ type: "M", ...curves[0][0] }].concat(rest);
  }
};

export const toPoints = (arrayOfXYObjects) =>
  arrayOfXYObjects.map(({ x, y }) => [x, y]);

export const toPath = (directives) =>
  directives
    .map((directive) => {
      const { type } = directive;
      switch (type) {
        case "M": {
          const { x, y } = directive;
          return `M${x.toFixed(2)},${y.toFixed(2)}`;
        }
        case "C": {
          const { points } = directive;
          return `C${points
            .map(({ x, y }) => `${x.toFixed(2)},${y.toFixed(2)}`)
            .join(" ")}`;
        }
        case "A": {
          const {
            rx,
            ry,
            rotation,
            largeArc,
            sweep,
            end: { x, y },
          } = directive;
          return `A${rx},${ry} ${rotation},${largeArc},${sweep} ${x},${y}`;
        }
        default: {
          const { x, y } = directive;
          return `L${x.toFixed(2)},${y.toFixed(2)}`;
        }
      }
    })
    .join(" ");

export const useId = (name) => {
  return useMemo(() => {
    const id = `${name}-${Math.random()}-${Date.now()}`;
    return {
      id,
      url: `url(#${id})`,
      href: `#${id}`,
    };
  }, [name]);
};
