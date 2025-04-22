import Head from "next/head";
import Image from "next/image";
import byulogo from "@/public/images/byulogo.png";
import csBuilding from "@/public/images/csbuilding.jpg";
import marriot from "@/public/images/marriot.jpg";
import Container from "@/components/layout/Container";

const Education = () => {
  return (
    <>
      <Head>
        <title>Education | Portfolio</title>
        <meta name="description" content="View my education and work" />
      </Head>
      <Container>
        <div className="flex flex-col gap-8">
          <div className="flex w-full flex-col items-center gap-4 rounded-xl">
            <div className="flex w-full items-center gap-4">
              <hr className="w-full border-secondary-500" />
              <Image
                src={byulogo}
                alt="Profile picture"
                className="rounded-xl bg-white"
                priority
                width={300}
                height={300}
              />
              <hr className="w-full border-secondary-500" />
            </div>
            <div className="flex flex-col items-center space-y-4 text-center">
              <h1 className="text-4xl font-bold sm:text-5xl md:text-6xl lg:text-7xl">
                Brigham Young University
              </h1>
              <p className="text-lg text-secondary-500 sm:text-xl md:text-2xl lg:text-3xl">
                Provo, UT
              </p>
            </div>
          </div>
          <hr className="w-full border-white" />
          <div className="flex flex-col items-center gap-4 text-center">
            <h2 className="text-2xl font-semibold sm:text-3xl">
              Bachelor of Science in Computer Science
            </h2>
            <p className="text-lg text-secondary-500">
              August 2015 – April 2022
            </p>
            <p className="text-md italic text-white/70">
              Minor in Business Management (2015–2019)
            </p>
          </div>

          {/* Optional: Building Images */}
          <div className="flex flex-col gap-4 sm:flex-row sm:justify-center sm:gap-12">
            <Image
              src={csBuilding}
              alt="CS Building"
              className="rounded-lg bg-white"
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
      </Container>
    </>
  );
};

export default Education;
