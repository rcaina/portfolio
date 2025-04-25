import Image from "next/image";
import byulogo from "@/public/images/byulogo.png";
import csBuilding from "@/public/images/csbuilding.jpg";
import { MAJOR, MINOR } from "@/lib/contants";

const Education = () => {
  return (
    <div className="flex w-full flex-col items-center gap-8 text-center">
      <h2 className="text-4xl">EDUCATION</h2>

      <Image
        src={byulogo}
        alt="BYU Logo"
        className="rounded-xl bg-white"
        priority
        width={300}
        height={300}
      />

      <p className="text-lg text-secondary-500 sm:text-xl md:text-2xl lg:text-3xl">
        Provo, UT
      </p>

      <hr className="w-full border-secondary-500" />

      <div className="flex flex-col items-center gap-2 text-center ">
        <h2 className="text-center text-2xl font-semibold">{MAJOR}</h2>
        <p className="text-lg text-secondary-500">August 2015 – April 2022</p>
        <p className="text-md italic text-white/70">{MINOR} (2015–2019)</p>
      </div>

      <Image
        src={csBuilding}
        alt="CS Building"
        className="rounded-lg bg-foreground"
        width={300}
        height={300}
      />
    </div>
  );
};

export default Education;
