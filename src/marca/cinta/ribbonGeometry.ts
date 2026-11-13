/*
 * COPIA TAL CUAL de zhonyas-web/app/ribbonGeometry.ts (commit f542223 de main).
 * No se toca ni una línea por debajo de este comentario: la geometría de la
 * cinta es la de la web (02 §5.2; síntesis Z-02). Para comprobarlo:
 *   diff <(tail -n +9 src/marca/cinta/ribbonGeometry.ts) C:/Users/joser/zhonyas-web/app/ribbonGeometry.ts
 * Si la web cambia la cinta, se vuelve a copiar el archivo entero.
 */

type Point = {
  x: number;
  y: number;
};

type RouteLocation = {
  point: Point;
  angle: number;
  segmentIndex: number;
  distance: number;
};

export type RibbonGeometry = {
  showOriginal: boolean;
  basePath: string;
  bodyPath: string;
  tipPath: string;
  clipTip: boolean;
};

const finalBaseExtension = 280;

const topStart = { x: 389, y: 440 };
const cornerStart = { x: 626, y: 440 };
const cornerControlA = { x: 645, y: 440 };
const cornerControlB = { x: 650, y: 455 };
const cornerEnd = { x: 631, y: 474 };
const diagonalEnd = { x: 458, y: 665 };
const bottomControlA = { x: 440, y: 686 };
const bottomControlB = { x: 420, y: 700 };
const bottomJoin = { x: 470, y: 700 };
const lowerInnerJoin = { x: 413.738, y: 661.118 };
const lowerInnerControl = { x: 405.578, y: 671.798 };

const clamp = (value: number, minimum = 0, maximum = 1) =>
  Math.min(maximum, Math.max(minimum, value));

const distance = (start: Point, end: Point) =>
  Math.hypot(end.x - start.x, end.y - start.y);

const interpolatePoint = (start: Point, end: Point, progress: number): Point => ({
  x: start.x + (end.x - start.x) * progress,
  y: start.y + (end.y - start.y) * progress,
});

const cubicPoint = (
  start: Point,
  controlA: Point,
  controlB: Point,
  end: Point,
  progress: number,
): Point => {
  const inverse = 1 - progress;

  return {
    x:
      inverse ** 3 * start.x +
      3 * inverse ** 2 * progress * controlA.x +
      3 * inverse * progress ** 2 * controlB.x +
      progress ** 3 * end.x,
    y:
      inverse ** 3 * start.y +
      3 * inverse ** 2 * progress * controlA.y +
      3 * inverse * progress ** 2 * controlB.y +
      progress ** 3 * end.y,
  };
};

const routePoints: Point[] = [topStart, cornerStart];

for (let index = 1; index <= 24; index += 1) {
  routePoints.push(
    cubicPoint(
      cornerStart,
      cornerControlA,
      cornerControlB,
      cornerEnd,
      index / 24,
    ),
  );
}

const cornerEndIndex = routePoints.length - 1;

for (let index = 1; index <= 24; index += 1) {
  routePoints.push(interpolatePoint(cornerEnd, diagonalEnd, index / 24));
}

const diagonalEndIndex = routePoints.length - 1;

for (let index = 1; index <= 24; index += 1) {
  routePoints.push(
    cubicPoint(
      diagonalEnd,
      bottomControlA,
      bottomControlB,
      bottomJoin,
      index / 24,
    ),
  );
}

const cumulativeDistances = [0];

for (let index = 1; index < routePoints.length; index += 1) {
  cumulativeDistances.push(
    cumulativeDistances[index - 1] + distance(routePoints[index - 1], routePoints[index]),
  );
}

const routeLength = cumulativeDistances.at(-1) ?? 0;
const cornerEndDistance = cumulativeDistances[cornerEndIndex];
const diagonalEndDistance = cumulativeDistances[diagonalEndIndex];

const smoothstep = (value: number) => {
  const progress = clamp(value);
  return progress * progress * (3 - 2 * progress);
};

const ribbonWidthAtDistance = (routeDistance: number) => {
  const diagonalTransitionEnd = cornerEndDistance + 34;
  const bottomTransitionStart = diagonalEndDistance - 42;

  if (routeDistance <= cornerEndDistance) return 72;

  if (routeDistance < diagonalTransitionEnd) {
    return (
      72 -
      4 *
        smoothstep(
          (routeDistance - cornerEndDistance) /
            (diagonalTransitionEnd - cornerEndDistance),
        )
    );
  }

  if (routeDistance <= bottomTransitionStart) return 68;

  if (routeDistance < diagonalEndDistance) {
    return (
      68 +
      4 *
        smoothstep(
          (routeDistance - bottomTransitionStart) /
            (diagonalEndDistance - bottomTransitionStart),
        )
    );
  }

  return 72;
};

const locateOnRoute = (requestedDistance: number): RouteLocation => {
  const targetDistance = clamp(requestedDistance, 0, routeLength);

  for (let index = 0; index < routePoints.length - 1; index += 1) {
    const segmentStartDistance = cumulativeDistances[index];
    const segmentEndDistance = cumulativeDistances[index + 1];

    if (targetDistance <= segmentEndDistance || index === routePoints.length - 2) {
      const start = routePoints[index];
      const end = routePoints[index + 1];
      const segmentLength = segmentEndDistance - segmentStartDistance;
      const segmentProgress =
        segmentLength === 0
          ? 0
          : (targetDistance - segmentStartDistance) / segmentLength;

      return {
        point: interpolatePoint(start, end, segmentProgress),
        angle: (Math.atan2(end.y - start.y, end.x - start.x) * 180) / Math.PI,
        segmentIndex: index,
        distance: targetDistance,
      };
    }
  }

  return {
    point: bottomJoin,
    angle: 0,
    segmentIndex: routePoints.length - 2,
    distance: routeLength,
  };
};

const rotateLocalPoint = (
  origin: Point,
  angleDegrees: number,
  localX: number,
  localY: number,
): Point => {
  const angleRadians = (angleDegrees * Math.PI) / 180;
  const cosine = Math.cos(angleRadians);
  const sine = Math.sin(angleRadians);

  return {
    x: origin.x + localX * cosine - localY * sine,
    y: origin.y + localX * sine + localY * cosine,
  };
};

const pointAlongAngle = (origin: Point, angleDegrees: number, length: number): Point => {
  const angleRadians = (angleDegrees * Math.PI) / 180;

  return {
    x: origin.x + Math.cos(angleRadians) * length,
    y: origin.y + Math.sin(angleRadians) * length,
  };
};

const formatPoint = (point: Point) => `${point.x.toFixed(3)} ${point.y.toFixed(3)}`;

const buildMovingTipPath = (tip: Point, angle: number, ribbonWidth: number) => {
  const crossScale = ribbonWidth / 72;
  const local = (x: number, y: number) =>
    rotateLocalPoint(tip, angle, x, y * crossScale);

  const pointTop = local(0, -36);
  const rearTop = local(72, -36);
  const rearBottom = local(72, 36);
  const lowerEdge = local(63, 36);
  const lowerCurveA = local(42, 36);
  const lowerCurveB = local(26, 25);
  const lowerKnee = local(17, 7);
  const pointedEdge = local(-3, -26);
  const pointedCurveA = local(-7, -32);
  const pointedCurveB = local(-4, -36);

  return [
    `M ${formatPoint(pointTop)}`,
    `L ${formatPoint(rearTop)}`,
    `L ${formatPoint(rearBottom)}`,
    `L ${formatPoint(lowerEdge)}`,
    `C ${formatPoint(lowerCurveA)} ${formatPoint(lowerCurveB)} ${formatPoint(lowerKnee)}`,
    `L ${formatPoint(pointedEdge)}`,
    `C ${formatPoint(pointedCurveA)} ${formatPoint(pointedCurveB)} ${formatPoint(pointTop)}`,
    "Z",
  ].join(" ");
};

const buildMovingBodyPath = (bodyAnchor: RouteLocation) => {
  const bodyPoints = [{ point: bodyAnchor.point, distance: bodyAnchor.distance }];

  for (let index = bodyAnchor.segmentIndex + 1; index < routePoints.length; index += 1) {
    if (cumulativeDistances[index] > bodyAnchor.distance + 0.001) {
      bodyPoints.push({ point: routePoints[index], distance: cumulativeDistances[index] });
    }
  }

  if (bodyPoints.length < 2) return "";

  const leftEdge: Point[] = [];
  const rightEdge: Point[] = [];

  for (let index = 0; index < bodyPoints.length; index += 1) {
    const previous = bodyPoints[Math.max(0, index - 1)].point;
    const next = bodyPoints[Math.min(bodyPoints.length - 1, index + 1)].point;
    const tangentX = next.x - previous.x;
    const tangentY = next.y - previous.y;
    const tangentLength = Math.hypot(tangentX, tangentY) || 1;
    const normalX = -tangentY / tangentLength;
    const normalY = tangentX / tangentLength;
    const halfWidth = ribbonWidthAtDistance(bodyPoints[index].distance) / 2;

    leftEdge.push({
      x: bodyPoints[index].point.x + normalX * halfWidth,
      y: bodyPoints[index].point.y + normalY * halfWidth,
    });
    rightEdge.push({
      x: bodyPoints[index].point.x - normalX * halfWidth,
      y: bodyPoints[index].point.y - normalY * halfWidth,
    });
  }

  return [
    `M ${formatPoint(leftEdge[0])}`,
    ...leftEdge.slice(1).map((point) => `L ${formatPoint(point)}`),
    ...rightEdge.reverse().map((point) => `L ${formatPoint(point)}`),
    "Z",
  ].join(" ");
};

export const buildRibbonGeometry = (requestedProgress: number): RibbonGeometry => {
  const progress = clamp(requestedProgress);

  if (progress === 0) {
    return {
      showOriginal: true,
      basePath: "",
      bodyPath: "",
      tipPath: "",
      clipTip: true,
    };
  }

  const traveledDistance = progress * routeLength;
  const bodyAnchor = locateOnRoute(Math.min(routeLength, traveledDistance + 63));
  const tipPoint = pointAlongAngle(bodyAnchor.point, bodyAnchor.angle, -63);
  const movingRibbonWidth = ribbonWidthAtDistance(bodyAnchor.distance);
  const movingTipPath = buildMovingTipPath(tipPoint, bodyAnchor.angle, movingRibbonWidth);
  const movingBodyPath = progress < 1 ? buildMovingBodyPath(bodyAnchor) : "";
  const baseExtension = finalBaseExtension * progress;
  const extended = (originalX: number) => (originalX + baseExtension).toFixed(3);

  const baseMaskPath = `M 505 664 H ${extended(705)} C ${extended(731)} 664 ${extended(750)} 676 ${extended(762)} 698 L ${extended(776)} 726 C ${extended(779)} 732 ${extended(775)} 738 ${extended(768)} 738 H 437 C 412 738 395 721 395 696 C 395 682 ${lowerInnerControl.x} ${lowerInnerControl.y} ${lowerInnerJoin.x} ${lowerInnerJoin.y} L 505 664 Z`;

  const capCrossScale = movingRibbonWidth / 72;
  const capRearTop = rotateLocalPoint(
    tipPoint,
    bodyAnchor.angle,
    72,
    -36 * capCrossScale,
  );
  const capRearBottom = rotateLocalPoint(
    tipPoint,
    bodyAnchor.angle,
    72,
    36 * capCrossScale,
  );
  const transitionTopX = capRearTop.x - 8;
  const transitionBottomX = capRearBottom.x - 1;
  const transitionBottomY = Math.min(738, capRearBottom.y);
  const transitionCurveStartX = transitionBottomX + 24;

  const transitionalBaseMaskPath = `M ${transitionTopX.toFixed(3)} 664 H ${extended(705)} C ${extended(731)} 664 ${extended(750)} 676 ${extended(762)} 698 L ${extended(776)} 726 C ${extended(779)} 732 ${extended(775)} 738 ${extended(768)} 738 H ${transitionCurveStartX.toFixed(3)} C ${(transitionBottomX + 16).toFixed(3)} 738 ${(transitionBottomX + 8).toFixed(3)} ${transitionBottomY.toFixed(3)} ${transitionBottomX.toFixed(3)} ${transitionBottomY.toFixed(3)} L ${transitionTopX.toFixed(3)} 664 Z`;

  const activeBaseMaskPath =
    tipPoint.y >= 660 ? transitionalBaseMaskPath : baseMaskPath;
  const exactTopBodyStart = Math.min(bodyAnchor.point.x, 591).toFixed(3);
  const exactTopBodyPath = `M ${exactTopBodyStart} 404 H 626 C 656 404 678 426 678 455 C 678 470 673 482 662 493 L 505 664 H ${extended(705)} C ${extended(731)} 664 ${extended(750)} 676 ${extended(762)} 698 L ${extended(776)} 726 C ${extended(779)} 732 ${extended(775)} 738 ${extended(768)} 738 H 437 C 412 738 395 721 395 696 C 395 682 400 672 410 661 L 591 476 H ${exactTopBodyStart} Z`;
  const preserveExactLogoBody = progress < 1 && bodyAnchor.segmentIndex === 0;

  return {
    showOriginal: false,
    basePath: preserveExactLogoBody ? exactTopBodyPath : activeBaseMaskPath,
    bodyPath: preserveExactLogoBody ? "" : movingBodyPath,
    tipPath: movingTipPath,
    clipTip: bodyAnchor.distance < diagonalEndDistance,
  };
};
