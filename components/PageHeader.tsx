import Image from "next/image";

interface PageHeaderProps {
  title: string;
  icon?: string;
}

export function PageHeader({ title, icon }: PageHeaderProps) {
  return (
    <div className="flex items-center gap-3 px-6 py-4 bg-white border-b border-gray-200">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 flex-shrink-0">
          <Image
            src="/homer-logo-no-bg.svg"
            alt="Homer Logo"
            width={32}
            height={32}
            className="w-full h-full"
          />
        </div>
        <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
      </div>

    </div>
  );
}

