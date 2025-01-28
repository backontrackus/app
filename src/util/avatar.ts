import hash from "js-sha256";

type AvatarUser = {
  avatarUrl?: string;
  id: string;
};

export function getAvatarUrl(user: AvatarUser) {
  return (
    user.avatarUrl ||
    `https://www.gravatar.com/avatar/${hash.sha256(user.id)}?d=identicon`
  );
}
