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

  // 🎯 사주덱스 통합 검색을 위한 6자리 Hex 고유 코드
  bonwonCode?: string;
  charyeokCode?: string;
  buheojaBonwonCode?: string;
  buheojaCharyeokCode?: string;
  heojaBonwonCode?: string;
  heojaCharyeokCode?: string;
}

const db = new Dexie('SajudexDatabase') as Dexie & {
  persons: EntityTable<Person, 'id'>;
};

// 스키마 버전 4: 6판의 고유 ID 인덱스 추가
db.version(4).stores({
  persons: 'id, name, birthDate, sajuIlju, sajuWolju, bonwonId, charyeokId, buheojaBonwonId, buheojaCharyeokId, heojaBonwonId, heojaCharyeokId, createdAt'
});

// 스키마 버전 5: 6판 고유 SajuCode(Hex String) 인덱스로 교체
db.version(5).stores({
  persons: 'id, name, birthDate, sajuIlju, sajuWolju, bonwonCode, charyeokCode, buheojaBonwonCode, buheojaCharyeokCode, heojaBonwonCode, heojaCharyeokCode, createdAt'
});

export { db };
