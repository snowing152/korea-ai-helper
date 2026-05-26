import { SITES } from '../constants/sites';

export default function SiteLinks() {
  return (
    <div className="px-4 py-3 border-b border-[#EDE9E3] bg-white">
      <p className="text-xs text-[#9CA3AF] mb-2">Korean government sites</p>
      <div className="flex flex-wrap gap-2">
        {SITES.map(site => (
          <a
            key={site.name}
            href={site.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs bg-[#F5F3EF] border border-[#E5E5E5] rounded-md px-2 py-1 text-[#D97706] hover:bg-[#EDE9E3] transition-colors"
            title={site.desc}
          >
            {site.name}
          </a>
        ))}
      </div>
    </div>
  );
}
