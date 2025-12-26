const getInitials = (name?: string | null, fallback = "U"): string => {
  if (!name) return fallback;
  const words = name.trim().split(" ");
  return words.length > 1
    ? words
        .slice(0, 2)
        .map((w) => w[0])
        .join("")
        .toUpperCase()
    : name[0].toUpperCase();
};


export { getInitials };