export const isValidEmail = (s: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);

export const isValidFirstNameFormat = (s: string) => {
  const v = s.trim();
  return /^[A-Za-zÀ-ÖØ-öø-ÿ' -]+$/.test(v);
};

export const isValidName = (s: string) => {
  const v = s.trim();
  return v.length >= 1 && v.length <= 50;
};

