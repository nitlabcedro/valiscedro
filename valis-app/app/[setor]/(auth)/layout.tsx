import Image from "next/image";
import logoIco from "@/public/logoCedroIco.png";
import styles from "./layout.module.css";

// Linhas finas em curva atravessando a vitrine de ponta a ponta (começam e terminam fora da área
// visível, então nunca aparecem cortadas). Perto da logo elas somem por uma máscara no CSS.
const CURVAS = Array.from({ length: 24 }, (_, i) => {
  const d = i * 13;
  return {
    topo: `M -300 ${120 + d} C 150 ${-120 + d}, 650 ${330 + d}, 1500 ${-20 + d}`,
    base: `M -300 ${1080 - d} C 300 ${800 - d}, 850 ${1100 - d}, 1500 ${760 - d}`,
  };
});

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  const ano = new Date().getFullYear();

  return (
    <div className={styles.shell}>
      <aside className={styles.vitrine} aria-hidden>
        <span className={styles.luz} />

        {/* fill/stroke direto no SVG: mesmo se o CSS demorar a carregar, as linhas nunca viram blocos pretos */}
        <svg
          className={styles.curvas}
          viewBox="0 0 1200 1000"
          preserveAspectRatio="xMidYMid slice"
          width="100%"
          height="100%"
          fill="none"
          stroke="rgba(255, 255, 255, 0.08)"
          strokeWidth={1}
        >
          {CURVAS.map((curva, i) => (
            <g key={i}>
              <path d={curva.topo} />
              <path d={curva.base} />
            </g>
          ))}
        </svg>

        <div className={styles.marca}>
          <Image src={logoIco} alt="" width={176} height={169} className={styles.marcaIcone} priority />
          <div className={styles.marcaTexto}>
            <span className={styles.marcaNome}>Valis</span>
            <span className={styles.marcaSub}>Rastreabilidade e Validação de Lotes</span>
          </div>
        </div>
        <span className={styles.fio} />

        <span className={styles.rodape}>© {ano} Laboratório Cedro</span>
      </aside>

      <main className={styles.lado}>{children}</main>
    </div>
  );
}
