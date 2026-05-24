"use client";

interface ToastProps {
  show: boolean;
  msg: string;
  type?: "success" | "error";
}

export default function Toast({ show, msg, type = "success" }: ToastProps) {
  const isError = type === "error";
  return (
    <div 
      className={`toast-custom ${show ? "show" : ""}`}
      style={{
        borderLeft: `4px solid ${isError ? '#ef4444' : '#22c55e'}`
      }}
    >
      <span style={{ color: isError ? '#ef4444' : '#22c55e', fontSize: "1.1rem" }}>
        <i className={isError ? "fas fa-exclamation-circle" : "fas fa-check-circle"} />
      </span>
      <span>{msg}</span>
    </div>
  );
}
