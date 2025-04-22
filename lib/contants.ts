import resonant_logo from "@/public/images/resonant_logo.png";
import wbl_logo from "@/public/images/wbl_logo.jpg";
import renew_logo from "@/public/images/renew_logo.jpg";
import fiddle_logo from "@/public/images/fiddle_logo.jpg";

export const NAME = "Renzo Caiña";
export const JOB_TITLE = "Full Stack Software Developer";
export const UNIVERSITY = "Brigham Young University";
export const MAJOR = "Bachelor of Science in Computer Science";
export const MINOR = "Minor in Business Management";

export const EXPERIENCES = [
  {
    company: "Renew Biotechnologies",
    title: "Full Stack Software Developer",
    date: "August 2023 - April 2025",
    image: renew_logo,
    landingPage: "https://www.renewbt.com/",
    portal: "",
    description: [
      "Developed and launched web applications supporting multiple biotech subsidiaries, including Wasatch BioLabs and Resonant, using shared AWS infrastructure for scalability and efficiency.",
      "Built and enhanced features in Wasatch BioLabs to support billing workflows, integrating with Stripe for invoicing and improving internal processes for the billing team.",
      "Collaborated with cross-functional teams across Wasatch and Resonant to define requirements, scope projects, and align development efforts with business goals",
    ],
    technologies: [],
    color: "",
  },
  {
    company: "Resonant (Subsidiary of Renew Biotechnologies)",
    title: "Full Stack Software Developer",
    date: "August 2023 - April 2025",
    image: resonant_logo,
    landingPage: "https://www.resonantdx.com/",
    portal: "https://app.resonantdx.com/sign-in",
    description: [
      "End-to-end development and launch of a health portal using NextAuth for authentication, React & TailwindCSS for the frontend, and Next.js for the backend with RESTful APIs for seamless functionality.",
      "Architect and deploy AWS cloud environments using Terraform, ensuring HIPAA/PHI compliance and implementing OpenVPN for secure database (postgreSQL) access.",
      "Implemented Retool as an internal software interface to streamline team management, enabling quick builds for data access and interaction across various departments.",
    ],
    technologies: [],
    color: "#7371fc",
  },
  {
    company: "Wasatch Biolabs (Subsidiary of Renew Biotechnologies)",
    title: "Full Stack Software Developer",
    date: "December 2023 - April 2025",
    image: wbl_logo,
    landingPage: "https://wasatchbiolabs.com/",
    portal: "https://app.wasatchbiolabs.com/sign-in",
    description: [
      "Developed and launched a LIMS, utilizing NextAuth for authentication, React & TailwindCSS for the   frontend, and Next.js for the backend, with RESTful APIs for seamless functionality.",
      "Lead a team of three engineers, implementing best practices for security, scalability, and performance.",
      "Restructure application infrastructure, improving database (postgreSQL) performance and app hosting using AWS Fargate, OpenVPN, and Terraform. (Additionally - AWS S3, RDS, SES, and more)",
    ],
    technologies: [],
  },
  {
    company: "Fiddle, Inc",
    title: "Junior Full Stack Software Developer",
    date: "June 2022 - July 2023",
    image: fiddle_logo,
    landingPage: "https://fiddle.io/",
    portal: "https://fiddle.io/app/login",
    description: [
      "Develop new features and improve current UI and backend functionality by communicating with clients.",
      "Analyze source code, locate and fix bugs throughout the app through testing and deliver a fixed solution.",
      "Facilitate and schedule dev team meetings for updates, brainstorming, and accountability.",
    ],
    technologies: [],
  },
  {
    company: "Fiddle, Inc",
    title: "Intern Full Stack Software Developer",
    date: "May 2021 - September 2021",
    image: fiddle_logo,
    landingPage: "https://fiddle.io/",
    portal: "https://fiddle.io/app/login",
    description: [
      "Develop and maintain a new Fiddle app page and features backend using javascript on Nodejs.",
      "Map backend request for login, sign up and other page data from MongoDB using graphQL.",
      "Learn React and Typescript for front-end development.",
    ],
    technologies: [],
  },
];
