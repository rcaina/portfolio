import resonant_logo from "@/public/images/resonant_logo.png";
import wbl_logo from "@/public/images/wbl_logo.jpg";
import renew_logo from "@/public/images/renew_logo.jpg";
import fiddle_logo from "@/public/images/fiddle_logo.jpg";
import fitsnitch_logo from "@/public/images/fitsnitch_logo.png";
import byu_logo from "@/public/images/byu_logo.png";
import { SocialLink } from "../pages";
import githublogo from "@/public/images/githublogo.png";
import linkedInLogo from "@/public/images/linkedInLogo.png";

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
