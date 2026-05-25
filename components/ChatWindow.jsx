'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useChat } from '@ai-sdk/react';
import { DefaultChatTransport } from 'ai';
import MessageBubble from './MessageBubble';
import QuickPrompts from './QuickPrompts';

export default function ChatWindow({ language, pageContent, setPageContent, url, setUrl }) {
  const [input, setInput] = useState('');
  const [showPaste, setShowPaste] = useState(false);
  const [pendingImage, setPendingImage] = useState(null); // { dataUrl, mimeType }
  const fileInputRef = useRef(null);

  const { messages, sendMessage, status } = useChat({
    transport: new DefaultChatTransport({ api: '/api/ask' }),
  });

  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleImageSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setPendingImage({ dataUrl: reader.result, mimeType: file.type });
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const send = useCallback(
    (text, image) => {
      if (image) {
        sendMessage(
          {
            role: 'user',
            parts: [
              { type: 'file', mediaType: image.mimeType, url: image.dataUrl },
              { type: 'text', text },
            ],
          },
          { body: { language, pageContent, url } },
        );
      } else {
        sendMessage({ text }, { body: { language, pageContent, url } });
      }
    },
    [sendMessage, language, pageContent, url],
  );

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!input.trim() && !pendingImage) return;
    send(input, pendingImage);
    setInput('');
    setPendingImage(null);
  };

  const isLoading = status === 'submitted' || status === 'streaming';

  return (
    <div className="flex flex-col flex-1 min-h-0">
      {/* Paste area toggle */}
      <div className="px-4 py-2 border-b bg-gray-50 flex items-center gap-2">
        <button
          onClick={() => setShowPaste(v => !v)}
          className="text-xs text-blue-600 hover:underline"
        >
          {showPaste ? 'Hide paste area ▲' : 'Paste page content ▼'}
        </button>
        {pageContent && (
          <span className="text-xs text-gray-500">
            {pageContent.length} chars pasted
          </span>
        )}
      </div>

      {showPaste && (
        <div className="px-4 py-2 border-b bg-gray-50">
          <textarea
            value={pageContent}
            onChange={(e) => setPageContent(e.target.value)}
            placeholder="Paste text from a Korean government website here..."
            rows={4}
            className="w-full text-xs border rounded-lg p-2 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="Page URL (optional)"
            className="w-full text-xs border rounded-lg px-2 py-1 mt-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      )}

      {/* Message list */}
      <div className="flex-1 overflow-y-auto p-4 bg-gray-50 min-h-0">
        {messages.length === 0 ? (
          <QuickPrompts onSend={send} />
        ) : (
          messages.map((message) => (
            <MessageBubble key={message.id} role={message.role} parts={message.parts} />
          ))
        )}
        {isLoading && (
          <div className="flex justify-start mb-3">
            <div className="bg-white border border-gray-200 rounded-2xl rounded-tl-sm px-4 py-2 text-sm text-gray-400">
              Thinking…
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Image preview */}
      {pendingImage && (
        <div className="px-4 py-2 border-t bg-white flex items-center gap-2">
          <img
            src={pendingImage.dataUrl}
            alt="pending attachment"
            className="h-16 w-16 object-cover rounded-lg border"
          />
          <button
            type="button"
            onClick={() => setPendingImage(null)}
            className="text-xs text-red-500 hover:text-red-700"
          >
            Remove
          </button>
        </div>
      )}

      {/* Input */}
      <form onSubmit={handleSubmit} className="p-4 border-t bg-white">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleImageSelect}
        />
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isLoading}
            className="text-gray-400 hover:text-blue-600 transition-colors disabled:opacity-40 text-xl px-1"
            title="Attach image"
          >
            📷
          </button>
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isLoading}
            placeholder="Ask a question…"
            className="flex-1 border rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={isLoading || (!input.trim() && !pendingImage)}
            className="bg-blue-600 text-white px-4 py-2 rounded-full text-sm font-medium disabled:opacity-40 hover:bg-blue-700 transition-colors"
          >
            Send
          </button>
        </div>
      </form>
    </div>
  );
}
