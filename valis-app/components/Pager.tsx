import s from "@/styles/shared.module.css";

export default function Pager({
  page,
  pageSize,
  total,
  onPage,
}: {
  page: number;
  pageSize: number;
  total: number;
  onPage: (page: number) => void;
}) {
  if (total <= pageSize) return null;
  const paginas = Math.max(1, Math.ceil(total / pageSize));
  const inicio = (page - 1) * pageSize + 1;
  const fim = Math.min(total, page * pageSize);

  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, marginTop: 16 }}>
      <span style={{ fontSize: 12, color: "var(--text-secondary)" }}>
        {inicio}–{fim} de {total}
      </span>
      <div style={{ display: "flex", gap: 8 }}>
        <button type="button" className={s.btnSecondary} disabled={page <= 1} onClick={() => onPage(page - 1)}>
          Anterior
        </button>
        <button type="button" className={s.btnSecondary} disabled={page >= paginas} onClick={() => onPage(page + 1)}>
          Próxima
        </button>
      </div>
    </div>
  );
}
