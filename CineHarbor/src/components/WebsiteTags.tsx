import { useEffect, useMemo, useState } from "react";
import { ExternalLink, Tag } from "lucide-react";
import { sharedWebsites } from "../data/movies";

const ALL_TAG = "全部";
const tagPriority = ["动漫", "影视", "网盘"];

function formatHost(url: string) {
  try {
    return new URL(url).hostname.replace("www.", "");
  } catch {
    return url;
  }
}

export default function WebsiteTags() {
  const tags = useMemo(() => {
    const countMap = new Map<string, number>();
    for (const site of sharedWebsites) {
      countMap.set(site.tag, (countMap.get(site.tag) ?? 0) + 1);
    }

    const prioritizedTagSet = new Set(tagPriority);
    const allCount = sharedWebsites.filter((site) =>
      prioritizedTagSet.has(site.tag)
    ).length;

    const ordered = Array.from(countMap.entries())
      .map(([name, count], index) => ({ name, count, index }))
      .sort((a, b) => {
        const aPriority = tagPriority.indexOf(a.name);
        const bPriority = tagPriority.indexOf(b.name);
        const aOrder = aPriority === -1 ? Number.MAX_SAFE_INTEGER : aPriority;
        const bOrder = bPriority === -1 ? Number.MAX_SAFE_INTEGER : bPriority;

        if (aOrder !== bOrder) return aOrder - bOrder;
        return a.index - b.index;
      })
      .map(({ name, count }) => ({ name, count }));

    return [{ name: ALL_TAG, count: allCount }, ...ordered];
  }, []);

  const [activeTag, setActiveTag] = useState(ALL_TAG);

  useEffect(() => {
    if (tags.length === 0) return;
    if (!tags.some((tag) => tag.name === activeTag)) {
      setActiveTag(ALL_TAG);
    }
  }, [activeTag, tags]);

  const visibleSites = useMemo(
    () =>
      activeTag === ALL_TAG
        ? sharedWebsites.filter((site) => tagPriority.includes(site.tag))
        : sharedWebsites.filter((site) => site.tag === activeTag),
    [activeTag]
  );

  return (
    <section id="标签" className="max-w-6xl mx-auto px-4 mt-12">
      <h2 className="font-hand text-2xl font-bold mb-6 flex items-center gap-2">
        <span className="inline-block w-8 h-0.5 bg-pencil" />
        免费资源
      </h2>

      <div className="flex flex-wrap gap-3 mb-6">
        {tags.map((tag) => (
          <button
            key={tag.name}
            onClick={() => setActiveTag(tag.name)}
            className={`px-4 py-2 font-body text-sm sketch-border-thin transition-colors ${
              activeTag === tag.name ? "bg-sticky" : "bg-white hover:bg-sticky/60"
            }`}
          >
            {tag.name}
            <span className="ml-2 text-pencil/50">({tag.count})</span>
          </button>
        ))}
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {visibleSites.map((site) => (
          <a
            key={site.id}
            href={site.url}
            target="_blank"
            rel="noreferrer"
            className="sketch-card sketch-border bg-white p-4 shadow-sketch hover:bg-sticky/40 transition-colors"
          >
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-hand text-xl font-bold">{site.title}</h3>
              <span className="inline-flex items-center gap-1 text-xs px-2 py-1 bg-paper sketch-border-thin">
                <Tag className="w-3.5 h-3.5" />
                {site.tag}
              </span>
            </div>
            <p className="font-body text-sm text-pencil/70 leading-relaxed min-h-12">
              {site.description}
            </p>
            <div className="mt-3 pt-3 border-t border-dashed border-pencil/30 flex items-center justify-between font-body text-xs text-pen-blue">
              <span>{formatHost(site.url)}</span>
              <ExternalLink className="w-4 h-4" />
            </div>
          </a>
        ))}
      </div>
    </section>
  );
}
