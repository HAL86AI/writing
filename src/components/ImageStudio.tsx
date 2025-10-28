import React, { useState, useEffect, useCallback } from 'react';
import { generateImage, generateImagePrompt } from '../services/geminiService.ts';

interface Props {
  title: string;
  body: string;
}

const styles = ['イラスト風', '写真風', '水彩画風', 'ミニマリスト', 'フラットデザイン'];
const aspectRatios = ['16:9', '1:1', '9:16', '4:3', '3:4'];

const ImageStudio: React.FC<Props> = ({ title, body }) => {
  const [prompt, setPrompt] = useState('');
  const [style, setStyle] = useState(styles[0]);
  const [aspectRatio, setAspectRatio] = useState(aspectRatios[0]);
  const [imageUrl, setImageUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [promptLoading, setPromptLoading] = useState(false);
  const [error, setError] = useState('');

  const createInitialPrompt = useCallback(async () => {
    if (!title || !body) return;
    setPromptLoading(true);
    setError('');
    try {
      const generatedPrompt = await generateImagePrompt(title, body, style);
      setPrompt(generatedPrompt);
    } catch (e) {
      setError('プロンプトの生成に失敗しました。');
      console.error(e);
    } finally {
      setPromptLoading(false);
    }
  }, [title, body, style]);

  useEffect(() => {
    if (title && body) {
        createInitialPrompt();
    }
  }, [title, body, createInitialPrompt]);
  
  const handleGenerateImage = async () => {
    if (!prompt) return;
    setLoading(true);
    setError('');
    setImageUrl('');
    try {
      const url = await generateImage(prompt, style, aspectRatio);
      setImageUrl(url);
    } catch (e) {
      setError((e as Error).message || '画像の生成に失敗しました。もう一度お試しください。');
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 h-full">
      {/* Input Panel */}
      <div className="bg-white p-6 rounded-lg shadow-md flex flex-col">
        <h2 className="text-2xl font-bold mb-4 text-gray-800">1. 画像をカスタマイズ</h2>
        
        <div className="mb-4">
            <label htmlFor="style" className="block text-sm font-bold text-gray-600 mb-2">スタイル</label>
            <select
                id="style"
                value={style}
                onChange={(e) => setStyle(e.target.value)}
                className="w-full p-3 bg-gray-50 border border-gray-300 rounded-md text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
            >
                {styles.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
        </div>

        <div className="mb-4">
            <label className="block text-sm font-bold text-gray-600 mb-2">アスペクト比</label>
            <div className="flex flex-wrap gap-2">
                {aspectRatios.map(ratio => (
                    <button
                        key={ratio}
                        onClick={() => setAspectRatio(ratio)}
                        className={`px-4 py-2 text-sm font-semibold rounded-md transition-colors ${
                            aspectRatio === ratio
                                ? 'bg-blue-600 text-white shadow'
                                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
                    >
                        {ratio}
                    </button>
                ))}
            </div>
        </div>

        <div className="flex-grow flex flex-col mt-2">
          <div className="flex justify-between items-center mb-2">
            <label htmlFor="prompt" className="block text-sm font-bold text-gray-600">画像生成プロンプト (英語推奨)</label>
            <button
              onClick={createInitialPrompt}
              disabled={promptLoading || !title}
              className="text-xs text-blue-600 hover:text-blue-800 disabled:text-gray-400"
            >
              {promptLoading ? '生成中...' : '記事からプロンプトを再生成'}
            </button>
          </div>
          <textarea
            id="prompt"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="生成したい画像のイメージを英語で入力してください。例: A minimalist, flat design illustration of a person having a new idea, with a lightbulb above their head. Clean background."
            className="w-full flex-grow p-3 bg-gray-50 border border-gray-300 rounded-md text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
          />
        </div>
        <button
            onClick={handleGenerateImage}
            disabled={loading || !prompt}
            className="w-full mt-6 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-md disabled:bg-gray-400 disabled:cursor-not-allowed transition-all duration-300 flex items-center justify-center"
        >
            {loading ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : 'アイキャッチ画像を生成'}
        </button>
      </div>
      {/* Output Panel */}
      <div className="bg-white p-6 rounded-lg shadow-md flex flex-col items-center justify-center">
        <h2 className="text-2xl font-bold mb-4 text-gray-800 self-start">2. 生成された画像</h2>
        {error && <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-md w-full">{error}</div>}
        <div className="w-full h-full min-h-[300px] bg-gray-100 rounded-md flex items-center justify-center border border-dashed border-gray-300 overflow-hidden">
          {loading && <div className="text-center">
            <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="mt-2 text-gray-500">画像を生成中です...</p>
          </div>}
          {!loading && imageUrl && (
            <img src={imageUrl} alt="生成された画像" className="max-w-full max-h-full object-contain" />
          )}
          {!loading && !imageUrl && !error && (
            <p className="text-gray-400">ここに画像が表示されます</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ImageStudio;
