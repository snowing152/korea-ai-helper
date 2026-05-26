'use client';

import { useState } from 'react';
import ChatWindow from '../components/ChatWindow';
import SiteLinks from '../components/SiteLinks';

export default function Home() {
  const [pageContent, setPageContent] = useState('');
  const [url, setUrl] = useState('');

  return (
    <div className="flex flex-col h-screen max-w-lg mx-auto bg-[#FAF9F5]">
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-3 border-b border-[#EDE9E3] bg-white">
        <div>
          <h1 className="text-base font-semibold text-[#1A1A1A]">Korea AI Helper</h1>
          <p className="text-xs text-[#9CA3AF]">Navigate Korean government sites</p>
        </div>
      </header>

      {/* Site links */}
      <SiteLinks />

      {/* Chat — takes remaining height */}
      <ChatWindow
        pageContent={pageContent}
        setPageContent={setPageContent}
        url={url}
        setUrl={setUrl}
      />
    </div>
  );
}
