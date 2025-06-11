export const formatDuration = (sec: number) => {
  const min = Math.floor(sec / 60);
  const secRemain = sec % 60;
  return `${min}m ${secRemain}s`;
};
