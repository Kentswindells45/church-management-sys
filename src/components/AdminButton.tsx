import { type LucideIcon } from "lucide-react";

interface AdminButtonProps {
  icon: LucideIcon;
  label: string;
  onClick: () => void;
  variant?: "primary" | "secondary" | "danger";
  size?: "sm" | "md" | "lg";
  disabled?: boolean;
}

export default function AdminButton({
  icon: Icon,
  label,
  onClick,
  variant = "primary",
  size = "md",
  disabled = false,
}: AdminButtonProps) {
  const variants = {
    primary: "bg-gradient-to-r from-indigo-500 to-blue-600 hover:from-indigo-600 hover:to-blue-700 text-white ring-indigo-200",
    secondary: "bg-gradient-to-r from-slate-100 to-gray-100 hover:from-slate-200 hover:to-gray-200 text-slate-600 hover:text-slate-700 ring-gray-200",
    danger: "bg-gradient-to-r from-rose-500 to-red-500 hover:from-rose-600 hover:to-red-600 text-white ring-red-200",
  };

  const sizes = {
    sm: "px-3 py-1.5 text-sm ring-1",
    md: "px-4 py-2 ring-2",
    lg: "px-6 py-3 text-lg ring-2"
  };

  return (
    <button
      onClick={onClick}
      className={`
        ${variants[variant]}
        ${sizes[size]}
        flex items-center gap-2 rounded-lg
        font-medium 
        ring-offset-2 ring-opacity-25
        transition-all duration-200
        hover:shadow-lg hover:shadow-current/10
        active:scale-95
        disabled:opacity-50 disabled:pointer-events-none
      `}
      disabled={disabled}
    >
      {Icon && (
        <Icon 
          size={size === "sm" ? 16 : size === "md" ? 18 : 20} 
          className="flex-shrink-0"
        />
      )}
      {label}
    </button>
  );
}