'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, Save, User, CalendarDays, AlignLeft, Info } from 'lucide-react';
import Link from 'next/link';
import { db } from '@/lib/db';
import { getChasamManselyeokPageState, calculateSajuCode } from '@repo/saju-core';
import { useLiveQuery } from 'dexie-react-hooks';

function formatBirthInput(value: string) {
  const digits = value.replace(/\D/g, '').slice(0, 12);
  let formatted = '';

  if (digits.length > 0) formatted += digits.slice(0, 4);
  if (digits.length > 4) formatted += '-' + digits.slice(4, 6);
  if (digits.length > 6) formatted += '-' + digits.slice(6, 8);
  if (digits.length > 8) formatted += ' ' + digits.slice(8, 10);
  if (digits.length > 10) formatted += ':' + digits.slice(10, 12);

  return formatted;
}

export default function EditConnectionPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const person = useLiveQuery(() => db.persons.get(id), [id]);

  const [name, setName] = useState('');
  const [birthInput, setBirthInput] = useState('');
  const [isLunar, setIsLunar] = useState(false);
  const [isLeapMonth, setIsLeapMonth] = useState(false);
  const [gender, setGender] = useState<'M' | 'F'>('M');
  const [memo, setMemo] = useState('');

  const [isSaving, setIsSaving] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    if (person && !isLoaded) {
      setName(person.name);
      const bDate = person.birthDate.replace(/-/g, '');
      const bTime = person.birthTime ? person.birthTime.replace(':', '') : '';
      setBirthInput(formatBirthInput(bDate + bTime));
      setIsLunar(person.isLunar || false);
      setIsLeapMonth(person.isLeapMonth || false);
      setGender(person.gender || 'M');
      setMemo(person.memo || '');
      setIsLoaded(true);
    }
  }, [person, isLoaded]);

  const handleBirthInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatBirthInput(e.target.value);
    setBirthInput(formatted);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || birthInput.length < 10) {
      alert('이름과 생년월일(8자리)은 필수입니다.');
      return;
    }
    if (!gender) {
      alert('사주 명식 계산을 위해 성별을 선택해주세요.');
      return;
    }

    setIsSaving(true);
    try {
      const digits = birthInput.replace(/\D/g, '');
      const yearStr = digits.slice(0,4);
      const monthStr = digits.slice(4,6);
      const dayStr = digits.slice(6,8);
      const hourStr = digits.length >= 10 ? digits.slice(8,10) : undefined;
      const minuteStr = digits.length >= 12 ? digits.slice(10,12) : undefined;

      const birthDate = `${yearStr}-${monthStr}-${dayStr}`;
      const birthTime = hourStr ? `${hourStr}:${minuteStr || '00'}` : undefined;

      const chasamState = await getChasamManselyeokPageState({
        year: yearStr,
        month: monthStr,
        day: dayStr,
        hour: hourStr,
        minute: minuteStr,
        gender: gender === 'M' ? 'male' : 'female',
        calendarType: isLunar ? (isLeapMonth ? 'lunar-leap' : 'lunar') : 'solar',
      });

      let sajuIlju = '';
      let sajuWolju = '';
      let chasamData: any = null;
      let ids: any = {};

      if (chasamState.panels && chasamState.panels.length > 0) {
        const getPillarStr = (key: string, type: 'day'|'month') => {
           const panel = chasamState.panels?.find(p => p.key === key);
           const pillar = panel?.viewModel.pillars.find(p => p.key === type);
           return pillar ? `${pillar.stem}${pillar.branch}` : '';
        };

        const getPillarId = (key: string) => {
           const panel = chasamState.panels?.find(p => p.key === key);
           const y = panel?.viewModel.pillars.find(p => p.key === 'year');
           const m = panel?.viewModel.pillars.find(p => p.key === 'month');
           const d = panel?.viewModel.pillars.find(p => p.key === 'day');
           if (y && m && d) {
             try {
               return calculateSajuCode(y.stem+y.branch, m.stem+m.branch, d.stem+d.branch);
             } catch (e) {
               return undefined;
             }
           }
           return undefined;
        };

        sajuIlju = getPillarStr('bonwon', 'day');
        sajuWolju = getPillarStr('bonwon', 'month');

        chasamData = {
          buheojaBonwon: getPillarStr('buheoja-bonwon', 'day'),
          buheojaCharyeok: getPillarStr('buheoja-charyeok', 'day'),
          bonwon: getPillarStr('bonwon', 'day'),
          charyeok: getPillarStr('charyeok', 'day'),
          heojaBonwon: getPillarStr('heoja-bonwon', 'day'),
          heojaCharyeok: getPillarStr('heoja-charyeok', 'day'),
        };

        ids = {
          bonwonCode: getPillarId('bonwon'),
          charyeokCode: getPillarId('charyeok'),
          buheojaBonwonCode: getPillarId('buheoja-bonwon'),
          buheojaCharyeokCode: getPillarId('buheoja-charyeok'),
          heojaBonwonCode: getPillarId('heoja-bonwon'),
          heojaCharyeokCode: getPillarId('heoja-charyeok'),
        };

      } else if (chasamState.errors.length > 0) {
        alert('사주 계산 오류: ' + chasamState.errors.join(', '));
        setIsSaving(false);
        return;
      }

      await db.persons.update(id, {
        name,
        birthDate,
        birthTime,
        isLunar,
        isLeapMonth,
        gender: gender as 'M'|'F',
        sajuIlju,
        sajuWolju,
        sajuData: { chasam: chasamData },
        ...ids,
        memo,
        updatedAt: new Date()
      });

      router.push(`/person/${id}`);
      router.refresh();
    } catch (error) {
      console.error('Failed to update connection:', error);
      alert('저장 중 오류가 발생했습니다.');
    } finally {
      setIsSaving(false);
    }
  };

  if (person === undefined || !isLoaded) {
    return <div className="p-6 text-center text-gray-500">불러오는 중...</div>;
  }

  if (person === null) {
    return <div className="p-6 text-center text-gray-500">인연 정보를 찾을 수 없습니다.</div>;
  }

  return (
    <div className="flex flex-col min-h-[100dvh] bg-[#F8FAFC] pb-24 max-w-2xl mx-auto">
      <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-gray-100/80 px-4 py-4 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <Link href={`/person/${id}`} className="p-2 -ml-2 rounded-full hover:bg-gray-100 transition-colors">
            <ArrowLeft className="w-5 h-5 text-gray-700" />
          </Link>
          <h1 className="text-lg font-bold text-gray-900 tracking-tight">인연 정보 수정</h1>
        </div>

      </header>

      <main className="p-5 flex flex-col gap-6 flex-1">
        {/* Options Section */}
        <section className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100/80 flex flex-col gap-5">
          {/* Calendar Type Segmented Control */}
          <div className="flex items-center justify-between">
            <span className="text-sm font-bold text-gray-700">양력 / 음력</span>
            <div className="flex bg-gray-100/80 rounded-xl p-1 shadow-inner">
              <button
                type="button"
                onClick={() => setIsLunar(false)}
                className={`px-5 py-2 rounded-lg text-sm font-bold transition-all ${!isLunar ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
              >
                양력
              </button>
              <button
                type="button"
                onClick={() => setIsLunar(true)}
                className={`px-5 py-2 rounded-lg text-sm font-bold transition-all ${isLunar ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
              >
                음력
              </button>
            </div>
          </div>

          {isLunar && (
            <div className="flex items-center justify-between pt-4 border-t border-gray-50">
              <span className="text-sm font-bold text-gray-700">윤달 여부</span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" checked={isLeapMonth} onChange={(e) => setIsLeapMonth(e.target.checked)} />
                <div className="w-12 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600 shadow-inner"></div>
              </label>
            </div>
          )}

          {/* Gender Segmented Control */}
          <div className="flex items-center justify-between pt-4 border-t border-gray-50">
            <span className="text-sm font-bold text-gray-700">성별 (필수)</span>
            <div className="flex bg-gray-100/80 rounded-xl p-1 shadow-inner">
              <button
                type="button"
                onClick={() => setGender('M')}
                className={`px-5 py-2 rounded-lg text-sm font-bold transition-all ${gender === 'M' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
              >
                남성
              </button>
              <button
                type="button"
                onClick={() => setGender('F')}
                className={`px-5 py-2 rounded-lg text-sm font-bold transition-all ${gender === 'F' ? 'bg-white text-rose-500 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
              >
                여성
              </button>
            </div>
          </div>
        </section>

        {/* Name & Birth Input Section */}
        <section className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100/80 flex flex-col gap-6">
          {/* Name Input */}
          <div>
            <label className="flex items-center gap-1.5 text-xs font-bold text-gray-500 mb-2.5">
              <User className="w-3.5 h-3.5" /> 이름 (필수)
            </label>
            <div className="relative">
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="예: 홍길동, 김대리"
                className="w-full px-4 py-3.5 bg-gray-50/50 border border-gray-200 rounded-2xl text-base font-bold text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-inner"
              />
            </div>
          </div>

          {/* Birth Input */}
          <div>
            <label className="flex items-center gap-1.5 text-xs font-bold text-gray-500 mb-2.5">
              <CalendarDays className="w-3.5 h-3.5" /> 생년월일 및 시간 (필수)
            </label>
            <div className="relative">
              <input
                type="tel"
                value={birthInput}
                onChange={handleBirthInputChange}
                placeholder="197201261130 (연속 숫자 입력)"
                className="w-full px-4 py-3.5 bg-gray-50/50 border border-gray-200 rounded-2xl text-base font-bold text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-inner tracking-widest"
              />
            </div>
            <div className="flex items-start gap-1.5 mt-2.5 text-[11px] text-gray-400 leading-relaxed font-medium">
              <Info className="w-3.5 h-3.5 mt-0.5 shrink-0" />
              <p>시간을 모를 경우 8자리(YYYYMMDD)만 입력하셔도 사주가 계산됩니다.</p>
            </div>
          </div>
        </section>

        {/* Memo Section */}
        <section className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100/80 flex flex-col flex-1 min-h-[220px]">
          <label className="flex items-center gap-1.5 text-xs font-bold text-gray-500 mb-3">
            <AlignLeft className="w-3.5 h-3.5" /> 메모 및 특이사항
          </label>  
          <textarea
            value={memo}
            onChange={(e) => setMemo(e.target.value)}
            placeholder="연락처, 직업 등 특이사항을 기록하세요.&#13;&#10;&#13;&#10;💡 꿀팁: 해시태그(#가족, #회사동료)를 적어두면 예쁜 뱃지가 생기고 검색도 편해집니다."
            className="w-full flex-1 px-4 py-4 bg-gray-50/50 border border-gray-200 rounded-2xl text-sm font-medium text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-inner resize-none leading-relaxed"
          ></textarea>
        </section>

        {/* Save Button */}
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="w-full flex items-center justify-center gap-2 px-5 py-4 mt-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl text-base font-bold hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 transition-all shadow-md shadow-blue-500/20 active:scale-95"
        >
          <Save className="w-5 h-5" />
          {isSaving ? '저장중..' : '수정 완료하기'}
        </button>
      </main>
    </div>
  );
}
