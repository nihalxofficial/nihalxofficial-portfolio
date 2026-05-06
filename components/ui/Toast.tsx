"use client";

interface ToastProps {
  show: boolean;
  msg: string;
}

export default function Toast({ show, msg }: ToastProps) {
  return (
    <div className={`toast-custom ${show ? "show" : ""}`}>
      <span style={{ color: "#22c55e", fontSize: "1.1rem" }}>
        <i className="fas fa-check-circle" />
      </span>
      <span>{msg}</span>
    </div>
  );
}
