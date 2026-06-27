'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/lib/db';
import { Calendar, ChevronRight, Search, Plus, Heart } from 'lucide-react';

export default function Home() {
  const [searchQuery, setSearchQuery] = useState('');
  const [isAcquaintanceOnly, setIsAcquaintanceOnly] = useState(false);

  const persons = useLiveQuery(async () => {
    const allPersons = await db.persons.orderBy('createdAt').reverse().toArray();
    
    return allPersons.filter(person => {
      // TODO: Implement scope filtering based on actual db schema if '지인' vs '모두' is distinguished in the future.
      const matchesScope = true; // Later this will be influenced by `isAcquaintanceOnly` flag
      
      if (!matchesScope) return false;
      
      if (!searchQuery.trim()) return true;

      const lowerQuery = searchQuery.toLowerCase();
      
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
  }, [searchQuery, isAcquaintanceOnly]);

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Premium Header/Toolbar */}
      <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-gray-100 shadow-sm px-4 py-4">
        <div className="flex gap-2">
          {/* Search Bar */}
          <div className="relative flex-1">
            <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            <input 
              type="text" 
              placeholder="이름, 6판 명식(예: 병진), 메모 검색..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-12 py-3 bg-white border border-gray-200 rounded-xl text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all placeholder:text-gray-400"
            />
            {/* Acquaintance Toggle (Heart Icon) */}
            <button
              onClick={() => setIsAcquaintanceOnly(!isAcquaintanceOnly)}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-lg hover:bg-rose-50 transition-colors active:scale-90"
              title={isAcquaintanceOnly ? "지인만 보기 해제" : "지인만 보기"}
            >
              <Heart 
                className={`w-5 h-5 transition-all duration-300 ${
                  isAcquaintanceOnly 
                    ? 'text-pink-500 fill-pink-500 scale-110' 
                    : 'text-gray-300 hover:text-pink-300'
                }`} 
              />
            </button>
          </div>

          {/* Add Button */}
          <Link 
            href="/new" 
            className="flex-shrink-0 bg-blue-600 text-white w-[46px] h-[46px] rounded-xl flex items-center justify-center hover:bg-blue-700 hover:shadow-lg hover:-translate-y-0.5 active:scale-95 transition-all shadow-md shadow-blue-600/20"
          >
            <Plus className="w-6 h-6" />
          </Link>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="px-4 mt-6">
        {persons === undefined ? (
          // Loading state
          <div className="animate-pulse flex flex-col gap-4 mt-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-24 bg-gray-200/50 rounded-2xl"></div>
            ))}
          </div>
        ) : persons.length === 0 ? (
          // Empty State
          <div className="flex flex-col items-center justify-center py-20 mt-8 bg-white rounded-3xl border border-gray-100 shadow-sm text-center">
            <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mb-6">
              <Search className="w-8 h-8 text-blue-300" />
            </div>
            <h3 className="text-lg font-bold text-gray-800 mb-2">
              {searchQuery ? '검색 결과가 없습니다' : '등록된 인연이 없습니다'}
            </h3>
            <p className="text-sm text-gray-500 max-w-[200px] leading-relaxed">
              {searchQuery ? '다른 검색어를 입력해보세요.' : '우측 상단의 + 버튼을 눌러 새로운 인연을 추가해보세요.'}
            </p>
          </div>
        ) : (
          // List State
          <div className="flex flex-col gap-3">
            {persons.map(person => {
              const chasam = person.sajuData?.chasam;
              return (
                <Link 
                  key={person.id} 
                  href={`/person/${person.id}`}
                  className="group bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col hover:shadow-md hover:border-blue-100 transition-all"
                >
                  <div className="flex items-center justify-between w-full">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 text-white flex items-center justify-center text-xl font-bold shadow-sm shadow-blue-500/20 shrink-0">
                        {person.name.charAt(0)}
                      </div>
                      <div className="overflow-hidden">
                        <h3 className="text-lg font-bold text-gray-900 group-hover:text-blue-600 transition-colors truncate">{person.name}</h3>
                        <div className="flex items-center gap-2 mt-1.5 text-xs text-gray-500 font-medium">
                          <span className="flex items-center gap-1.5 bg-gray-50 px-2 py-1 rounded-md border border-gray-100 whitespace-nowrap">
                            <Calendar className="w-3.5 h-3.5 text-gray-400" /> {person.birthDate}
                          </span>
                          {person.gender && (
                            <span className={`px-2 py-1 rounded-md border shrink-0 ${person.gender === 'M' ? 'bg-blue-50 border-blue-100 text-blue-600' : 'bg-rose-50 border-rose-100 text-rose-600'}`}>
                              {person.gender === 'M' ? '남' : '여'}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    {!chasam && person.sajuIlju && (
                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">일주</span>
                          <span className="text-sm font-black text-gray-800 bg-gray-50 px-2 py-1 rounded-md">{person.sajuIlju}</span>
                        </div>
                        <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-blue-500 transition-colors group-hover:translate-x-1 shrink-0" />
                      </div>
                    )}
                    {(chasam || !person.sajuIlju) && (
                       <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-blue-500 transition-colors group-hover:translate-x-1 shrink-0 ml-auto" />
                    )}
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
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
