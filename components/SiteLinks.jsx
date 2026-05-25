import { SITES } from '../constants/sites';

export default function SiteLinks() {
  return (
    <div className="px-4 py-3 border-b bg-gray-50">
      <p className="text-xs text-gray-500 mb-2">Korean government sites</p>
      <div className="flex flex-wrap gap-2">
        {SITES.map(site => (
          <a
            key={site.name}
            href={site.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs bg-white border border-gray-200 rounded-md px-2 py-1 text-blue-600 hover:bg-blue-50 transition-colors"
            title={site.desc}
          >
            {site.name}
          </a>
        ))}
      </div>
    </div>
  );
}
