interface Props {
  className?: string;
  children: React.ReactNode;
}

export default function Container({ className, children }: Props) {
  return (
    <div className={`container mx-auto p-4 sm:px-6 lg:px-8 ${className || ""}`}>
      {children}
    </div>
  );
}
