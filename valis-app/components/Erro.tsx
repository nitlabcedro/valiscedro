export default function Erro({ texto }: { texto?: string }) {
  if (!texto) return null;
  return (
    <p style={{
      margin: "12px 0",
      fontSize: 13,
      fontWeight: 500,
      color: "#dc2626",
      padding: "10px 14px",
      background: "#fef2f2",
      border: "1px solid rgba(220, 38, 38, 0.12)",
      borderRadius: 10,
      lineHeight: 1.4,
    }}>
      {texto}
    </p>
  );
}
