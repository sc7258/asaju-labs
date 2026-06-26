'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/lib/db';
import { UserPlus, Calendar, ChevronRight, Search, X } from 'lucide-react';

export default function Home() {
  const [searchQuery, setSearchQuery] = useState('');

  const persons = useLiveQuery(async () => {
    const allPersons = await db.persons.orderBy('createdAt').reverse().toArray();
    
    if (!searchQuery.trim()) {
      return allPersons;
    }

    const lowerQuery = searchQuery.toLowerCase();
    
    return allPersons.filter(person => {
      if (person.name.toLowerCase().includes(lowerQuery)) return true;
      if (person.sajuIlju && person.sajuIlju.includes(lowerQuery)) return true;
      if (person.sajuWolju && person.sajuWolju.includes(lowerQuery)) return true;
      if (person.memo && person.memo.toLowerCase().includes(lowerQuery)) return true;
      if (person.sajuData?.chasam) {
         const { buheojaBonwon, buheojaCharyeok, heojaBonwon, heojaCharyeok } = person.sajuData.chasam;
         if (buheojaBonwon?.includes(lowerQuery) || buheojaCharyeok?.includes(lowerQuery) || 
             heojaBonwon?.includes(lowerQuery) || heojaCharyeok?.includes(lowerQuery)) {
             return true;
         }
      }
      return false;
    });
  }, [searchQuery]);

  return (
    <div className="p-6 pb-24 max-w-2xl mx-auto">
      <header className="mb-6 mt-4 flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">내 인연록</h1>
          <p className="text-sm text-gray-500 mt-1">소중한 사람들의 명식과 메모를 기록하세요</p>
        </div>
        {persons && persons.length > 0 && (
          <Link href="/new" className="p-2 bg-blue-100 text-blue-600 rounded-full hover:bg-blue-200 transition-colors">
            <UserPlus className="w-5 h-5" />
          </Link>
        )}
      </header>

      <div className="relative mb-6">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-gray-400" />
        </div>
        <input
          type="text"
          className="block w-full pl-10 pr-10 py-3 border border-gray-200 rounded-xl leading-5 bg-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all shadow-sm"
          placeholder="이름, 6판 명식(예: 병진), 메모 검색..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      {persons === undefined ? (
        <div className="animate-pulse flex flex-col gap-4 mt-8">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-24 bg-gray-100 rounded-2xl"></div>
          ))}
        </div>
      ) : persons.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 bg-gray-50 rounded-2xl border border-dashed border-gray-300">
          <div className="text-5xl mb-4 opacity-80">📭</div>
          <h3 className="text-base font-semibold text-gray-800">
            {searchQuery ? '검색 결과가 없습니다' : '등록된 인연이 없습니다'}
          </h3>
          <p className="text-sm text-gray-500 mt-2 text-center px-6 leading-relaxed">
            {searchQuery 
              ? '다른 검색어(이름이나 일주 등)로 시도해보세요.'
              : '아래 버튼을 눌러 새로운 지인의 사주를 추가해보세요.'}
          </p>
          {!searchQuery && (
            <Link href="/new" className="mt-8 px-6 py-3 bg-blue-600 text-white text-sm rounded-full font-bold hover:bg-blue-700 transition-all shadow-md active:scale-95">
              + 새 인연 추가
            </Link>
          )}
        </div>
      ) : (
        <div className="flex flex-col gap-4 mt-2">
          {persons.map(person => {
            const chasam = person.sajuData?.chasam;
            return (
              <Link
                key={person.id}
                href={'/person/' + person.id}
                className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col hover:shadow-md transition-shadow active:scale-[0.98]"
              >
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center text-lg font-bold shrink-0">
                      {person.name.charAt(0)}
                    </div>
                    <div className="overflow-hidden">
                      <h3 className="text-lg font-bold text-gray-900 truncate">{person.name}</h3>
                      <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
                        <span className="flex items-center gap-1 whitespace-nowrap"><Calendar className="w-3 h-3" /> {person.birthDate}</span>
                        {person.gender && (
                          <span className="px-1.5 py-0.5 rounded-sm bg-gray-100 font-medium shrink-0">
                            {person.gender === 'M' ? '남' : '여'}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-300 shrink-0" />
                </div>
                {chasam && (
                  <div className="mt-4 pt-3 border-t border-gray-50 grid grid-cols-6 gap-1">
                    <div className="flex flex-col items-center">
                      <span className="text-[9px] text-gray-400 mb-0.5">부허(본)</span>
                      <span className="text-xs font-medium text-gray-600 bg-gray-50 px-1 py-0.5 rounded w-full text-center tracking-widest">{chasam.buheojaBonwon || '-'}</span>
                    </div>
                    <div className="flex flex-col items-center">
                      <span className="text-[9px] text-gray-400 mb-0.5">부허(차)</span>
                      <span className="text-xs font-medium text-gray-600 bg-gray-50 px-1 py-0.5 rounded w-full text-center tracking-widest">{chasam.buheojaCharyeok || '-'}</span>
                    </div>
                    <div className="flex flex-col items-center">
                      <span className="text-[9px] font-bold text-indigo-400 mb-0.5">본원</span>
                      <span className="text-xs font-bold text-indigo-700 bg-indigo-50 px-1 py-0.5 rounded w-full text-center tracking-widest">{chasam.bonwon || '-'}</span>
                    </div>
                    <div className="flex flex-col items-center">
                      <span className="text-[9px] font-bold text-blue-400 mb-0.5">차력</span>
                      <span className="text-xs font-bold text-blue-700 bg-blue-50 px-1 py-0.5 rounded w-full text-center tracking-widest">{chasam.charyeok || '-'}</span>
                    </div>
                    <div className="flex flex-col items-center">
                      <span className="text-[9px] text-gray-400 mb-0.5">허자(본)</span>
                      <span className="text-xs font-medium text-gray-600 bg-gray-50 px-1 py-0.5 rounded w-full text-center tracking-widest">{chasam.heojaBonwon || '-'}</span>
                    </div>
                    <div className="flex flex-col items-center">
                      <span className="text-[9px] text-gray-400 mb-0.5">허자(차)</span>
                      <span className="text-xs font-medium text-gray-600 bg-gray-50 px-1 py-0.5 rounded w-full text-center tracking-widest">{chasam.heojaCharyeok || '-'}</span>
                    </div>
                  </div>
                )}
                {!chasam && person.sajuIlju && (
                   <div className="mt-4 pt-3 border-t border-gray-50 flex justify-end">
                      <div className="text-right">
                        <span className="text-[10px] text-gray-400 block mb-0.5">일주</span>
                        <span className="text-sm font-semibold text-gray-700 bg-gray-50 px-2 py-1 rounded-md">{person.sajuIlju}</span>
                      </div>
                   </div>
                )}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
