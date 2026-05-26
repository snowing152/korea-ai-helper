import { QUICK_PROMPTS } from '../constants/quickPrompts';

export default function QuickPrompts({ onSend }) {
  return (
    <div className="p-5">
      <p className="text-sm font-semibold text-[#1A1A1A] mb-1 text-center">
        How can I help you today?
      </p>
      <p className="text-xs text-[#9CA3AF] mb-4 text-center">
        Paste content from a Korean site, or just ask a question
      </p>
      <div className="grid grid-cols-2 gap-2">
        {QUICK_PROMPTS.map(prompt => (
          <button
            key={prompt.label}
            onClick={() => onSend(prompt.text)}
            className="bg-white border border-[#EDE9E3] rounded-xl p-3 text-left hover:border-[#D97706] transition-colors"
          >
            <div className="text-xs font-medium text-[#1A1A1A]">{prompt.label}</div>
            <div className="text-[10px] text-[#9CA3AF] mt-0.5">{prompt.subtitle}</div>
          </button>
        ))}
      </div>
    </div>
  );
}
