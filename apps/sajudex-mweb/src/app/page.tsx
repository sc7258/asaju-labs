'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/lib/db';
import { Calendar, ChevronRight, Search, UserPlus, Heart, Sun, Moon } from 'lucide-react';

const extractHashtags = (memo?: string): string[] => {
  if (!memo) return [];
  const matches = memo.match(/#[^\s#]+/g);
  return matches ? Array.from(new Set(matches)) : [];
};

const getOhaengColor = (char: string) => {
  if (['갑', '을', '인', '묘', '甲', '乙', '寅', '卯'].includes(char)) return 'text-[#62b388]';
  if (['병', '정', '사', '오', '丙', '丁', '巳', '午'].includes(char)) return 'text-[#d65779]';
  if (['무', '기', '진', '술', '축', '미', '戊', '己', '辰', '戌', '丑', '未'].includes(char)) return 'text-[#d4a83f]';
  if (['경', '신', '유', '庚', '辛', '申', '酉'].includes(char)) return 'text-[#67718e]';
  if (['임', '계', '해', '자', '壬', '癸', '亥', '子'].includes(char)) return 'text-[#5e6785]';
  return 'text-gray-400';
};

const getAvatarTheme = (char?: string) => {
  if (!char) return 'bg-[#f5f2ee] text-[#8f8b86] border border-[#cdc4ba]';
  if (['갑', '을', '인', '묘', '甲', '乙', '寅', '卯'].includes(char)) return 'bg-[#93d5b1] text-white border border-[#7dc79f]';
  if (['병', '정', '사', '오', '丙', '丁', '巳', '午'].includes(char)) return 'bg-[#e66d8f] text-white border border-[#da5f82]';
  if (['무', '기', '진', '술', '축', '미', '戊', '己', '辰', '戌', '丑', '未'].includes(char)) return 'bg-[#f0c969] text-white border border-[#e2bb57]';
  if (['경', '신', '유', '庚', '辛', '申', '酉'].includes(char)) return 'bg-[#fbfdff] text-[#67718e] border border-[#afc9f2]';
  if (['임', '계', '해', '자', '壬', '癸', '亥', '子'].includes(char)) return 'bg-[#6d7591] text-white border border-[#5e6785]';
  return 'bg-[#f5f2ee] text-[#8f8b86] border border-[#cdc4ba]';
};

const SajuText = ({ text }: { text: string }) => {
  if (!text || text === '-') return <span>{text}</span>;
  return (
    <>
      {text.split('').map((char, i) => (
        <span key={i} className={getOhaengColor(char)}>{char}</span>
      ))}
    </>
  );
};

export default function Home() {
  const [searchQuery, setSearchQuery] = useState('');
  const [isAcquaintanceOnly, setIsAcquaintanceOnly] = useState(true);

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
    <div className="min-h-screen bg-[#F8FAFC] pb-24">
      {/* Premium Header/Toolbar */}
      <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-xl border-b border-gray-100/80 shadow-sm px-4 py-4">
        <div className="flex gap-2.5">
          {/* Search Bar */}
          <div className="relative flex-1">
            <Search className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            <input 
              type="text" 
              placeholder="이름, 일주, #해시태그 검색..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-12 py-3.5 bg-gray-50/50 border border-gray-200 rounded-2xl text-sm font-medium shadow-inner focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-gray-400"
            />
            {/* Acquaintance Toggle (Heart Icon) */}
            <button
              onClick={() => setIsAcquaintanceOnly(!isAcquaintanceOnly)}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-xl hover:bg-[#fcf0f3] transition-colors active:scale-90"
              title={isAcquaintanceOnly ? "지인만 보기 해제" : "지인만 보기"}
            >
              <Heart 
                className={`w-5 h-5 transition-all duration-300 ${
                  isAcquaintanceOnly 
                    ? 'text-[#e66d8f] fill-[#e66d8f] scale-110 drop-shadow-sm' 
                    : 'text-gray-300 hover:text-[#e7849d]'
                }`} 
              />
            </button>
          </div>

          {/* Add Button */}
          <Link 
            href="/new" 
            className="flex-shrink-0 bg-[#6d7591] border border-[#5e6785] text-white w-[50px] h-[50px] rounded-2xl flex items-center justify-center hover:bg-[#5e6785] hover:shadow-lg hover:-translate-y-0.5 active:scale-95 transition-all shadow-md shadow-[#6d7591]/20"
          >
            <UserPlus className="w-[22px] h-[22px] ml-0.5" />
          </Link>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="px-4 mt-6">
        {persons === undefined ? (
          // Loading state
          <div className="animate-pulse flex flex-col gap-4 mt-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-20 bg-gray-200/50 rounded-2xl"></div>
            ))}
          </div>
        ) : persons.length === 0 ? (
          // Empty State
          <div className="flex flex-col items-center justify-center py-20 mt-4 bg-white rounded-3xl border border-gray-100/80 shadow-sm text-center">
            <div className="w-20 h-20 bg-blue-50/80 rounded-full flex items-center justify-center mb-6 shadow-inner">
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
          <div className="flex flex-col gap-2.5">
            {persons.map(person => {
              const chasam = person.sajuData?.chasam;
              const tags = extractHashtags(person.memo);
              const bonwonStem = chasam?.bonwon?.[0] || person.sajuIlju?.[0];
              const avatarTheme = getAvatarTheme(bonwonStem);
              
              return (
                <Link 
                  key={person.id} 
                  href={`/person/${person.id}`}
                  className="group bg-white p-3.5 rounded-2xl shadow-sm border border-gray-100/80 flex flex-col hover:shadow-md hover:border-blue-200/50 transition-all"
                >
                  <div className="flex items-center justify-between w-full gap-3">
                    <div className="flex items-center gap-3 overflow-hidden">
                      <div className={`w-11 h-11 rounded-full flex items-center justify-center text-base font-bold shadow-sm shrink-0 ${avatarTheme}`}>
                        {person.name.charAt(0)}
                      </div>
                      <div className="flex flex-col justify-center overflow-hidden">
                        <div className="flex items-center gap-2">
                          <div className="flex items-baseline gap-1.5 shrink-0">
                            <h3 className="text-base font-bold text-gray-900 group-hover:text-blue-600 transition-colors truncate">{person.name}</h3>
                            <div className="flex items-center gap-1 shrink-0">
                              {person.gender === 'M' && <span className="text-blue-500 font-bold text-[12px] leading-none mb-[1px]">♂</span>}
                              {person.gender === 'F' && <span className="text-rose-500 font-bold text-[12px] leading-none mb-[1px]">♀</span>}
                              <span className="flex items-center gap-1 text-[10px] font-medium text-gray-400 tracking-wide">
                                {person.birthDate && (
                                  <>
                                    {person.isLunar ? (
                                      <Moon className={`w-3 h-3 ${person.isLeapMonth ? 'text-slate-400 fill-slate-200 drop-shadow-sm' : 'text-indigo-400 fill-indigo-100'}`} />
                                    ) : (
                                      <Sun className="w-3 h-3 text-amber-500 fill-amber-100" />
                                    )}
                                    <span>{person.birthDate}{person.birthTime ? ` ${person.birthTime}` : ''}</span>
                                  </>
                                )}
                              </span>
                            </div>
                          </div>
                          {tags.length > 0 && (
                            <div className="flex gap-1 flex-wrap shrink-0">
                              {tags.slice(0, 2).map(tag => (
                                <span key={tag} className="text-[10px] text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded-full border border-blue-100/50">
                                  {tag}
                                </span>
                              ))}
                              {tags.length > 2 && <span className="text-[10px] text-gray-400">+{tags.length - 2}</span>}
                            </div>
                          )}
                        </div>
                        
                        {/* 6판 명식 뱃지 (첫째 열 바로 아래 배치) */}
                        {chasam && (
                          <div className="flex items-center gap-0.5 mt-1 overflow-x-auto no-scrollbar pb-1">
                            {/* 부허 */}
                            <span className="whitespace-nowrap flex-shrink-0 text-[9px] px-1 py-0.5 border border-slate-200 bg-slate-50 rounded shadow-sm opacity-75"><SajuText text={chasam.buheojaBonwon || '-'} /></span>
                            <span className="whitespace-nowrap flex-shrink-0 text-[9px] px-1 py-0.5 border border-slate-200 bg-slate-50 rounded shadow-sm opacity-75"><SajuText text={chasam.buheojaCharyeok || '-'} /></span>
                            
                            {/* 본원 / 차력 */}
                            <span className="whitespace-nowrap flex-shrink-0 text-[10px] font-black px-1.5 py-0.5 border border-slate-200 bg-white rounded shadow-sm text-gray-800"><SajuText text={chasam.bonwon || '-'} /></span>
                            <span className="whitespace-nowrap flex-shrink-0 text-[10px] font-black px-1.5 py-0.5 border border-slate-200 bg-white rounded shadow-sm text-gray-800"><SajuText text={chasam.charyeok || '-'} /></span>

                            {/* 허자 */}
                            <span className="whitespace-nowrap flex-shrink-0 text-[9px] px-1 py-0.5 border border-dashed border-slate-300 bg-slate-50 rounded shadow-sm opacity-75"><SajuText text={chasam.heojaBonwon || '-'} /></span>
                            <span className="whitespace-nowrap flex-shrink-0 text-[9px] px-1 py-0.5 border border-dashed border-slate-300 bg-slate-50 rounded shadow-sm opacity-75"><SajuText text={chasam.heojaCharyeok || '-'} /></span>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {!chasam && person.sajuIlju && (
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-sm font-black bg-white px-2.5 py-1 rounded-full border border-slate-200 shadow-sm"><SajuText text={person.sajuIlju} /></span>
                        <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-blue-500 transition-colors group-hover:translate-x-1" />
                      </div>
                    )}
                    {(chasam || !person.sajuIlju) && (
                       <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-blue-500 transition-colors group-hover:translate-x-1 shrink-0 ml-auto" />
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
