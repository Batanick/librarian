export const BuildSvgPath = (x1, y1, x2, y2) => {
  const cx = x1 + (x2 - x1) / 2;
  const cy = y1 + (y2 - y1) / 2;

  return `M${x1} ${y1} Q ${cx} ${y1}, ${cx} ${cy} T ${x2} ${y2}`;
};

export const BuildSvgPath2 = (x1, y1, x2, y2) => {
  const cx = x1 + (x2 - x1) / 2;
  const cy = y1 + (y2 - y1) / 2;

  return `M${x1} ${y1} Q ${cx} ${y1}, ${cx} ${cy} T ${x2} ${y2}`;
};
