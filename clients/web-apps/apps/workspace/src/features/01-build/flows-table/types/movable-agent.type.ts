/**
 * The agent fields needed to move an agent between folders.
 */
export type MovableAgent = {
  id: string;
  name: string;
  folderId: string | null;
};
