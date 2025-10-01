import React, { type KeyboardEvent } from "react";
import { motion } from "framer-motion";

type Props = {
  title?: string;
  label?: string;
  value?: string | number;
  Icon?: React.FC<{ size?: number }>;
  color?: string; // tailwind bg class
  onClick?: () => void;
  index?: number;
  children?: React.ReactNode;
};

function Card({
  title,
  label,
  value,
  Icon,
  color = "bg-blue-600",
  onClick,
  index = 0,
  children,
}: Props) {
  const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (!onClick) return;
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onClick();
    }
  };

  return (
    <motion.div
      className={`bg-white rounded-xl shadow-md p-6 ${children ? "" : "flex items-center gap-5 cursor-pointer"}`}
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.98 }}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28, delay: index * 0.07 }}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={handleKeyDown}
      onClick={onClick}
    >
      {title && <h2 className="text-xl font-semibold mb-4">{title}</h2>}
      {Icon && (
        <div
          className={`w-14 h-14 rounded-lg flex items-center justify-center text-white ${color}`}
        >
          <Icon size={28} />
        </div>
      )}
      {label && (
        <div>
          <p className="text-sm font-medium text-gray-500">{label}</p>
          <p className="text-2xl font-semibold text-gray-900">{value}</p>
        </div>
      )}
      {children}
    </motion.div>
  );
}

export default React.memo(Card);
