export interface Profile {
  id: string;
  username: string;
  displayName: string;
  bio: string;
  avatarUrl: string | null;
}

export interface LinkItem {
  id: string;
  userId: string;
  title: string;
  url: string;
  position: number;
  isVisible: boolean;
  clickCount: number;
}

export interface PublicPage {
  profile: Profile;
  links: LinkItem[];
}
