import s from "@/styles/shared.module.css";
import type { CatalogoItem } from "@/lib/types";

export default function CatalogSelect({
  id,
  label,
  value,
  onChange,
  items,
  invalid,
}: {
  id?: string;
  label: string;
  value: string;
  onChange: (id: string) => void;
  items: CatalogoItem[];
  invalid?: boolean;
}) {
  return (
    <div className={s.formGroup}>
      <label className={s.formLabel} htmlFor={id}>{label}</label>
      <select id={id} className={s.formSelect} value={value} aria-invalid={invalid || undefined} onChange={(e) => onChange(e.target.value)}>
        <option value="">Selecione...</option>
        {items.map((item) => (
          <option key={item.id} value={item.id}>{item.nome}</option>
        ))}
      </select>
    </div>
  );
}
