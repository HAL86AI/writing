
import React, { useState, useRef, useEffect, useCallback } from 'react';
// Fix: Correct import for GenerateContentResponse type
import { Chat, GenerateContentResponse } from '@google/genai';
import { ChatMessage } from '../types.ts';
import { createChat, sendMessageToChat } from '../services/geminiService.ts';

const Chatbot: React.FC = () => {
  const [chat, setChat] = useState<Chat | null>(null);
  const [history, setHistory] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const endOfMessagesRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setChat(createChat());
    setHistory([{ role: 'model', parts: [{ text: "こんにちは！執筆に関して何かお手伝いできることはありますか？" }] }]);
  }, []);

  useEffect(() => {
    endOfMessagesRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [history]);

  const handleSend = useCallback(async () => {
    if (!input.trim() || !chat || loading) return;

    const userMessage: ChatMessage = { role: 'user', parts: [{ text: input }] };
    setHistory(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const stream: AsyncGenerator<GenerateContentResponse> = await sendMessageToChat(chat, input);
      let modelResponse = '';
      setHistory(prev => [...prev, { role: 'model', parts: [{ text: '' }] }]);

      for await (const chunk of stream) {
        modelResponse += chunk.text;
        setHistory(prev => {
          const newHistory = [...prev];
          newHistory[newHistory.length - 1].parts[0].text = modelResponse;
          return newHistory;
        });
      }
    } catch (e) {
      console.error(e);
      const errorMessage: ChatMessage = { role: 'model', parts: [{ text: "申し訳ありません、エラーが発生しました。もう一度お試しください。" }] };
      // Fix: When an error occurs, the placeholder model message should be replaced, not appended to.
      setHistory(prev => {
        const newHistory = [...prev];
        if (newHistory[newHistory.length - 1].role === 'model' && newHistory[newHistory.length - 1].parts[0].text === '') {
            newHistory.pop();
        }
        return [...newHistory, errorMessage];
      });
    } finally {
      setLoading(false);
    }
  }, [input, chat, loading]);

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSend();
    }
  };

  return (
    <div className="flex flex-col h-full max-w-4xl mx-auto bg-white rounded-lg shadow-md p-4">
      <div className="flex-1 overflow-y-auto pr-2 space-y-4">
        {history.map((msg, index) => (
          <div key={index} className={`flex items-end gap-2 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`rounded-lg px-4 py-2 max-w-lg whitespace-pre-wrap ${msg.role === 'user' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-800'}`}>
              {msg.parts[0].text}
              {loading && msg.role === 'model' && index === history.length - 1 && <span className="inline-block w-2 h-4 bg-gray-700 ml-1 animate-pulse"></span>}
            </div>
          </div>
        ))}
        <div ref={endOfMessagesRef} />
      </div>
      <div className="mt-4 flex">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="アイデア出し、構成、改善案などを相談..."
          className="flex-1 p-3 bg-gray-50 border border-gray-300 rounded-l-md text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
          disabled={loading}
        />
        <button
          onClick={handleSend}
          disabled={loading || !input.trim()}
          className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-r-md disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          送信
        </button>
      </div>
    </div>
  );
};

export default Chatbot;