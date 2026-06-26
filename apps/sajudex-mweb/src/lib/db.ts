import Dexie, { type EntityTable } from 'dexie';

export interface Relationship {
  targetId: string;
  type: string;
  memo?: string;
}

export interface Person {
  id: string; // UUID v7 (Primary Key)
  name: string;
  birthDate: string; // YYYY-MM-DD
  birthTime?: string; // HH:mm (optional)
  isLunar?: boolean;
  isLeapMonth?: boolean;
  gender?: 'M' | 'F';
  sajuIlju?: string;
  sajuWolju?: string;
  sajuData?: any;
  memo?: string;
  relationships?: Relationship[];
  createdAt: Date;
  updatedAt: Date;

  // 🎯 사주덱스 통합 검색을 위한 수학적 고유 ID (0 ~ 43199)
  bonwonId?: number;
  charyeokId?: number;
  buheojaBonwonId?: number;
  buheojaCharyeokId?: number;
  heojaBonwonId?: number;
  heojaCharyeokId?: number;
}

const db = new Dexie('SajudexDatabase') as Dexie & {
  persons: EntityTable<Person, 'id'>;
};

// 스키마 버전 4: 6판의 고유 ID 인덱스 추가
db.version(4).stores({
  persons: 'id, name, birthDate, sajuIlju, sajuWolju, bonwonId, charyeokId, buheojaBonwonId, buheojaCharyeokId, heojaBonwonId, heojaCharyeokId, createdAt'
});

export { db };
