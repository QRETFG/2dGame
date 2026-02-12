import {
  Clapperboard,
  Tv,
  Cat,
  Globe,
  PartyPopper,
  Film,
  type LucideIcon,
} from "lucide-react";
import { categories } from "../data/movies";

const iconMap: Record<string, LucideIcon> = {
  Clapperboard,
  Tv,
  Cat,
  Globe,
  PartyPopper,
  Film,
};

const rotations = ["-1.5deg", "1deg", "-0.8deg", "1.5deg", "-1deg", "0.5deg"];

export default function CategoryNav() {
  return (
    <section id="分类" className="max-w-6xl mx-auto px-4 mt-12">
      <h2 className="font-hand text-2xl font-bold mb-6 flex items-center gap-2">
        <span className="inline-block w-8 h-0.5 bg-pencil" />
        浏览分类
      </h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
        {categories.map((cat, i) => {
          const Icon = iconMap[cat.icon];
          return (
            <button
              key={cat.id}
              style={{ transform: `rotate(${rotations[i]})` }}
              className="sketch-card sketch-border bg-white p-4 flex flex-col items-center gap-2 shadow-sketch hover:bg-sticky transition-colors cursor-pointer"
            >
              {Icon && <Icon className="w-8 h-8 text-pen-blue" />}
              <span className="font-hand text-lg font-bold">{cat.name}</span>
              <span className="font-body text-sm text-pencil/50">
                {cat.count} 部
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
}
