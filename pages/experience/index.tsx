import Head from "next/head";
import Container from "@/components/layout/Container";

const Experience = () => {
  return (
    <>
      <Head>
        <title>Experience | Portfolio</title>
        <meta name="description" content="View my experience and work" />
      </Head>
      <Container>
        <div className="py-8">
          <h1 className="mb-6 text-4xl font-bold">Experience</h1>
          <div className="grid gap-6">{/* Project content will go here */}</div>
        </div>
      </Container>
    </>
  );
};

export default Experience;
