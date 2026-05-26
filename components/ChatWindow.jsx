'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useChat } from '@ai-sdk/react';
import { DefaultChatTransport } from 'ai';
import MessageBubble from './MessageBubble';
import QuickPrompts from './QuickPrompts';

const ATTACH_ITEMS = [
  { id: 'photo',    icon: '🖼️', label: 'Photo',        desc: 'Screenshot or image' },
  { id: 'pdf',      icon: '📄', label: 'Document',     desc: 'PDF file' },
  { id: 'paste',   icon: '📋', label: 'Paste text',   desc: 'Copy-pasted page content' },
  { id: 'url',      icon: '🔗', label: 'Website URL',  desc: 'Link to a Korean gov page' },
];

export default function ChatWindow({ pageContent, setPageContent, url, setUrl }) {
  const [input, setInput] = useState('');
  const [showPaste, setShowPaste] = useState(false);
  const [pendingFile, setPendingFile] = useState(null); // { dataUrl, mimeType, name, isImage }
  const [showAttachMenu, setShowAttachMenu] = useState(false);

  const imageInputRef = useRef(null);
  const pdfInputRef = useRef(null);
  const textareaRef = useRef(null);
  const attachMenuRef = useRef(null);

  const { messages, sendMessage, status } = useChat({
    transport: new DefaultChatTransport({ api: '/api/ask' }),
  });

  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (!showAttachMenu) return;
    const handler = (e) => {
      if (attachMenuRef.current && !attachMenuRef.current.contains(e.target)) {
        setShowAttachMenu(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [showAttachMenu]);

  const handleFileSelect = (e, isImage) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setPendingFile({ dataUrl: reader.result, mimeType: file.type, name: file.name, isImage });
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleAttachItem = (id) => {
    setShowAttachMenu(false);
    if (id === 'photo') imageInputRef.current?.click();
    else if (id === 'pdf') pdfInputRef.current?.click();
    else setShowPaste(true);
  };

  const send = useCallback(
    (text, file) => {
      if (file) {
        sendMessage(
          {
            role: 'user',
            parts: [
              { type: 'file', mediaType: file.mimeType, url: file.dataUrl },
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
    if (!input.trim() && !pendingFile) return;
    send(input, pendingFile);
    setInput('');
    setPendingFile(null);
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const isLoading = status === 'submitted' || status === 'streaming';

  return (
    <div className="flex flex-col flex-1 min-h-0">
      {/* Collapsible paste area — opened from + menu */}
      {showPaste && (
        <div className="px-4 py-3 border-b border-[#EDE9E3] bg-white">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-[#9CA3AF]">Page context</span>
            <button
              onClick={() => setShowPaste(false)}
              className="text-xs text-[#9CA3AF] hover:text-[#1A1A1A] leading-none"
            >
              ✕
            </button>
          </div>
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
          {pageContent && (
            <p className="text-xs text-[#9CA3AF] mt-1">{pageContent.length} chars pasted</p>
          )}
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

      {/* Pending attachment preview */}
      {pendingFile && (
        <div className="px-4 py-2 border-t border-[#EDE9E3] bg-white flex items-center gap-3">
          {pendingFile.isImage ? (
            <img
              src={pendingFile.dataUrl}
              alt="pending"
              className="h-12 w-12 object-cover rounded-lg border border-[#EDE9E3] shrink-0"
            />
          ) : (
            <div className="flex items-center gap-2 bg-[#F5F3EF] rounded-lg px-3 py-2 min-w-0">
              <span className="text-base shrink-0">📄</span>
              <span className="text-xs text-[#1A1A1A] truncate">{pendingFile.name}</span>
            </div>
          )}
          <button
            type="button"
            onClick={() => setPendingFile(null)}
            className="text-xs text-red-400 hover:text-red-600 ml-auto shrink-0"
          >
            Remove
          </button>
        </div>
      )}

      {/* Hidden file inputs */}
      <input
        ref={imageInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => handleFileSelect(e, true)}
      />
      <input
        ref={pdfInputRef}
        type="file"
        accept=".pdf,application/pdf"
        className="hidden"
        onChange={(e) => handleFileSelect(e, false)}
      />

      {/* Input bar */}
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
            {/* + button with attach menu */}
            <div className="relative" ref={attachMenuRef}>
              <button
                type="button"
                onClick={() => setShowAttachMenu((v) => !v)}
                disabled={isLoading}
                className="w-7 h-7 rounded-full border border-[#DDDDDD] bg-[#F5F3EF] text-[#888888] hover:bg-[#EDE9E3] hover:text-[#D97706] flex items-center justify-center transition-colors disabled:opacity-40 text-lg font-light leading-none select-none"
                title="Add attachment"
              >
                +
              </button>

              {showAttachMenu && (
                <div className="absolute bottom-9 left-0 bg-white border border-[#EDE9E3] rounded-2xl shadow-xl overflow-hidden w-56 py-1 z-20">
                  {ATTACH_ITEMS.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => handleAttachItem(item.id)}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-left hover:bg-[#FAF9F5] transition-colors"
                    >
                      <span className="text-lg shrink-0">{item.icon}</span>
                      <div className="min-w-0">
                        <div className="text-sm font-medium text-[#1A1A1A]">{item.label}</div>
                        <div className="text-xs text-[#9CA3AF]">{item.desc}</div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={handleSubmit}
              disabled={isLoading || (!input.trim() && !pendingFile)}
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
