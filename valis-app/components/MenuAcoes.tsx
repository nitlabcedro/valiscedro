"use client";

import { useEffect, useRef, useState, type MouseEvent as ReactMouseEvent, type ReactNode } from "react";
import { HiOutlineBars3 } from "react-icons/hi2";
import s from "@/styles/shared.module.css";

export type AcaoMenu = {
  rotulo: string;
  icone: ReactNode;
  onClick: () => void;
  perigo?: boolean;
};

export default function MenuAcoes({ acoes }: { acoes: AcaoMenu[] }) {
  const [aberto, setAberto] = useState(false);
  const [posicao, setPosicao] = useState({ top: 0, left: 0 });
  const raiz = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!aberto) return;
    function aoClicar(evento: MouseEvent) {
      if (!raiz.current?.contains(evento.target as Node)) setAberto(false);
    }
    function aoTeclar(evento: KeyboardEvent) {
      if (evento.key === "Escape") setAberto(false);
    }
    function aoRolar() {
      setAberto(false);
    }
    document.addEventListener("mousedown", aoClicar);
    document.addEventListener("keydown", aoTeclar);
    window.addEventListener("scroll", aoRolar, true);
    return () => {
      document.removeEventListener("mousedown", aoClicar);
      document.removeEventListener("keydown", aoTeclar);
      window.removeEventListener("scroll", aoRolar, true);
    };
  }, [aberto]);

  function alternar(evento: ReactMouseEvent<HTMLButtonElement>) {
    const retangulo = evento.currentTarget.getBoundingClientRect();
    const largura = 188;
    const altura = acoes.length * 36 + 12;
    const abaixo = retangulo.bottom + 6 + altura <= window.innerHeight;
    setPosicao({
      top: abaixo ? retangulo.bottom + 6 : Math.max(8, retangulo.top - altura - 6),
      left: Math.max(8, Math.min(retangulo.right - largura, window.innerWidth - largura - 8)),
    });
    setAberto((atual) => !atual);
  }

  return (
    <div ref={raiz}>
      <button type="button" className={s.iconBtn} aria-label="Ações" aria-expanded={aberto} aria-haspopup="menu" onClick={alternar}>
        <HiOutlineBars3 size={18} />
      </button>
      {aberto && (
        <div className={s.acaoMenu} role="menu" style={{ top: posicao.top, left: posicao.left }}>
          {acoes.map((acao) => (
            <button
              key={acao.rotulo}
              type="button"
              role="menuitem"
              className={acao.perigo ? s.acaoItemPerigo : s.acaoItem}
              onClick={() => {
                setAberto(false);
                acao.onClick();
              }}
            >
              {acao.icone}
              {acao.rotulo}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
