import Link from "next/link";

interface Props {
  data: {
    href: string;
    label: string;
    showIcon?: boolean;
  };
}

const QuickLink = ({ data: { href, label, showIcon = false } }: Props) => {
  return (
    <Link
      href={href}
      className="group inline-flex items-center text-lg text-secondary-500 hover:text-blue-500 dark:text-gray-300 dark:hover:text-blue-400"
      target="_blank"
      rel="noopener noreferrer"
    >
      {label}
      {showIcon && (
        <svg
          className="ml-1 h-4 w-4 opacity-40 transition-opacity group-hover:opacity-100"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
          />
        </svg>
      )}
    </Link>
  );
};

export default QuickLink;
