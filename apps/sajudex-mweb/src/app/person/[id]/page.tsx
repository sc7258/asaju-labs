'use client';

import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/lib/db';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, Trash2, Calendar, User as UserIcon, AlignLeft, ExternalLink } from 'lucide-react';
import Link from 'next/link';

export default function PersonDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const person = useLiveQuery(() => db.persons.get(id), [id]);

  const handleDelete = async () => {
    if (confirm('정말로 삭제하시겠습니까?')) {
      await db.persons.delete(id);
      router.push('/');
      router.refresh();
    }
  };

  if (person === undefined) {
    return <div className="p-6 text-center text-gray-500">불러오는 중...</div>;
  }

  if (person === null) {
    return (
      <div className="p-6 text-center flex flex-col items-center gap-4 py-24">
        <div className="text-4xl">😥</div>
        <p className="text-gray-500">인연 정보를 찾을 수 없습니다.</p>
        <Link href="/" className="text-blue-600 underline">목록으로 돌아가기</Link>
      </div>
    );
  }

  const chasam = person.sajuData?.chasam;

  // 🎯 사주큐브(Sajucube) 연동 URL 생성 로직
  const generateSajucubeUrl = () => {
    const gender = person.gender === 'M' ? 'male' : 'female';
    let calendarType = 'solar';
    if (person.isLunar) {
      calendarType = person.isLeapMonth ? 'lunar-leap' : 'lunar';
    }
    
    // birthDate (YYYY-MM-DD) -> YYYYMMDD
    const dateStr = person.birthDate.replace(/-/g, '');
    // birthTime (HH:mm) -> HHmm
    const timeStr = person.birthTime ? person.birthTime.replace(':', '') : '';
    const birthText = `${dateStr}${timeStr}`;

    const searchParams = new URLSearchParams({
      gender,
      calendarType,
      birthText,
      name: person.name
    });

    return `https://sajucube.vercel.app/?${searchParams.toString()}`;
  };

  return (
    <div className="flex flex-col min-h-[100dvh] bg-gray-50 pb-24">
      {/* Top App Bar */}
      <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-gray-200 px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/" className="p-2 -ml-2 rounded-full hover:bg-gray-100 transition-colors">
            <ArrowLeft className="w-5 h-5 text-gray-700" />
          </Link>
          <h1 className="text-lg font-bold text-gray-900">상세 정보</h1>
        </div>
        <button
          onClick={handleDelete}
          className="p-2 text-red-500 hover:bg-red-50 rounded-full transition-colors"
        >
          <Trash2 className="w-5 h-5" />
        </button>
      </header>

      <main className="p-5 flex flex-col gap-6 flex-1 max-w-2xl mx-auto w-full">
        {/* Profile Card */}
        <section className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-5">
          <div className="w-16 h-16 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-2xl font-bold shrink-0">  
            {person.name.charAt(0)}
          </div>
          <div className="overflow-hidden">
            <h2 className="text-2xl font-bold text-gray-900 truncate">{person.name}</h2>
            <div className="flex items-center gap-2 mt-2 text-sm text-gray-500">
              <span className="flex items-center gap-1"><Calendar className="w-4 h-4" /> {person.birthDate}</span>
              {person.gender && (
                <span className="flex items-center gap-1"><UserIcon className="w-4 h-4" /> {person.gender === 'M' ? '남성' : '여성'}</span>
              )}
            </div>
            {person.birthTime && (
              <p className="text-xs text-gray-400 mt-1">시간: {person.birthTime} ({person.isLunar ? (person.isLeapMonth ? '윤달' : '음력') : '양력'})</p>
            )}
          </div>
        </section>

        {/* 🎯 차샘 6차원 명식 판 */}
        <section className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
          <h3 className="text-sm font-semibold text-gray-500 mb-4 flex items-center justify-between">
            <span>요약 명식 (6판)</span>
          </h3>
          
          {chasam ? (
            <div className="grid grid-cols-2 gap-3 md:gap-4 text-center">
              {/* 1. 본원 */}
              <div className="bg-gradient-to-br from-indigo-50 to-white p-4 rounded-xl border border-indigo-100 shadow-sm flex flex-col justify-center">
                <span className="block text-xs font-bold text-indigo-400 mb-1">1. 본원</span>
                <span className="text-2xl font-bold text-gray-900 tracking-widest">{chasam.bonwon || '-'}</span>
              </div>
              
              {/* 2. 차력 */}
              <div className="bg-gradient-to-br from-blue-50 to-white p-4 rounded-xl border border-blue-100 shadow-sm flex flex-col justify-center">
                <span className="block text-xs font-bold text-blue-400 mb-1">2. 차력</span>
                <span className="text-2xl font-bold text-gray-900 tracking-widest">{chasam.charyeok || '-'}</span>
              </div>

              <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 flex flex-col justify-center">
                <span className="block text-[10px] text-gray-400 mb-1">3. 부허본차 (본원)</span>
                <span className="text-lg font-bold text-gray-700 tracking-wider">{chasam.buheojaBonwon || '-'}</span>
              </div>
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 flex flex-col justify-center">
                <span className="block text-[10px] text-gray-400 mb-1">4. 부허본차 (차력)</span>
                <span className="text-lg font-bold text-gray-700 tracking-wider">{chasam.buheojaCharyeok || '-'}</span>
              </div>
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 flex flex-col justify-center">
                <span className="block text-[10px] text-gray-400 mb-1">5. 허자본차 (본원)</span>
                <span className="text-lg font-bold text-gray-700 tracking-wider">{chasam.heojaBonwon || '-'}</span>
              </div>
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 flex flex-col justify-center">
                <span className="block text-[10px] text-gray-400 mb-1">6. 허자본차 (차력)</span>
                <span className="text-lg font-bold text-gray-700 tracking-wider">{chasam.heojaCharyeok || '-'}</span>
              </div>
            </div>
          ) : (
             <div className="text-center py-8 text-gray-400 text-sm">
                사주 명식 데이터가 없습니다.<br/>새로 추가해주세요.
             </div>
          )}

          {/* Seamless 연동 버튼 */}
          <div className="mt-5 pt-5 border-t border-gray-100">
            <a 
              href={generateSajucubeUrl()} 
              target="_blank" 
              rel="noopener noreferrer"
              className="w-full flex items-center justify-center gap-2 py-3.5 bg-gray-900 text-white rounded-xl font-bold text-sm hover:bg-gray-800 transition-colors shadow-md active:scale-[0.98]"
            >
              사주큐브 정밀 분석 열기 <ExternalLink className="w-4 h-4" />
            </a>
            <p className="text-[11px] text-center text-gray-400 leading-relaxed mt-3">
              클릭 시 사주큐브(Sajucube)로 이동하여<br/>대운/세운 등 상세 분석을 확인합니다.
            </p>
          </div>
        </section>

        {/* Memo */}
        {person.memo && (
          <section className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex-1">
            <h3 className="text-sm font-semibold text-gray-500 mb-3 flex items-center gap-2">
              <AlignLeft className="w-4 h-4" /> 메모
            </h3>
            <p className="text-gray-700 whitespace-pre-wrap text-sm leading-relaxed">
              {person.memo}
            </p>
          </section>
        )}
      </main>
    </div>
  );
}
