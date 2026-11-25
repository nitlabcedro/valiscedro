import { SetorProvider } from "@/components/SetorProvider/SetorProvider";

export default function SetorLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { setor: string };
}) {
  return <SetorProvider slug={params.setor}>{children}</SetorProvider>;
}
