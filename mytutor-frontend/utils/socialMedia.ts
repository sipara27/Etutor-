export type SocialSharePlatform =
  | "facebook"
  | "linkedin"
  | "telegram"
  | "twitter";

export interface SocialShareData {
  url: string;
  title?: string;
  text?: string;
}

export const SOCIAL_PROFILE_LINKS = {
  website: "https://mytutor.com.et",
  facebook:
    process.env.NEXT_PUBLIC_FACEBOOK_LINK ||
    "https://www.facebook.com/mytutorofficiall",
  instagram:
    process.env.NEXT_PUBLIC_INSTAGRAM_LINK ||
    "https://www.instagram.com/mytutorofficiall/",
  tiktok:
    process.env.NEXT_PUBLIC_TIKTOK_LINK ||
    "https://www.tiktok.com/@mytutorofficial",
  telegram:
    process.env.NEXT_PUBLIC_TELEGRAM_LINK ||
    "https://t.me/mytutorofficial",
  linkedin:
    process.env.NEXT_PUBLIC_LINKEDIN_LINK ||
    "https://www.linkedin.com/in/mytutorofficial/",
} as const;

export const buildSocialShareUrl = (
  platform: SocialSharePlatform,
  { url, title, text }: SocialShareData
) => {
  const encodedUrl = encodeURIComponent(url);
  const encodedMessage = encodeURIComponent(
    text?.trim() || title?.trim() || "Take a look at this on MyTutor"
  );

  switch (platform) {
    case "facebook":
      return `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`;
    case "linkedin":
      return `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`;
    case "telegram":
      return `https://t.me/share/url?url=${encodedUrl}&text=${encodedMessage}`;
    case "twitter":
      return `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedMessage}`;
  }
};

export const openExternalLink = (url: string) => {
  if (typeof window === "undefined") return;

  const openedWindow = window.open(url, "_blank", "noopener,noreferrer");
  if (openedWindow) openedWindow.opener = null;
};
