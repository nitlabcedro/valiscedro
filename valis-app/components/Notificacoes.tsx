"use client";

import { ToastContainer, type IconProps } from "react-toastify";
import {
  HiOutlineCheckCircle,
  HiOutlineExclamationTriangle,
  HiOutlineInformationCircle,
  HiOutlineXCircle,
} from "react-icons/hi2";

function Icone({ type }: IconProps) {
  switch (type) {
    case "success": return <HiOutlineCheckCircle size={22} />;
    case "error": return <HiOutlineXCircle size={22} />;
    case "warning": return <HiOutlineExclamationTriangle size={22} />;
    default: return <HiOutlineInformationCircle size={22} />;
  }
}

export default function Notificacoes() {
  return (
    <ToastContainer
      position="top-right"
      autoClose={4000}
      newestOnTop
      pauseOnFocusLoss
      pauseOnHover
      theme="light"
      icon={Icone}
    />
  );
}
