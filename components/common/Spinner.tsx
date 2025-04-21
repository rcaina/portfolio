interface Props {
  className?: string;
}

export default function Spinner({ className }: Props) {
  return (
    <div className={className}>
      <svg
        className="text-primary h-full w-full animate-spin"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
      >
        <circle className="stroke-primary-200" cx="12" cy="12" r="10"></circle>
        <path
          className="fill-primary-500 opacity-75"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        ></path>
      </svg>
    </div>
  );
}
