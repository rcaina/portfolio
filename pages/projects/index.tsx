import Head from "next/head";
import Container from "@/components/layout/Container";

const Projects = () => {
  return (
    <>
      <Head>
        <title>Projects | Portfolio</title>
        <meta name="description" content="View my projects and work" />
      </Head>
      <Container>
        <div className="flex flex-col gap-8">
          <div className="flex w-full flex-col items-center gap-4 rounded-xl">
            <div className="m-14 flex w-full items-center gap-4">
              <hr className="w-full border-secondary-500" />
              <h2 className="text-4xl">PROJECTS</h2>
              <hr className="w-full border-secondary-500" />
            </div>
          </div>
        </div>
      </Container>
    </>
  );
};

export default Projects;
