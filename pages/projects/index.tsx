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
        <div className="py-8">
          <h1 className="mb-6 text-4xl font-bold">Projects</h1>
          <div className="grid gap-6">{/* Project content will go here */}</div>
        </div>
      </Container>
    </>
  );
};

export default Projects;
