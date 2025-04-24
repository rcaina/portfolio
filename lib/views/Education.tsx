import Image from "next/image";
import byulogo from "@/public/images/byulogo.png";
import csBuilding from "@/public/images/csbuilding.jpg";
import marriot from "@/public/images/marriot.jpg";
import { MAJOR, MINOR } from "@/lib/contants";

const Education = () => {
  return (
    <div className="flex flex-col gap-8">
      <div className="flex w-full flex-col items-center gap-4 rounded-xl">
        <div className="flex w-full flex-col items-center gap-4 rounded-xl">
          <div className="flex w-full items-center justify-center gap-4">
            <h2 className="text-4xl">EDUCATION</h2>
          </div>
        </div>
      </div>
      <div className="flex w-full items-center justify-center gap-4">
        <Image
          src={byulogo}
          alt="Profile picture"
          className="rounded-xl bg-white"
          priority
          width={300}
          height={300}
        />
      </div>
      <div className="flex flex-col items-center space-y-4 text-center">
        <p className="text-lg text-secondary-500 sm:text-xl md:text-2xl lg:text-3xl">
          Provo, UT
        </p>
      </div>
      <hr className="w-full border-foreground" />
      <div className="flex flex-col items-center gap-4 text-center">
        <h2 className="text-2xl font-semibold sm:text-3xl">{MAJOR}</h2>
        <p className="text-lg text-secondary-500">August 2015 – April 2022</p>
        <p className="text-md italic text-white/70">{MINOR} (2015–2019)</p>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:justify-center sm:gap-12">
        <Image
          src={csBuilding}
          alt="CS Building"
          className="rounded-lg bg-foreground"
          width={300}
          height={300}
        />
        <Image
          src={marriot}
          alt="Business Building"
          className="rounded-lg bg-white"
          width={300}
          height={300}
        />
      </div>
    </div>
  );
};

export default Education;
