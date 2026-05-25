import { QUICK_PROMPTS } from '../constants/quickPrompts';

export default function QuickPrompts({ onSend }) {
  return (
    <div className="p-4">
      <p className="text-xs text-gray-500 mb-3 text-center">Quick questions</p>
      <div className="flex flex-wrap gap-2 justify-center">
        {QUICK_PROMPTS.map(prompt => (
          <button
            key={prompt.label}
            onClick={() => onSend(prompt.text)}
            className="bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs px-3 py-2 rounded-full border border-gray-200 transition-colors"
          >
            {prompt.label}
          </button>
        ))}
      </div>
    </div>
  );
}
