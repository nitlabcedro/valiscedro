import Sidebar from "@/components/Sidebar/Sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <Sidebar />
      <main style={{ flex: 1, marginLeft: "var(--sidebar-collapsed)", padding: "32px", overflow: "auto", transition: "margin-left var(--transition-normal)" }}>
        {children}
      </main>
    </div>
  );
}
