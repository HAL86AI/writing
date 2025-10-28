import React, { useState } from 'react';
import { Tab, GeneratedContent } from './types.ts';
import ContentGenerator from './components/ContentGenerator.tsx';
import ImageStudio from './components/ImageStudio.tsx';
import Chatbot from './components/Chatbot.tsx';
import { ContentIcon, ImageIcon, ChatIcon } from './components/icons.tsx';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>(Tab.Content);
  const [generatedContent, setGeneratedContent] = useState<GeneratedContent>({
    title: '',
    body: '',
    twitterPost: '',
  });

  const renderTabContent = () => {
    switch (activeTab) {
      case Tab.Content:
        return <ContentGenerator generatedContent={generatedContent} setGeneratedContent={setGeneratedContent} />;
      case Tab.Image:
        return <ImageStudio title={generatedContent.title} body={generatedContent.body} />;
      case Tab.Chat:
        return <Chatbot />;
      default:
        return null;
    }
  };

  const NavButton: React.FC<{ tab: Tab, icon: React.ReactNode }> = ({ tab, icon }) => (
    <button
      onClick={() => setActiveTab(tab)}
      className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${activeTab === tab ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-200'}`}
    >
      {icon}
      <span className="font-semibold">{tab}</span>
    </button>
  );

  return (
    <div className="min-h-screen bg-gray-100 text-gray-800 font-sans flex flex-col p-4 md:p-8">
      <header className="text-center mb-8">
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-gray-900">
          はるさん専用 クリエイティブアシスタント
        </h1>
        <p className="text-gray-500 mt-2">あなたの執筆スタイルを学習したAIパートナー</p>
      </header>
      
      <nav className="flex justify-center space-x-2 md:space-x-4 mb-8 bg-white p-2 rounded-lg shadow-sm self-center">
        <NavButton tab={Tab.Content} icon={<ContentIcon />} />
        <NavButton tab={Tab.Image} icon={<ImageIcon />} />
        <NavButton tab={Tab.Chat} icon={<ChatIcon />} />
      </nav>

      <main className="flex-grow">
        {renderTabContent()}
      </main>
    </div>
  );
};

export default App;
