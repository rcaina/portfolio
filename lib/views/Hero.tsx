import Image from "next/image";
import profile from "@/public/images/profileImg.jpg";
import { JOB_TITLE, NAME, socialLinks } from "../contants";
import SocialCard from "@/components/common/SocialCard";

const Hero = () => {
  return (
    <div className="flex w-full flex-col items-center justify-center gap-4">
      <div>
        <div className="flex w-full items-center justify-center gap-8">
          <Image
            src={profile}
            alt="Profile picture"
            className="rounded-full"
            priority
            width={150}
            height={150}
          />
          <div className="flex w-full flex-col gap-4 text-left">
            <div className="p-2">
              <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl">
                {NAME}
              </h1>
              <p className="text-lg text-secondary-500 sm:text-xl md:text-2xl lg:text-3xl">
                {JOB_TITLE}
              </p>
              <div className="flex items-center gap-4">
                <h2 className="items-center text-xl font-medium">Email:</h2>
                <a
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    window.location.href =
                      "mailto:" + "renzo.caina" + "@" + "outlook.com";
                  }}
                  className="group inline-flex items-center justify-center text-lg text-secondary-500 hover:text-blue-500 dark:text-gray-300 dark:hover:text-blue-400"
                >
                  renzo.caina@outlook.com
                </a>
              </div>
            </div>
            <hr className="mb-6 w-full border-secondary-500" />

            <div className="flex items-center gap-4 p-2">
              <button
                onClick={() =>
                  window.open(
                    "https://rcaina.github.io/portfolio/files/renzo_caina_resume.pdf",
                    "_blank",
                    "noopener,noreferrer"
                  )
                }
                className="rounded-xl border border-foreground p-3 text-sm shadow-lg hover:shadow-secondary-500 md:text-base"
              >
                View Resume
              </button>
              {socialLinks.map((link, index) => (
                <div key={index}>
                  <SocialCard socialLink={link} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;
