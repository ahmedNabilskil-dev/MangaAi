import { polarToCartesian } from "./geometry";
import { useId } from "./svg";

const LowLights = ({
  boundaryId,
  angle = 135,
  elevation = 10,
  offset = 2.5,
  opacity = 0.1,
  magnitude = 3,
}) => {
  const clipId = useId("lowlight-clip");
  const maskId = useId("lowlight-mask");

  const { x: shadowOffsetX, y: shadowOffsetY } = polarToCartesian({
    angle: angle + 180,
    range: elevation,
  });
  return (
    <g>
      <defs>
        <clipPath id={clipId.id}>
          <use href={boundaryId.href} />
        </clipPath>
        <mask id={maskId.id}>
          <use
            transform={`translate(${shadowOffsetX},${shadowOffsetY})`}
            href={boundaryId.href}
            fill="white"
          />
          <use
            transform={`translate(${shadowOffsetX},${shadowOffsetY})`}
            href={boundaryId.href}
            stroke="black"
            strokeWidth={elevation + offset}
            fill="none"
          />
          <use
            transform={`translate(${shadowOffsetX * magnitude},${
              shadowOffsetY * magnitude
            })`}
            href={boundaryId.href}
            fill="black"
          />
        </mask>
      </defs>
      <use
        transform={`translate(${-shadowOffsetX},${-shadowOffsetY})`}
        mask={maskId.url}
        href={boundaryId.href}
        fill={`rgba(0,0,0,${opacity})`}
      />
    </g>
  );
};

export default LowLights;
