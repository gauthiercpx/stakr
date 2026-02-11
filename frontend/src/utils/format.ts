export const normalizeText = (v: string) => v.trim();

export const formatFirstName = (value: string) => {
  const trimmed = value.trim();
  if (!trimmed) return '';
  return trimmed
    .toLowerCase()
    .split(/(\s+|-)/g)
    .map((part) => {
      if (part === '-' || /^\s+$/.test(part)) return part;
      return part.charAt(0).toUpperCase() + part.slice(1);
    })
    .join('');
};

export const formatLastName = (value: string) => value.trim().toUpperCase();

export const formatJobTitle = (value: string) => {
  const trimmed = value.trim();
  if (!trimmed) return '';
  return trimmed
    .toLowerCase()
    .split(/(\s+|-)/g)
    .map((part) => {
      if (part === '-' || /^\s+$/.test(part)) return part;
      return part.charAt(0).toUpperCase() + part.slice(1);
    })
    .join('');
};

