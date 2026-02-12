import { Anchor } from "lucide-react";

export default function Footer() {
  return (
    <footer className="border-t-2 border-dashed border-pencil mt-16 py-8">
      <div className="max-w-6xl mx-auto px-4 text-center font-body text-pencil/60">
        <div className="flex items-center justify-center gap-2 mb-3">
          <Anchor className="w-4 h-4" />
          <span className="font-hand text-lg font-bold">
            Cine<span className="text-marker-red">Harbor</span>
          </span>
        </div>
        <p className="text-sm">
          © 2026 CineHarbor · 用手绘风格发现好电影
        </p>
        <p className="text-xs mt-1 text-pencil/40">
          所有影视数据仅供展示 · 图片来自 picsum.photos
        </p>
      </div>
    </footer>
  );
}
