import { v4 as uuid } from 'uuid';
import { SessionTab } from '../../common/types';

interface CreateTabOptions {
  url: string;
  active?: boolean;
}

export function createNewTab(options: CreateTabOptions): SessionTab {
  return {
    id: uuid(),
    title: 'Nouvel onglet',
    url: options.url,
    isActive: options.active ?? false
  };
}
