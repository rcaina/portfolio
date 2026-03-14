import Image from "next/image";
import { SocialLink } from "@/pages/index";
import Link from "next/link";

type Props = {
  socialLink: SocialLink;
};
const SocialCard = ({ socialLink }: Props) => {
  return (
    <Link
      href={socialLink.link}
      target="_blank"
      className="flex w-full flex-col items-center gap-4 rounded-full shadow-xl hover:shadow-secondary-500"
    >
      <div className="flex w-full items-center justify-center gap-4">
        <Image
          src={socialLink.img}
          alt="Profile picture"
          className={`h-[44px] w-[44px] rounded-full bg-white object-cover md:h-[50px] md:w-[50px] ${
            socialLink.color ? `border border-${socialLink.color}` : ""
          }`}
          priority
        />
      </div>
    </Link>
  );
};

export default SocialCard;
