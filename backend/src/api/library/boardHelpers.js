// Turns "a.b(c" into "a\.b\(c" so user text can't break the regex search
export const escapeRegex = (text) =>
  text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

export const BOARD_TYPES = ['all', 'mine', 'shared'];
export const ROLES = ['owner', 'editor', 'viewer'];

// Frontend sends ?sort=updated | created | name_asc | name_desc
// (old values "newest" / "oldest" still work so nothing breaks)
export const SORT_OPTIONS = {
  updated: { updatedAt: -1, _id: -1 }, // Recently updated
  created: { createdAt: -1, _id: -1 }, // Recently created
  name_asc: { title: 1, _id: 1 }, // Name (A-Z)
  name_desc: { title: -1, _id: -1 }, // Name (Z-A)
  newest: { updatedAt: -1, _id: -1 },
  oldest: { updatedAt: 1, _id: 1 },
};

// Safely turn a string like "2026-10-01" into a Date (or null if invalid)
export const parseDate = (value, endOfDay = false) => {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  if (endOfDay) date.setHours(23, 59, 59, 999); // include the whole "to" day
  return date;
};
