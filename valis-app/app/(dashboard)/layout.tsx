import Sidebar from "@/components/Sidebar/Sidebar";
import SessionGate from "@/components/SessionGate/SessionGate";
import styles from "./layout.module.css";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SessionGate>
      <div className={styles.wrapper}>
        <Sidebar />
        <main className={styles.main}>
          {children}
        </main>
      </div>
    </SessionGate>
  );
}
