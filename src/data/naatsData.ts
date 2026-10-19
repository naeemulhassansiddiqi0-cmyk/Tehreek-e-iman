import naatsJson from './naats.json';
import { CLASSICAL_QASIDAS } from './classicalQasidasData';

export interface NaatItem {
  id: number;
  title: string;
  artist?: string;
  category?: string;
  fileName: string;
  src?: string;
  audioUrl?: string;
  type?: string;
  theme?: string;
  poet?: string;
  couplets?: {
    arabic: string;
    urdu: string;
  }[];
}

const localNaats: NaatItem[] = (naatsJson as any[]).map(item => {
  return {
    id: item.id,
    title: item.title,
    artist: item.artist || 'پبلک ڈومین • تحریکِ ایمان',
    category: item.category || 'نعتِ رسول ﷺ',
    fileName: item.fileName,
    src: `/naats/${encodeURIComponent(item.fileName)}`,
    type: 'local'
  };
});

const classicalItems: NaatItem[] = CLASSICAL_QASIDAS.map(q => ({
  id: q.id,
  title: q.title,
  artist: `${q.reciter} (${q.poet})`,
  category: q.category,
  fileName: `classical-${q.id}.mp3`,
  src: q.audioUrl,
  audioUrl: q.audioUrl,
  type: 'classical',
  theme: q.theme,
  poet: q.poet,
  couplets: q.couplets
}));

export const naatsData: NaatItem[] = [...classicalItems, ...localNaats];

