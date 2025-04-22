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
          className="h-[200px] w-[200px] rounded-xl bg-white object-cover"
          priority
          width={200}
          height={200}
        />
      </div>
      <div className="flex flex-col items-center space-y-4">
        <h1 className="text-xl font-medium sm:text-2xl md:text-3xl lg:text-4xl">
          {socialLink.name}
        </h1>
      </div>
    </Link>
  );
};

export default SocialCard;
