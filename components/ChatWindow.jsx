'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useChat } from '@ai-sdk/react';
import { DefaultChatTransport } from 'ai';
import MessageBubble from './MessageBubble';
import QuickPrompts from './QuickPrompts';

export default function ChatWindow({ pageContent, setPageContent, url, setUrl }) {
  const [input, setInput] = useState('');
  const [showPaste, setShowPaste] = useState(false);
  const [pendingImage, setPendingImage] = useState(null); // { dataUrl, mimeType }
  const fileInputRef = useRef(null);
  const textareaRef = useRef(null);

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
          { body: { pageContent, url } },
        );
      } else {
        sendMessage({ text }, { body: { pageContent, url } });
      }
    },
    [sendMessage, pageContent, url],
  );

  const handleSubmit = () => {
    if (!input.trim() && !pendingImage) return;
    send(input, pendingImage);
    setInput('');
    setPendingImage(null);
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const isLoading = status === 'submitted' || status === 'streaming';

  return (
    <div className="flex flex-col flex-1 min-h-0">
      {/* Paste area toggle */}
      <div className="px-4 py-2 border-b border-[#EDE9E3] bg-white flex items-center gap-2">
        <button
          onClick={() => setShowPaste(v => !v)}
          className="text-xs text-[#D97706] hover:underline"
        >
          {showPaste ? 'Hide paste area ▲' : 'Paste page content ▼'}
        </button>
        {pageContent && (
          <span className="text-xs text-[#9CA3AF]">
            {pageContent.length} chars pasted
          </span>
        )}
      </div>

      {showPaste && (
        <div className="px-4 py-2 border-b border-[#EDE9E3] bg-white">
          <textarea
            value={pageContent}
            onChange={(e) => setPageContent(e.target.value)}
            placeholder="Paste text from a Korean government website here..."
            rows={4}
            className="w-full text-xs border border-[#EDE9E3] rounded-lg p-2 resize-none focus:outline-none focus:ring-2 focus:ring-[#D97706]"
          />
          <input
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="Page URL (optional)"
            className="w-full text-xs border border-[#EDE9E3] rounded-lg px-2 py-1 mt-1 focus:outline-none focus:ring-2 focus:ring-[#D97706]"
          />
        </div>
      )}

      {/* Message list */}
      <div className="flex-1 overflow-y-auto p-4 bg-[#FAF9F5] min-h-0">
        {messages.length === 0 ? (
          <QuickPrompts onSend={send} />
        ) : (
          messages.map((message) => (
            <MessageBubble key={message.id} role={message.role} parts={message.parts} />
          ))
        )}
        {isLoading && (
          <div className="flex justify-start mb-3">
            <div className="bg-white border border-[#EDE9E3] rounded-2xl rounded-bl-sm px-4 py-2 text-sm text-[#9CA3AF]">
              Thinking…
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Image preview */}
      {pendingImage && (
        <div className="px-4 py-2 border-t border-[#EDE9E3] bg-white flex items-center gap-2">
          <img
            src={pendingImage.dataUrl}
            alt="pending attachment"
            className="h-16 w-16 object-cover rounded-lg border border-[#EDE9E3]"
          />
          <button
            type="button"
            onClick={() => setPendingImage(null)}
            className="text-xs text-red-400 hover:text-red-600"
          >
            Remove
          </button>
        </div>
      )}

      {/* Claude-style textarea input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleImageSelect}
      />
      <div className="p-3 bg-[#FAF9F5]">
        <div className="bg-white border border-[#DDDDDD] rounded-2xl px-4 py-3 shadow-sm">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => {
              setInput(e.target.value);
              e.target.style.height = 'auto';
              e.target.style.height = e.target.scrollHeight + 'px';
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSubmit();
              }
            }}
            disabled={isLoading}
            placeholder="Ask a question…"
            rows={1}
            className="w-full resize-none text-sm focus:outline-none bg-transparent text-[#1A1A1A] placeholder-[#C0BBB5] max-h-40 overflow-y-auto disabled:opacity-50"
          />
          <div className="flex justify-between items-center mt-2">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isLoading}
              className="text-[#BBBBBB] hover:text-[#D97706] transition-colors disabled:opacity-40 text-lg"
              title="Attach image"
            >
              📷
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isLoading || (!input.trim() && !pendingImage)}
              className="bg-[#D97706] disabled:bg-[#E5E0D8] text-white disabled:text-[#9CA3AF] rounded-lg w-7 h-7 flex items-center justify-center transition-colors text-sm font-bold"
            >
              ↑
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
