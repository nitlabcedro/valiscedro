"use client";

import { toast } from "react-toastify";

// O texto vira o id do toast: a mesma mensagem não empilha se o usuário repetir a ação.
function mostrar(tipo: "success" | "error" | "warning" | "info", texto: string) {
  if (!texto) return;
  toast[tipo](texto, { toastId: `${tipo}:${texto}` });
}

export const notificar = {
  sucesso: (texto: string) => mostrar("success", texto),
  erro: (texto: string) => mostrar("error", texto),
  aviso: (texto: string) => mostrar("warning", texto),
  info: (texto: string) => mostrar("info", texto),
};

const CONFIRMADO = "confirmado";

// Substitui o window.confirm: resolve true só quando o usuário clica no botão de confirmação.
export function confirmar(texto: string, rotulo = "Excluir", perigo = true) {
  return new Promise<boolean>((resolve) => {
    toast.warning(
      ({ closeToast }) => (
        <div className="toast-confirmacao">
          <p>{texto}</p>
          <div className="toast-confirmacao-acoes">
            <button type="button" className="toast-btn-secundario" onClick={() => closeToast()}>
              Cancelar
            </button>
            <button
              type="button"
              className={perigo ? "toast-btn-perigo" : "toast-btn-primario"}
              onClick={() => closeToast(CONFIRMADO)}
            >
              {rotulo}
            </button>
          </div>
        </div>
      ),
      {
        toastId: `confirmar:${texto}`,
        position: "top-center",
        autoClose: false,
        closeOnClick: false,
        draggable: false,
        closeButton: false,
        onClose: (motivo) => resolve(motivo === CONFIRMADO),
      }
    );
  });
}
