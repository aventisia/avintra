export interface Participant {
  userName: string;
  userFullName: string;
  avatarSrc?: string;
  initials: string;
  type?: string;
  isCurrentUser?: boolean;
}
