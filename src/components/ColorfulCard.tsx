import type { ReactNode } from "react";

type ColorfulCardProps = {
  icon: ReactNode;
  title: string;
  description: string;
  gradient: string;
};

export default function ColorfulCard({
  icon,
  title,
  description,
  gradient,
}: ColorfulCardProps) {
  return (
    <div
      className={`bg-gradient-to-r ${gradient} rounded-2xl p-6 text-white shadow-lg`}
    >
      <div className="flex items-center gap-4">
        {icon}
        <div>
          <h2 className="text-2xl font-bold">{title}</h2>
          <p className="text-white/80">{description}</p>
        </div>
      </div>
    </div>
  );
}