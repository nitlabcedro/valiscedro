export default function Erro({ texto }: { texto?: string }) {
  if (!texto) return null;
  return (
    <p style={{ margin: "12px 0", fontSize: 13, color: "var(--accent-red)", fontWeight: 500 }}>
      {texto}
    </p>
  );
}
