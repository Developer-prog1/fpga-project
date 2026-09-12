import { AppFrame } from "@/components/app-frame";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Ադմին",
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AppFrame>{children}</AppFrame>;
}
