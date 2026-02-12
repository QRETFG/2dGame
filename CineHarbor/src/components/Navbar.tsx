import { Search, Anchor } from "lucide-react";

export default function Navbar() {
  const links = [
    { label: "精选", href: "#精选" },
    { label: "标签", href: "#标签" },
    { label: "分类", href: "#分类" },
    { label: "推荐", href: "#推荐" },
  ];

  return (
    <nav className="sticky top-0 z-50 bg-paper/95 backdrop-blur-sm border-b-2 border-dashed border-pencil">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2 font-hand text-2xl font-bold">
          <Anchor className="w-6 h-6 text-pen-blue" />
          <span>
            Cine<span className="text-marker-red">Harbor</span>
          </span>
        </div>

        <div className="hidden md:flex items-center gap-6 font-body text-lg">
          {links.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="hover:text-pen-blue transition-colors relative after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-pen-blue hover:after:w-full after:transition-all"
            >
              {link.label}
            </a>
          ))}
        </div>

        <button className="p-2 sketch-border-thin hover:bg-sticky transition-colors">
          <Search className="w-5 h-5" />
        </button>
      </div>
    </nav>
  );
}
