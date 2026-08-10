import {
  buildSocialShareUrl,
  openExternalLink,
  SOCIAL_PROFILE_LINKS,
  SocialSharePlatform,
} from "@/utils/socialMedia";

interface SocialMediaOptions {
  url?: string;
  title?: string;
  text?: string;
}

const useSocialMedia = (options: SocialMediaOptions = {}) => {
  const share = (platform: SocialSharePlatform) => {
    const currentUrl =
      options.url ||
      (typeof window !== "undefined"
        ? window.location.href
        : SOCIAL_PROFILE_LINKS.website);
    const currentTitle =
      options.title ||
      (typeof document !== "undefined" ? document.title : "MyTutor");

    openExternalLink(
      buildSocialShareUrl(platform, {
        url: currentUrl,
        title: currentTitle,
        text: options.text,
      })
    );
  };

  return {
    handleFacebook: () => share("facebook"),
    handleLinkedin: () => share("linkedin"),
    handleTelegram: () => share("telegram"),
    handleTweet: () => share("twitter"),
    handleInstagram: () => openExternalLink(SOCIAL_PROFILE_LINKS.instagram),
  };
};

export default useSocialMedia;
