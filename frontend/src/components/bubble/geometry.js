export const LARGE_DISTANCE = 1e9;
export const MARGIN_OF_ERROR = 1e-9;
export const HUGE_DISTANCE = 1e9;
export const REFERENCE_DIRECTION = -90;

export const degreesToRadians = (degrees) => (degrees * Math.PI) / 180.0;

export const radiansToDegrees = (radians) => radians * (180.0 / Math.PI);

export const vector = (from, to) => ({ x: from.x - to.x, y: from.y - to.y });

export const addVectors = (a, b) => ({ x: a.x + b.x, y: a.y + b.y });

export const magnitude = (vector) =>
  Math.sqrt(Math.pow(vector.x, 2) + Math.pow(vector.y, 2));

export const distance = (from, to) => magnitude(vector(from, to));

export const normalCCW = ({ x, y }) => ({ x: -y, y: x });

export const normalCW = ({ x, y }) => ({ x: y, y: -x });

export const mult = ({ x, y }, s) => ({ x: x * s, y: y * s });

export const midpoint = (a, b) => ({ x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 });

export const unit = (vector) => {
  const mag = magnitude(vector);
  return { x: vector.x / mag, y: vector.y / mag };
};

export const multScalar = ({ x, y }, scalar) => {
  return { x: x * scalar, y: y * scalar };
};

export const polarToCartesian = ({ angle, range }, orig = { x: 0, y: 0 }) => {
  let angleInRadians = degreesToRadians(REFERENCE_DIRECTION + angle);
  let cartesian = {
    x: range * Math.cos(angleInRadians),
    y: range * Math.sin(angleInRadians),
  };
  return { x: orig.x + cartesian.x, y: orig.y + cartesian.y };
};

export const cartesianToPolar = (point, orig = { x: 0, y: 0 }) => {
  let v = vector(point, orig);
  let range = magnitude(v);
  let angle = radiansToDegrees(Math.atan2(v.y, v.x));
  return { range, angle: angle - REFERENCE_DIRECTION };
};

export const pointsAreEqual = (a, b) => {
  return a.x === b.x && a.y === b.y;
};

export const pointIsOnSegment = ({ x, y }, [a, b], margin = MARGIN_OF_ERROR) =>
  x - margin <= Math.max(a.x, b.x) &&
  x + margin >= Math.min(a.x, b.x) &&
  y - margin <= Math.max(a.y, b.y) &&
  y + margin >= Math.min(a.y, b.y);

export const lineIntersectsLine = ([a, b], [c, d]) => {
  let a1 = b.y - a.y;
  let b1 = a.x - b.x;
  let c1 = a1 * a.x + b1 * a.y;

  let a2 = d.y - c.y;
  let b2 = c.x - d.x;
  let c2 = a2 * c.x + b2 * c.y;

  let determinant = a1 * b2 - a2 * b1;

  if (determinant === 0) {
    // parallel lines, never intersect
    return false;
  } else {
    let x = (b2 * c1 - b1 * c2) / determinant;
    let y = (a1 * c2 - a2 * c1) / determinant;

    return { x, y };
  }
};

export const segmentIntersectsSegment = (l1, l2) => {
  let pointOfIntersection = lineIntersectsLine(l1, l2);
  if (
    pointOfIntersection &&
    pointIsOnSegment(pointOfIntersection, l1) &&
    pointIsOnSegment(pointOfIntersection, l2)
  ) {
    return pointOfIntersection;
  } else {
    return false;
  }
};

export const isClockwise = (a, b) => {
  return b > a || a - b > 180;
};

export const createRect = ({ x: cx, y: cy }, w, h) => {
  const _w = w / 2;
  const _h = h / 2;
  return [
    { x: cx - _w, y: cy - _h },
    { x: cx + _w, y: cy - _h },
    { x: cx + _w, y: cy + _h },
    { x: cx - _w, y: cy + _h },
  ];
};

export const segmentsFromCorners = (points) =>
  points.map((a, i) => [a, points[(i + 1) % points.length]]);

export const segmentIntersectsPolygon = (segment, polygon) => {
  let intersections = polygon
    .map((from, i) => {
      const to = polygon[(i + 1) % polygon.length];
      return segmentIntersectsSegment(segment, [from, to]);
    })
    .filter((intersection) => !!intersection)
    .map((intersection) => ({
      intersection,
      distance: distance(intersection, segment[0]),
    }))
    .sort((a, b) => a.distance - b.distance);
  return intersections;
};

const segmentIntersectsCircle = (seg, c, r) => {
  const [a, b] = seg;
  const lab = distance(a, b);
  const d = { x: (b.x - a.x) / lab, y: (b.y - a.y) / lab };

  const t = d.x * (c.x - a.x) + d.y * (c.y - a.y);
  const e = { x: t * d.x + a.x, y: t * d.y + a.y };

  const lec = distance(e, c);

  if (lec < r) {
    const dt = Math.sqrt(Math.pow(r, 2) - Math.pow(lec, 2));
    const f = { x: (t - dt) * d.x + a.x, y: (t - dt) * d.y + a.y };
    const g = { x: (t + dt) * d.x + a.x, y: (t + dt) * d.y + a.y };

    return [f, g].filter((p) => pointIsOnSegment(p, seg));
  } else if (lec === r) {
    return true; // todo
  } else {
    return false;
  }
};

export const signedArea = (points) => {
  return (
    points.reduce((r, p, i) => {
      const next = points[(i + 1) % points.length];
      return r + (p.x * next.y - next.x * p.y);
    }, 0) / 2
  );
};

export const calculateArea = (points) => {
  if (points && points.length > 2) {
    return Math.abs(signedArea(points));
  }
  return 0;
};

export const nearestIntersection = (from, angle, walls, coords) => {
  const to = polarToCartesian({ range: HUGE_DISTANCE, angle }, from);
  const intersections = walls
    .map(([a, b]) =>
      segmentIntersectsSegment([from, to], [coords[a], coords[b]])
    )
    .filter((intersection) => !!intersection)
    .map((intersection) => ({
      intersection,
      distance: distance(intersection, from),
    }))
    .sort((a, b) => a.distance - b.distance);

  return intersections?.[0]?.intersection;
};

export const getVisibilityPolygon = (from, cartesianCoords) => {
  // wall corners as indexes into the cartesian coords array
  const walls = cartesianCoords.map((_, i) => [
    i,
    (i + 1) % cartesianCoords.length,
  ]);

  // get all points in polar coords, giving us angles from camera
  const polar = cartesianCoords.map((c) => cartesianToPolar(c, from));

  // reduce to the set of unique angles that we need to test
  const unique = Array.from(
    polar.reduce((r, { angle }) => r.add(angle), new Set())
  );

  // sort into clockwise order
  const clockwise = unique.sort((a, b) => a - b);

  // produce angles slightly CCW and CW of each angle in the list
  const checkPoints = clockwise
    .map((angle) => [angle - 0.01, angle, angle + 0.01])
    .flat();

  // for each angle, find the nearest intersection with a wall
  const polygon = checkPoints.map((angle) => {
    return nearestIntersection(from, angle, walls, cartesianCoords);
  });

  return polygon.some((point) => !point) ? [] : polygon;
};

export const segmentIntersectsEllipse = ([a, b], { c, rx, ry }) => {
  return a;
};

export const circleIntersectsCircle = (
  { x: x1, y: y1, r: r1 },
  { x: x2, y: y2, r: r2 }
) => {
  // vertical and horizontal distances between circle centres
  const dx = x2 - x1;
  const dy = y2 - y1;

  // straight-line distance between centres
  const d = magnitude({ x: dx, y: dy });

  if (d > r1 + r2) {
    // circles do not intersect
    return [];
  }
  if (d < Math.abs(r1 - r2)) {
    // one circle is inside the other
    return [];
  }

  const a = (r1 * r1 - r2 * r2 + d * d) / (2.0 * d);

  const x3 = x1 + (dx * a) / d;
  const y3 = y1 + (dy * a) / d;

  const h = Math.sqrt(r1 * r1 - a * a);

  const rx = -dy * (h / d);
  const ry = dx * (h / d);

  const i1x = Math.round(x3 + rx);
  const i2x = Math.round(x3 - rx);
  const i1y = Math.round(y3 + ry);
  const i2y = Math.round(y3 - ry);

  return [
    { x: i1x, y: i1y },
    { x: i2x, y: i2y },
  ];
};

export const circleIntersectsSegments = (c, r, segments) => {
  return segments
    .map((segment) => {
      return segmentIntersectsCircle(segment, c, r);
    })
    .filter((intersection) => !!intersection)
    .flat();
};

export const nearestPoint = (sides, point) => {
  return sides.reduce(
    (r, [a, b]) => {
      const { dist, p } = r;
      const da = p === a ? dist : distance(a, point);
      const db = p === b ? dist : distance(b, point);
      if (da < db) {
        if (da < dist) {
          return { dist: da, p: a };
        }
      }
      if (db < da) {
        if (db < dist) {
          return { dist: db, p: b };
        }
      }
      return r;
    },
    { dist: Number.MAX_SAFE_INTEGER }
  );
};

export const circularArcCentre = (start, end, radius) => {
  const l = distance(start, end);
  const theta = radiansToDegrees(Math.acos(l / 2 / radius));
  const { angle: sourceTargetAngle } = cartesianToPolar(start, end);
  return polarToCartesian(
    { angle: Math.round(sourceTargetAngle + theta), range: radius },
    end
  );
};

export const sortNearestTo = (listOfPoints, to) => {
  return listOfPoints
    .map((p) => ({ dist: distance(p, to), p }))
    .sort((a, b) => a.dist - b.dist)
    .map(({ p }) => p);
};

const getPointsOnEllipse = ({ fromRadians, toRadians, rx, ry, inc }) => {
  let result = [];
  for (let angle = fromRadians; angle <= toRadians; angle += inc) {
    result.push({
      x: rx * Math.cos(angle),
      y: ry * Math.sin(angle),
    });
  }
  return result;
};

export const translateAll = (points, translation) => {
  return points.map(({ x, y }) => ({
    x: x + translation.x,
    y: y + translation.y,
  }));
};

export const getExtents = (points) => {
  return points.reduce(
    (r, p) => {
      return {
        minX: Math.min(r.minX, p.x),
        minY: Math.min(r.minY, p.y),
        maxX: Math.max(r.maxX, p.x),
        maxY: Math.max(r.maxY, p.y),
      };
    },
    {
      minX: Number.MAX_SAFE_INTEGER,
      minY: Number.MAX_SAFE_INTEGER,
      maxX: Number.MIN_SAFE_INTEGER,
      maxY: Number.MIN_SAFE_INTEGER,
    }
  );
};

export const getBoundingBox = (points) => {
  const { minX, minY, maxX, maxY } = getExtents(points);
  return [
    { x: minX, y: minY },
    { x: maxX, y: minY },
    { x: maxX, y: maxY },
    { x: minX, y: maxY },
  ];
};

export const approximateRoundedRect = ({ c, w, h, rx, ry, incDegrees = 5 }) => {
  let incRadians = degreesToRadians(incDegrees);

  const bottomLeftToMidLeftCurve = translateAll(
    getPointsOnEllipse({
      fromRadians: degreesToRadians(90),
      toRadians: degreesToRadians(181),
      rx,
      ry,
      inc: incRadians,
    }),
    { x: c.x + (rx - w / 2), y: c.y + h / 2 - ry }
  );
  const midLeftToTopLeftCurve = translateAll(
    getPointsOnEllipse({
      fromRadians: degreesToRadians(180),
      toRadians: degreesToRadians(271),
      rx,
      ry,
      inc: incRadians,
    }),
    { x: c.x + (rx - w / 2), y: c.y - h / 2 + ry }
  );
  const topRightToMidRightCurve = translateAll(
    getPointsOnEllipse({
      fromRadians: degreesToRadians(270),
      toRadians: degreesToRadians(361),
      rx,
      ry,
      inc: incRadians,
    }),
    { x: c.x + (w / 2 - rx), y: c.y - h / 2 + ry }
  );
  const midRightToBottomRightCurve = translateAll(
    getPointsOnEllipse({
      fromRadians: degreesToRadians(0),
      toRadians: degreesToRadians(91),
      rx,
      ry,
      inc: incRadians,
    }),
    { x: c.x + (w / 2 - rx), y: c.y + h / 2 - ry }
  );
  return [
    bottomLeftToMidLeftCurve,
    midLeftToTopLeftCurve,
    topRightToMidRightCurve,
    midRightToBottomRightCurve,
  ].flat();
};

export const getInsetBoundary = (boundary, insetDistance) => {
  const segments = boundary.map((p1, i) => {
    const p2 = boundary[(i + 1) % boundary.length];
    const offset = mult(unit(normalCW(vector(p1, p2))), insetDistance);
    return [
      { x: p1.x + offset.x, y: p1.y + offset.y },
      { x: p2.x + offset.x, y: p2.y + offset.y },
    ];
  });
  // todo: handle edge case where two adjacent segments are actually in the exact
  //       same direction (a continuation of the same wall), as this will break
  //       the algorithm (the intersection of a line equation with itself will give
  //       intersections at +/- infinity) - just need to remove the intermediate point
  ///      which may be better to do before one step earlier on the array of points
  return segments.map((s1, i) => {
    const s2 = segments[(i + 1) % segments.length];
    return lineIntersectsLine(s1, s2);
  });
};

export const isInsideBoundary = (point, boundarySegments) => {
  // a reference point that is definitely outside the boundary
  // and in a position where it is _extremely_ unlikely that
  // a line from a point inside the boundary will intersect
  // precisely with one corner of the shape itself, which would
  // give a false negative result

  const pointOutsideBoundary = {
    x: HUGE_DISTANCE + Math.random(),
    y: HUGE_DISTANCE + Math.random(),
  };
  const l1 = [point, pointOutsideBoundary];
  const intersections = boundarySegments.reduce((r, l2) => {
    return segmentIntersectsSegment(l1, l2) ? r + 1 : r;
  }, 0);

  return intersections % 2 !== 0;
};
