
import React, { useState } from 'react';
import { Atmosphere, Atmospheres, GeneratedContent, OutputType } from '../types.ts';
import { generateContent } from '../services/geminiService.ts';
import { useClipboard } from '../hooks/useClipboard.ts';
import { CheckIcon, ClearIcon, CopyIcon } from './icons.tsx';

interface Props {
  generatedContent: GeneratedContent;
  setGeneratedContent: (content: GeneratedContent) => void;
}

const OutputField: React.FC<{ label: string; value: string; onChange: (value: string) => void; rows?: number }> = ({ label, value, onChange, rows = 1 }) => {
    const { copied, copy } = useClipboard();
    return (
        <div className="mb-4">
            <div className="flex justify-between items-center mb-1">
                <label className="text-sm font-bold text-gray-600">{label}</label>
                <button
                    onClick={() => copy(value)}
                    className="flex items-center text-xs bg-gray-200 hover:bg-gray-300 text-gray-700 px-2 py-1 rounded transition-colors"
                >
                    {copied ? <CheckIcon /> : <CopyIcon />}
                    <span className="ml-1">{copied ? 'コピーしました!' : 'コピー'}</span>
                </button>
            </div>
            {rows > 1 ? (
                <textarea
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    rows={rows}
                    className="w-full p-2 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
            ) : (
                <input
                    type="text"
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    className="w-full p-2 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
            )}
        </div>
    );
};


const ContentGenerator: React.FC<Props> = ({ generatedContent, setGeneratedContent }) => {
  const [topic, setTopic] = useState('');
  const [url, setUrl] = useState('');
  const [atmosphere, setAtmosphere] = useState<Atmosphere>('カジュアル');
  const [outputType, setOutputType] = useState<OutputType>('note');
  const [titleChars, setTitleChars] = useState(20);
  const [bodyChars, setBodyChars] = useState(2000);
  const [twitterChars, setTwitterChars] = useState(140);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { copied: copiedAll, copy: copyAll } = useClipboard();

  const handleGenerate = async () => {
    setLoading(true);
    setError('');
    try {
      const result = await generateContent(topic, atmosphere, outputType, url, titleChars, bodyChars, twitterChars);
      setGeneratedContent(result);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  };
  
  const handleClear = () => {
    setTopic('');
    setUrl('');
    setAtmosphere('カジュアル');
    setOutputType('note');
    setTitleChars(20);
    setBodyChars(2000);
    setTwitterChars(140);
    setGeneratedContent({ title: '', body: '', twitterPost: '' });
    setError('');
  };

  const handleCopyAll = () => {
    const { title, body, twitterPost } = generatedContent;
    if (!title && !body && !twitterPost) return;

    // Format as Tab-Separated Values (TSV) for easy pasting into spreadsheets
    const tsvContent = [title, body, twitterPost].join('\t');
    copyAll(tsvContent);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 h-full">
      {/* Input Panel */}
      <div className="bg-white p-6 rounded-lg shadow-md flex flex-col">
        <h2 className="text-2xl font-bold mb-4 text-gray-800">1. 詳細を入力</h2>
        <div className="flex-grow">
          <label className="block text-sm font-bold text-gray-600 mb-2">出力タイプ</label>
          <div className="flex space-x-4 mb-4">
            <label className="flex items-center">
              <input type="radio" name="outputType" value="note" checked={outputType === 'note'} onChange={() => setOutputType('note')} className="mr-2 text-blue-600 focus:ring-blue-500"/>
              note用記事
            </label>
            <label className="flex items-center">
              <input type="radio" name="outputType" value="company" checked={outputType === 'company'} onChange={() => setOutputType('company')} className="mr-2 text-blue-600 focus:ring-blue-500"/>
              会社用ブログ
            </label>
          </div>

          <label htmlFor="topic" className="block text-sm font-bold text-gray-600 mb-2">トピック / キーワード</label>
          <textarea
            id="topic"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="例：AI時代に事務職が磨くべき人間力"
            className="w-full h-32 p-3 bg-gray-50 border border-gray-300 rounded-md text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
          />

          <label htmlFor="url" className="block text-sm font-bold text-gray-600 mb-2 mt-4">参考URL (任意)</label>
          <input
            id="url"
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://note.com/earqs_haruka/..."
            className="w-full p-3 bg-gray-50 border border-gray-300 rounded-md text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
          />

          <label htmlFor="atmosphere" className="block text-sm font-bold text-gray-600 mb-2 mt-4">雰囲気</label>
          <select
            id="atmosphere"
            value={atmosphere}
            onChange={(e) => setAtmosphere(e.target.value as Atmosphere)}
            className="w-full p-3 bg-gray-50 border border-gray-300 rounded-md text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
          >
            {Atmospheres.map(atm => <option key={atm} value={atm}>{atm}</option>)}
          </select>
          
          <div className="mt-4">
            <h3 className="block text-sm font-bold text-gray-600 mb-2">文字数設定</h3>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label htmlFor="titleChars" className="block text-xs text-gray-500 mb-1">タイトル (約)</label>
                <input type="number" id="titleChars" value={titleChars} onChange={(e) => setTitleChars(Number(e.target.value))} className="w-full p-2 bg-gray-50 border border-gray-300 rounded-md text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500" step="5" />
              </div>
              <div>
                <label htmlFor="bodyChars" className="block text-xs text-gray-500 mb-1">本文 (約)</label>
                <input type="number" id="bodyChars" value={bodyChars} onChange={(e) => setBodyChars(Number(e.target.value))} className="w-full p-2 bg-gray-50 border border-gray-300 rounded-md text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500" step="100" />
              </div>
              <div>
                <label htmlFor="twitterChars" className="block text-xs text-gray-500 mb-1">X投稿 (以内)</label>
                <input type="number" id="twitterChars" value={twitterChars} onChange={(e) => setTwitterChars(Number(e.target.value))} className="w-full p-2 bg-gray-50 border border-gray-300 rounded-md text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500" step="10" />
              </div>
            </div>
          </div>

        </div>
        
        <div className="mt-6 flex space-x-4">
            <button
                onClick={handleGenerate}
                disabled={loading || !topic}
                className="w-full px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-md disabled:bg-gray-400 disabled:cursor-not-allowed transition-all duration-300 flex items-center justify-center"
            >
                {loading ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : 'コンテンツを生成'}
            </button>
            <button
                onClick={handleClear}
                className="flex items-center justify-center px-4 py-3 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-md transition-colors"
            >
                <ClearIcon/>
            </button>
        </div>
      </div>

      {/* Output Panel */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="flex justify-between items-center mb-2">
            <h2 className="text-2xl font-bold text-gray-800">2. 生成されたコンテンツ</h2>
             <button
                onClick={handleCopyAll}
                disabled={!generatedContent.title && !generatedContent.body && !generatedContent.twitterPost}
                className="flex items-center text-sm bg-green-100 hover:bg-green-200 text-green-800 font-semibold px-3 py-2 rounded-md transition-colors disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed"
            >
                {copiedAll ? <CheckIcon /> : <CopyIcon />}
                <span className="ml-2">{copiedAll ? 'コピーしました!' : 'すべてコピー'}</span>
            </button>
        </div>
        <p className="text-xs text-gray-500 mb-4">「すべてコピー」で、スプレッドシートに直接貼り付けられます。</p>
        {error && <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-md">{error}</div>}
        <OutputField
            label="タイトル"
            value={generatedContent.title}
            onChange={(val) => setGeneratedContent({...generatedContent, title: val})}
        />
        <OutputField
            label="本文"
            value={generatedContent.body}
            onChange={(val) => setGeneratedContent({...generatedContent, body: val})}
            rows={10}
        />
        <OutputField
            label="X (Twitter) 投稿"
            value={generatedContent.twitterPost}
            onChange={(val) => setGeneratedContent({...generatedContent, twitterPost: val})}
            rows={3}
        />
      </div>
    </div>
  );
};

export default ContentGenerator;