import naatsJson from './naats.json';

export interface NaatItem {
  id: number;
  title: string;
  artist?: string;
  category?: string;
  fileName: string;
  src?: string;
  type?: string;
}

export const naatsData: NaatItem[] = (naatsJson as any[]).map(item => {
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

