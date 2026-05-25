import ReactMarkdown from 'react-markdown';

export default function MessageBubble({ role, parts }) {
  const text = (parts ?? [])
    .filter(p => p.type === 'text')
    .map(p => p.text)
    .join('');

  if (role === 'user') {
    return (
      <div className="flex justify-end mb-3">
        <div className="bg-blue-600 text-white rounded-2xl rounded-tr-sm px-4 py-2 max-w-[80%] text-sm whitespace-pre-wrap">
          {text}
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-start mb-3">
      <div className="bg-white border border-gray-200 rounded-2xl rounded-tl-sm px-4 py-3 max-w-[80%] text-sm prose prose-sm prose-p:my-1 prose-ul:my-1 prose-li:my-0">
        <ReactMarkdown>{text}</ReactMarkdown>
      </div>
    </div>
  );
}
