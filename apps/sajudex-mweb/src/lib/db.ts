import Dexie, { type EntityTable } from 'dexie';

export interface Relationship {
  targetId: string; // UUID of another Person
  type: string;     // e.g., '배우자', '동업자', '친구'
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
  sajuIlju?: string; // Pre-calculated Ilju for quick search
  sajuWolju?: string; // Pre-calculated Wolju
  sajuData?: any; // Full pre-calculated Saju 8 characters data
  memo?: string; // Free text for any extra info, contacts, notes
  relationships?: Relationship[]; // Array of connections to other people
  createdAt: Date;
  updatedAt: Date;
}

const db = new Dexie('SajudexDatabase') as Dexie & {
  persons: EntityTable<
    Person,
    'id' // The primary key is now the UUID string 'id'
  >;
};

// Schema definition
db.version(3).stores({
  // Indexed properties for fast searching
  persons: 'id, name, birthDate, sajuIlju, sajuWolju, createdAt'
});

export { db };
