import type { PropsWithChildren } from "react";

interface AppLayoutProps {
  title: string;
  description?: string;
}

export default function AppLayout({
  title,
  children,
  description,
}: PropsWithChildren<AppLayoutProps>) {
  return (
    <div className="h-screen w-screen flex flex-col">
      <header className="pt-12 pb-8 flex items-center gap-4">
        <div className="container h-full flex items-center px-6 mx-auto">
          <div className="flex flex-col flex-1">
            <h1 className="text-2xl font-bold">{title}</h1>
            {description && (
              <h2 className="text-lg text-muted-foreground">{description}</h2>
            )}
          </div>
        </div>
      </header>
      <main className="flex-1 overflow-auto px-6">{children}</main>
    </div>
  );
}
