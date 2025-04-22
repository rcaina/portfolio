import Image from "next/image";
import profile from "@/public/images/profileImg.jpg";
import { JOB_TITLE, NAME } from "../contants";

const Hero = () => {
  return (
    <div className="flex w-full flex-col items-center gap-4">
      <div className="flex w-full items-center gap-4">
        <hr className="w-full border-secondary-500" />
        <Image
          src={profile}
          alt="Profile picture"
          className="rounded-full"
          priority
          width={300}
          height={300}
        />
        <hr className="w-full border-secondary-500" />
      </div>
      <div className="flex flex-col items-center space-y-4">
        <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl">{NAME}</h1>
        <p className="text-lg text-secondary-500 sm:text-xl md:text-2xl lg:text-3xl">
          {JOB_TITLE}
        </p>
      </div>
    </div>
  );
};

export default Hero;
