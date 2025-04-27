// lib/generateId.ts
export const generateUniqueId = (): string => {
  const generateSegment = () => {
    return Math.random().toString(36).substring(2, 6); // Generate 4 random alphanumeric characters
  };

  const segment1 = generateSegment();
  const segment2 = generateSegment();

  return `${segment1}-${segment2}`; // Combine segments with a hyphen
};
