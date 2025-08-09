import resonant_logo from "@/public/images/resonant_logo.png";
import wbl_logo from "@/public/images/wbl_logo.jpg";
import renew_logo from "@/public/images/renew_logo.jpg";
import fiddle_logo from "@/public/images/fiddle_logo.jpg";
import fitsnitch_logo from "@/public/images/fitsnitch_logo.png";
import byu_logo from "@/public/images/byu_logo.png";
import { SocialLink } from "../pages";
import githublogo from "@/public/images/githublogo.png";
import linkedInLogo from "@/public/images/linkedInLogo.png";
import name_logo from "@/public/images/name_logo.png";
import ronin_logo from "@/public/images/ronin_logo.jpg";
import agave_logo from "@/public/images/agave_logo.png";
import union_logo from "@/public/images/unioncp_logo.jpg";
import corecast_logo from "@/public/images/corecast_logo.png";

export const NAME = "Renzo Caiña";
export const JOB_TITLE = "Full Stack Software Developer";
export const UNIVERSITY = "Brigham Young University";
export const MAJOR = "Bachelor of Science in Computer Science";
export const MINOR = "Minor in Business Management";

export const socialLinks: SocialLink[] = [
  {
    name: "Github",
    link: "https://github.com/rcaina",
    img: githublogo,
    color: "black",
  },
  {
    name: "LinkedIn",
    link: "https://www.linkedin.com/in/renzocaina/",
    img: linkedInLogo,
    color: "",
  },
];

export const EXPERIENCES = [
  {
    company: "CoreCast",
    title: "Full Stack Software Engineer",
    date: "May 2025 - Present",
    image: corecast_logo,
    landingPage: "https://www.corecastre.com/",
    portal: "",
    description: [
      "Collaborated with the UX designer to enhance the application’s UI and prepare for alpha testing, incorporating early feedback to refine the user experience.",
      "Worked with the development team to connect the front-end UI to backend RESTful API endpoints and implemented new features using AG Grid to provide an Excel-like interface.",
    ],
    technologies: [
      "pnpm",
      "Next.js",
      "TailwindCSS",
      "TypeScript",
      "React",
      "Drizzle",
      "PostgreSQL",
      "Neon",
      "Clerk",
      "Tanstack",
      "AG-GRID",
      "Fly.io",
    ],
    //white on light mode, black on dark mode
    color: "#ffffff",
    backgroundColor: "#ffffff",
    subsidiaries: [],
  },
  {
    company: "Renew Biotechnologies",
    title: "Full Stack Software Developer",
    date: "August 2023 - April 2025",
    image: renew_logo,
    landingPage: "https://www.renewbt.com/",
    portal: "",
    description: [
      "Developed and launched web applications supporting multiple biotech subsidiaries, including Wasatch BioLabs and Resonant, using shared AWS infrastructure for scalability and efficiency.",
      "Collaborated with cross-functional teams across Wasatch and Resonant to define project requirements and scope, resulting in improved delivery timelines and clearer stakeholder communication.",
      "Built and enhanced features to support billing workflows, integrating with Stripe for invoicing and improving internal processes for the billing team.",
    ],
    technologies: [],
    color: "",
    subsidiaries: [
      {
        company: "Wasatch Biolabs (Subsidiary of Renew Biotechnologies)",
        title: "",
        date: "",
        image: wbl_logo,
        landingPage: "https://wasatchbiolabs.com/",
        portal: "https://dev.wasatchbiolabs.com/sign-in",
        description: [
          "Design, develope, and launch a custom Laboratory Information Management System (LIMS) using NextAuth, React, TailwindCSS, and Next.js, enabling secure user authentication and seamless lab data workflows via RESTful APIs, reducing manual processes and improving operational efficiency by 35%.",
          "Lead a team of three engineers, establishing engineering best practices that improved system scalability, reduced security vulnerabilities, and increased deployment reliability.",
          "Restructure application infrastructure to optimize performance and scalability, improving PostgreSQL query efficiency and reducing deployment time by 30% using AWS Fargate, Terraform, and OpenVPN.",
          "Implement Amazon S3 Intelligent-Tiering for data storage, reducing cloud storage costs by 40% while maintaining data availability and access performance.",
        ],
        technologies: [],
        subsidiaries: [],
      },
      {
        company: "Resonant (Subsidiary of Renew Biotechnologies)",
        title: "",
        date: "",
        image: resonant_logo,
        landingPage: "https://www.resonantdx.com/",
        portal: "https://dev.resonantdx.com/sign-in",
        description: [
          "Lead the end-to-end development and launch of a HIPAA-compliant health portal using NextAuth, React, TailwindCSS, and Next.js, enabling secure user access and improving patient onboarding.",
          "Architect and deploy scalable AWS infrastructure with Terraform, achieving full HIPAA/PHI compliance; implemented OpenVPN-secured PostgreSQL access, reducing data breach risk.",
        ],
        technologies: [],
        color: "#7371fc",
        subsidiaries: [],
      },
    ],
  },
  {
    company: "Frontline Alternative (FitSnitch App)",
    title: "Software Application Developer (Freelance)",
    date: "April 2022 - July 2023",
    image: fitsnitch_logo,
    landingPage: "https://fitsnitch.com/",
    portal: "",
    description: [
      "Create mobile app (FitSnitch) for fitness trainers and trainees using React and Typescript for UI design.",
      "Developed a serverless architecture using AWS services such as API Gateway, Lambda, and DynamoDB.",
      "Implemented AWS Cognito for client side app authentication.",
      "Update client side authentication from AWS Cognito to Firebase Authentication and include google log in integration.",
    ],
    technologies: [],
    subsidiaries: [],
    color: "#FF0000",
  },
  {
    company: "Fiddle, Inc",
    title: "Junior Full Stack Software Developer",
    date: "June 2022 - July 2023",
    image: fiddle_logo,
    landingPage: "https://fiddle.io/",
    portal: "https://dev.fiddle.io/app/",
    description: [
      "Develop new features and improve current UI and backend functionality by communicating with clients.",
      "Analyze source code, locate and fix bugs throughout the app through testing and deliver a fixed solution.",
      "Facilitate and schedule dev team meetings for updates, brainstorming, and accountability.",
    ],
    technologies: [],
    subsidiaries: [],
    color: "#000000",
  },
  {
    company: "Fiddle, Inc",
    title: "Intern Full Stack Software Developer",
    date: "May 2021 - September 2021",
    image: fiddle_logo,
    landingPage: "https://fiddle.io/",
    portal: "https://dev.fiddle.io/app/",
    description: [
      "Develop and maintain a new Fiddle app page and features backend using javascript on Nodejs.",
      "Map backend request for login, sign up and other page data from MongoDB using graphQL.",
      "Learn React and Typescript for front-end development.",
    ],
    technologies: [],
    subsidiaries: [],
    color: "#000000",
  },
  {
    company: "Brigham Young University",
    title: "Windows Application Engineer",
    date: "Jan 2020 - August 2020",
    image: byu_logo,
    landingPage: "https://www.byu.edu/",
    portal: "",
    description: [
      "Manage multiple windows applications for the College of Life Sciences at BYU",
    ],
    technologies: [],
    subsidiaries: [],
  },
  {
    company: "Brigham Young University",
    title: "Linux Application Engineer",
    date: "Jan 2020 - August 2020",
    image: byu_logo,
    landingPage: "https://www.byu.edu/",
    portal: "",
    description: [
      "Learned the linux operating systems, softwares, and command line.",
      "Manage multiple linux applications for the College of Life Sciences at BYU",
      "In the process of solving software issues I have learned ansible and editing files using vim.",
    ],
    technologies: [],
    subsidiaries: [],
  },
  {
    company: "Brigham Young University, Center for Teaching & Learning",
    title: "Web Developer",
    date: "Jan 2019 - April 2019",
    image: byu_logo,
    landingPage: "https://www.byu.edu/",
    portal: "",
    description: [
      "Developed and maintained the web application (Learning Suite) for BYU using HTML, CSS, JavaScript, PHP, and Mustache",
      "Fix bugs to enabled educators and students to access their class grades and details.",
      "Worked on both backend and frontend development using NetBeans as the IDE, along with WAMP, Docker servers, and Fiddler for testing and debugging.",
    ],
    technologies: [],
    subsidiaries: [],
  },
];

export const CODING_PROJECTS = [
  {
    title: "Ronin",
    image: ronin_logo,
    github_links: ["https://github.com/rcaina/ronin"],
    description:
      "Ronin is a web application that allows users to create and manage their own personal budget. Inspired by my wife and I having a unique way to manage our finances and wanting to get away from using a spreadsheet. It is built with Next.js, TailwindCSS, and TypeScript.",
    technologies: [
      "T3-Stack",
      "pnpm",
      "Auth.js",
      "Next.js",
      "TailwindCSS",
      "TypeScript",
      "React",
      "Prisma",
      "PostgreSQL",
      "Neon",
      "Vercel",
      "Tanstack",
    ],
    link: "https://ronin-nine.vercel.app/sign-in",
    demo_account_info: {
      email: "demo@ronin.com",
      password: "demo123",
    },
    color: "#F1C232",
  },
  {
    title: "Portfolio",
    image: name_logo,
    github_links: ["https://github.com/rcaina/portfolio"],
    description:
      "My personal portfolio built with Next.js, TailwindCSS, and TypeScript.",
    ////follow tech stack from read me for technologies
    technologies: [
      "Next.js",
      "TailwindCSS",
      "TypeScript",
      "Vercel",
      "React",
      "Framer Motion",
      "OpenAI API",
      "Vercel",
    ],
    link: "https://www.renzocaina.com/",
    color: "#000000",
  },
  {
    title: "Family Map",
    image: byu_logo,
    github_links: [
      "https://github.com/rcaina/FamilyMapApp/tree/master",
      "https://github.com/rcaina/FamilyMapServer",
    ],
    description:
      "Family Tree app for BYU CS 240. Automatically generates a family tree that is then viewable on a map with added filters of family details and connections. This project uses Java, Android Studio, and Google Maps API.",
    technologies: ["Java", "Android Studio", "Google Maps API"],
  },
];

export const WEBFLOW_PROJECTS = [
  {
    title: "Union Capital Ventures",
    description:
      "A landing page website using Webflow for Union Capital Ventures, a venture capital firm that invests in early-stage startups.",
    technologies: ["Webflow", "Figma"],
    link: "https://www.unioncp.com/",
    image: union_logo,
    color: "#000000",
  },
  {
    title: "Agave Paint & Epoxy",
    description:
      "A landing page website using Webflow for a paint and epoxy company.",
    technologies: ["Webflow", "Canva"],
    link: "https://agavepaint.com/",
    image: agave_logo,
  },
];
