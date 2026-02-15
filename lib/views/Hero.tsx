import Image from "next/image";
import profile from "@/public/images/profileImg.jpg";
import { JOB_TITLE, NAME, socialLinks } from "../contants";
import SocialCard from "@/components/common/SocialCard";

const Hero = () => {
  return (
    <div className="flex w-full max-w-5xl flex-col items-center justify-center gap-6 px-4 sm:flex-row sm:items-center sm:gap-8">
      <Image
        src={profile}
        alt="Profile picture"
        className="rounded-full"
        priority
        width={150}
        height={150}
      />
      <div className="flex w-full flex-col gap-4 text-center sm:w-auto sm:text-left">
        <div className="ml-6 mr-6">
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl">
            {NAME}
          </h1>
          <p className="text-lg text-secondary-500 sm:text-xl md:text-2xl lg:text-3xl">
            {JOB_TITLE}
          </p>
          <div className="mt-2 flex flex-col items-center gap-1 sm:flex-row sm:items-center sm:gap-4">
            <h2 className="text-xl font-medium">e-mail:</h2>
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                window.location.href = "mailto:hello@outlook.com";
              }}
              className="text-lg text-secondary-500 hover:text-blue-500 dark:text-gray-300 dark:hover:text-blue-400"
            >
              renzo.caina@outlook.com
            </a>
          </div>
        </div>
        <hr className="w-full border-secondary-500" />
        <div className="ml-6 mr-6 flex flex-col items-center gap-4 sm:flex-row sm:items-center sm:justify-between">
          <button
            onClick={() =>
              window.open(
                "https://rcaina.github.io/portfolio/files/renzo_caina.pdf",
                "_blank",
                "noopener,noreferrer"
              )
            }
            className="rounded-xl border border-foreground p-3 text-sm shadow-lg hover:shadow-secondary-500 md:text-base"
          >
            View Resume
          </button>

          <div className="flex gap-4">
            {socialLinks.map((link, index) => (
              <SocialCard key={index} socialLink={link} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;
