import { Chat } from "@google/genai";

export enum Tab {
  Content = 'コンテンツ生成',
  Chat = 'チャットボット',
}

export const Atmospheres = [
  'カジュアル',
  'プロフェッショナル',
  'ストーリーテラー',
  '共感的',
  'インスピレーションを与える',
  '丁寧な解説',
  '優しく励ます',
  '自身の経験を語る',
  '論理的でわかりやすい',
] as const;

export type Atmosphere = typeof Atmospheres[number];

export type OutputType = 'note' | 'company';

export interface GeneratedContent {
  title: string;
  body: string;
  twitterPost: string;
}

export interface ChatMessage {
  role: 'user' | 'model';
  parts: { text: string }[];
}
