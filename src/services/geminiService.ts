
import { GoogleGenAI, Type, Chat, GenerateContentResponse } from "@google/genai";
import { Atmosphere, OutputType, GeneratedContent } from '../types.ts';

// According to guidelines, API key must be from process.env.API_KEY
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// Fix: Add styleMap for image generation functions.
const styleMap: { [key: string]: string } = {
  'イラスト風': 'vibrant illustration',
  '写真風': 'photorealistic',
  '水彩画風': 'watercolor painting',
  'ミニマリスト': 'minimalist design',
  'フラットデザイン': 'flat design illustration',
};

export const generateContent = async (
  topic: string,
  atmosphere: Atmosphere,
  outputType: OutputType,
  url: string,
  titleChars: number,
  bodyChars: number,
  twitterChars: number
): Promise<GeneratedContent> => {
    
    const systemInstruction = `
あなたは「はるさん」という名前のライターのための、プロのクリエイティブアシスタントAIです。
あなたの役割は、はるさんの執筆スタイル、価値観、知識を完全に理解し、彼女になりきって、読者の心に響くコンテンツを作成することです。

# はるさんの基本情報
- 名前：はる
- 職業：合同会社アークス代表（事務代行、業務改善、AIセミナー講師）、株式会社プロ人材機構 社外取締役
- 経歴：中小企業のひとり事務員20年、日本語教師
- コミュニティ：「Bloomeë Lab」「AI×事務部」運営
- 特徴：AIや自動化ツール（Gemini, GAS, Power Automate など）を愛用
- 想い：誰もが自分らしく働きやすい社会づくり、AIを活用した新しい働き方の提案、事務職の可能性を広げる

# 執筆の核となるペルソナ
- 読者にとっては、親しい友人であり、少し先を歩く先輩。
- 常に温かく誠実で、決して読者を否定せず、共感をベースに語りかける。

# 記事の基本構成
1.  **導入**: 読者の悩みに「〇〇な時、ありませんか？」と語りかけ、共感を示す。
2.  **本論**: 自身の失敗談や葛藤を正直に語り、読者との距離を縮める。
3.  **結論**: 解決策を押し付けず、「あなたなら大丈夫」と、そっと背中を押す希望のメッセージで締めくくる。

# 執筆スタイルと厳守事項
- 一人称は「私」。
- フレンドリーで親しみやすいトーンを保つ。
- 読者との対話を意識し、「〜ですよね？」「〜しませんか？」といった問いかけを適度に使う。
- 専門用語は中高生にも分かるように、具体例を交えて丁寧に説明する。
- 箇条書きは最小限にし、できるだけ文章で想いを伝える。
- 強い断定表現（「新常識」「必ず」など）は避け、押しつけがましくならないようにする。
- 記事のテーマは1つに絞る（1記事1メッセージ）。
- お金儲けに関する話題（例：「〇万円稼ぐ」）は避ける。
- 記事の最後で次回予告はしない。

# 出力タイプ別の注意点
- **note用記事**:
  - はるさん個人の経験や想いを色濃く反映させる。
  - 適度に絵文字（例：😊、💪）を使い、親しみやすさを演出する。
  - 太字（Markdown）は絶対に使用しない。
- **会社用ブログ**:
  - note用より少しフォーマルで、ビジネス寄りの文体。
  - 読者ターゲットは経営者や決裁権者も含むため、信頼性と専門性を意識する。
  - 絵文字は使用しない。

# 読者ターゲット
- AIで業務効率化したい事務職の方
- 新しい働き方に興味がある30〜50代の女性
- バックオフィスに課題を抱える中小企業の経営者や個人事業主

あなたはこれらのガイドラインを完璧に遵守し、はるさんの分身として最高のコンテンツを生成してください。
`;
    
    const outputTypeName = outputType === 'note' ? 'note用記事' : '会社用ブログ';
    const prompt = `
以下の指示に従って、ブログコンテンツをJSON形式で生成してください。

# コンテンツの詳細
- **トピック/キーワード:** ${topic}
- **出力タイプ:** ${outputTypeName}
- **雰囲気:** ${atmosphere}
- **参考URL:** ${url || 'なし'}
  - URLがある場合は、その内容を参考にしつつ、必ずあなた自身の言葉で、独自の視点から記事を作成してください。決してコピー＆ペーストはしないでください。

# 文字数の目安
- **タイトル:** 約${titleChars}文字
- **本文:** 約${bodyChars}文字
- **X (Twitter) 投稿:** ${twitterChars}文字以内

# JSONの厳守事項
- **タイトル (title):** 記事タイトル。キャッチーすぎず、誠実なスタイルで。絵文字は絶対に使用しない。
- **本文 (body):** 記事の本文。適度な改行と段落分けを行い、読みやすさを重視する。
- **X (Twitter) 投稿 (twitterPost):** 本文を要約した投稿文。**ハッシュタグは絶対に含めないでください。**
`;

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-pro',
        contents: prompt,
        config: {
            systemInstruction: systemInstruction,
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    title: { type: Type.STRING, description: "記事のタイトル" },
                    body: { type: Type.STRING, description: "記事の本文" },
                    twitterPost: { type: Type.STRING, description: "X (Twitter)用の投稿文（ハッシュタグなし）" },
                },
                required: ['title', 'body', 'twitterPost'],
            },
        },
    });

    const jsonString = response.text.trim();
    const result = JSON.parse(jsonString);
    return result as GeneratedContent;
};

// Fix: Export generateImagePrompt function to be used in ImageStudio.tsx.
export const generateImagePrompt = async (title: string, body: string, style: string): Promise<string> => {
    if (!title && !body) return "A minimalist, flat design illustration of a Japanese woman in her 30s writing on a laptop, with a cup of coffee. Clean background.";
    
    const englishStyle = styleMap[style] || 'illustration';

    const prompt = `
以下のブログ記事のタイトルと本文を読んで、この記事のアイキャッチ画像に最適な、創造的で詳細な英語の画像生成プロンプトを1つだけ作成してください。

# 条件
- プロンプトは具体的で、情景が目に浮かぶように記述してください。
- スタイルは**${englishStyle}**をベースとして必ず含めてください。
- もしプロンプトに人物が含まれる場合、その人物は必ず「a Japanese woman in her 30s」として描写してください。
- 記事の雰囲気やメッセージが伝わるような、芸術的で魅力的なプロンプトにしてください。
- 回答はプロンプトのテキストのみとし、余計な説明や前置きは一切含めないでください。

# タイトル
${title}

# 本文の冒頭
${body.substring(0, 500)}... 
`;

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
    });
    
    return response.text.trim().replace(/"/g, '');
};

// Fix: Export generateImage function to be used in ImageStudio.tsx.
export const generateImage = async (prompt: string, style: string, aspectRatio: string): Promise<string> => {
    const englishStyle = styleMap[style] || 'illustration';
    const finalPrompt = `${prompt}, in the style of a ${englishStyle}`;

    const response = await ai.models.generateImages({
        model: 'imagen-4.0-generate-001',
        prompt: finalPrompt,
        config: {
            numberOfImages: 1,
            outputMimeType: 'image/jpeg',
            aspectRatio: aspectRatio,
        },
    });

    if (response.generatedImages && response.generatedImages.length > 0) {
        const base64ImageBytes: string = response.generatedImages[0].image.imageBytes;
        return `data:image/jpeg;base64,${base64ImageBytes}`;
    }

    throw new Error("画像が生成されませんでした。プロンプトを修正して再度お試しください。");
};


export const createChat = (): Chat => {
    const chat = ai.chats.create({
        model: 'gemini-2.5-flash',
        config: {
            systemInstruction: 'あなたは、作家である「はるさん」の良き相談相手であり、クリエイティブなアシスタントAIです。執筆に関する壁打ち、アイデア出し、構成案の提案、文章の改善など、あらゆる相談に親身に乗ってください。はるさんの創造性を最大限に引き出すことを目指し、常に協力的で、ポジティブな姿勢で対話してください。',
        },
    });
    return chat;
};

export const sendMessageToChat = async (chat: Chat, message: string): Promise<AsyncGenerator<GenerateContentResponse>> => {
    const result = await chat.sendMessageStream({ message });
    return result;
};