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
      className="flex w-full flex-col items-center gap-4 rounded-xl shadow-xl hover:shadow-secondary-500"
    >
      <div className="flex w-full items-center justify-center gap-4">
        <Image
          src={socialLink.img}
          alt="Profile picture"
          className="h-[50px] w-[65px] rounded-xl bg-white object-cover md:h-[100px] md:w-[100px]"
          priority
          // width={100}
          // height={100}
        />
      </div>
    </Link>
  );
};

export default SocialCard;
