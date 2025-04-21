import PageHeader from "./PageHeader";

interface Props {
  title: string;
  children: React.ReactNode;
  showLock?: boolean;
}

export default function MainPageLayout({ title, children, showLock }: Props) {
  return (
    <div className="flex w-full flex-col overflow-auto">
      <div className="sticky top-0 z-20">
        <PageHeader title={title} showLock={showLock} />
      </div>
      <div className="flex flex-col p-8">{children}</div>
    </div>
  );
}
