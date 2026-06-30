'use client';

import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/lib/db';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, Trash2, Calendar, User as UserIcon, AlignLeft, ExternalLink, Pencil } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { getChasamManselyeokPageState, type ChasamManselyeokPageState } from '@repo/saju-core';
import { ChasamManselyeokChartClient } from '@repo/ui/chasam-manselyeok-chart-client';

export default function PersonDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const person = useLiveQuery(() => db.persons.get(id), [id]);

  const [chasamState, setChasamState] = useState<ChasamManselyeokPageState | null>(null);

  useEffect(() => {
    if (!person) return;
    
    const fetchState = async () => {
      const dateStr = person.birthDate.replace(/-/g, '');
      const timeStr = person.birthTime ? person.birthTime.replace(':', '') : '';
      
      try {
        const state = await getChasamManselyeokPageState({
          year: dateStr.slice(0, 4),
          month: dateStr.slice(4, 6),
          day: dateStr.slice(6, 8),
          hour: timeStr ? timeStr.slice(0, 2) : undefined,
          minute: timeStr ? timeStr.slice(2, 4) : undefined,
          gender: person.gender === 'M' ? 'male' : 'female',
          calendarType: person.isLunar ? (person.isLeapMonth ? 'lunar-leap' : 'lunar') : 'solar',
          name: person.name,
        });
        setChasamState(state);
      } catch (e) {
        console.error('Failed to fetch chasam state:', e);
      }
    };

    fetchState();
  }, [person]);

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
        <div className="flex items-center gap-1">
          <Link
            href={`/person/${id}/edit`}
            className="p-2 text-blue-500 hover:bg-blue-50 rounded-full transition-colors"
          >
            <Pencil className="w-5 h-5" />
          </Link>
          <button
            onClick={handleDelete}
            className="p-2 text-red-500 hover:bg-red-50 rounded-full transition-colors"
          >
            <Trash2 className="w-5 h-5" />
          </button>
        </div>
      </header>

      <main className="p-5 flex flex-col gap-6 flex-1 max-w-2xl mx-auto w-full">
        {/* 🎯 차샘 6차원 명식 판 (독립 컴포넌트) */}
        {chasamState ? (
          <ChasamManselyeokChartClient 
            panels={chasamState.panels}
            inputBirthText={chasamState.input.birthText}
            useDraftSnapshot={false}
          />
        ) : (
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 text-center text-gray-400 text-sm animate-pulse">
            사주 차트를 불러오는 중...
          </div>
        )}

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
