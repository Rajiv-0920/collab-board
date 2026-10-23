export const pluralize = (count, singular) =>
  `${count} ${count === 1 ? singular : `${singular}s`}`;
