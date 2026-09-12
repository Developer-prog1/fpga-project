import { SiteHeader } from "@/components/site-header";

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="canvas min-h-dvh">
      <SiteHeader />
      {children}
    </div>
  );
}
