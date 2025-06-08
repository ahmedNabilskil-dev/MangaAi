import { polarToCartesian } from "./geometry";

const DropShadow = ({
  boundaryId,
  strokeWidth = 0,
  angle = 135,
  elevation = 25,
  opacity = 0.25,
}) => {
  const { x: shadowOffsetX, y: shadowOffsetY } = polarToCartesian({
    angle: angle,
    range: elevation,
  });
  return (
    <use
      opacity={opacity}
      transform={`translate(${shadowOffsetX},${shadowOffsetY})`}
      href={boundaryId.href}
      fill={`rgba(0,0,0)`}
      strokeWidth={strokeWidth}
      stroke={`rgba(0,0,0)`}
    />
  );
};

export default DropShadow;
