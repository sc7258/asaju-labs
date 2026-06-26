'use client';

import Link from 'next/link';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/lib/db';
import { User, Calendar, ChevronRight } from 'lucide-react';

export default function Home() {
  const persons = useLiveQuery(() => db.persons.orderBy('createdAt').reverse().toArray());

  return (
    <div className="p-6 pb-24">
      <header className="mb-6 mt-4 flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">내 인연록</h1>
          <p className="text-sm text-gray-500 mt-1">소중한 사람들의 명식과 메모를 기록하세요.</p>
        </div>
        {persons && persons.length > 0 && (
          <Link href="/new" className="p-2 bg-blue-100 text-blue-600 rounded-full hover:bg-blue-200 transition-colors">
            <User className="w-5 h-5" />
          </Link>
        )}
      </header>

      {persons === undefined ? (
        // Loading state
        <div className="animate-pulse flex flex-col gap-4 mt-8">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-24 bg-gray-100 rounded-2xl"></div>
          ))}
        </div>
      ) : persons.length === 0 ? (
        // Empty State Placeholder
        <div className="flex flex-col items-center justify-center py-24 bg-gray-50 rounded-2xl border border-dashed border-gray-300 mt-8">
          <div className="text-5xl mb-4 opacity-80">📇</div>
          <h3 className="text-base font-semibold text-gray-800">등록된 인연이 없습니다</h3>
          <p className="text-sm text-gray-500 mt-2 text-center px-6 leading-relaxed">
            아래 버튼을 눌러 새로운<br/>지인의 사주를 추가해보세요.
          </p>
          <Link href="/new" className="mt-8 px-6 py-3 bg-blue-600 text-white text-sm rounded-full font-bold hover:bg-blue-700 transition-all shadow-md active:scale-95">
            + 새 인연 추가
          </Link>
        </div>
      ) : (
        // List State
        <div className="flex flex-col gap-4 mt-4">
          {persons.map(person => (
            <Link 
              key={person.id} 
              href={`/person/${person.id}`}
              className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between hover:shadow-md transition-shadow"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center text-lg font-bold">
                  {person.name.charAt(0)}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">{person.name}</h3>
                  <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
                    <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {person.birthDate}</span>
                    {person.gender && (
                      <span className="px-1.5 py-0.5 rounded-sm bg-gray-100 font-medium">
                        {person.gender === 'M' ? '남' : '여'}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                {person.sajuIlju && (
                  <div className="text-right">
                    <span className="text-xs text-gray-400 block mb-0.5">일주</span>
                    <span className="text-sm font-semibold text-gray-700">{person.sajuIlju}</span>
                  </div>
                )}
                <ChevronRight className="w-5 h-5 text-gray-300" />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
