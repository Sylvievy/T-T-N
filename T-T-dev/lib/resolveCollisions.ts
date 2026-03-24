function resolveCollisions(labels: any[], lineHeight = 14, buffer = 3) {
  if (!labels.length) return labels;

  const minGap = lineHeight + buffer;

  labels.sort((a, b) => a.naturalEy - b.naturalEy);
  labels.forEach((l) => (l.ey = l.naturalEy));

  // Push down: if too close, nudge the lower label down
  for (let i = 1; i < labels.length; i++) {
    if (labels[i].ey - labels[i - 1].ey < minGap) {
      labels[i].ey = labels[i - 1].ey + minGap;
    }
  }

  // Push up: pull back labels that got pushed too far from their natural position
  for (let i = labels.length - 2; i >= 0; i--) {
    if (labels[i + 1].ey - labels[i].ey < minGap) {
      labels[i].ey = labels[i + 1].ey - minGap;
    }
  }

  return labels;
}

export default resolveCollisions;
