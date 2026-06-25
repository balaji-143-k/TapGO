export const stripName = (name) => {
  if (!name) return '';
  // Remove parenthetical suffixes like " (Bellary)" and trim
  const idx = name.indexOf('(');
  if (idx === -1) return name.trim();
  return name.substring(0, idx).trim();
};

export default { stripName };
