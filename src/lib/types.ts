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
  /** 강조 표시 (눈에 띄는 색으로 보여 줄 링크) */
  isFeatured: boolean;
  clickCount: number;
}

export interface PublicPage {
  profile: Profile;
  links: LinkItem[];
}
