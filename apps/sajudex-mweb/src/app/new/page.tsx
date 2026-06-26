'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save } from 'lucide-react';
import Link from 'next/link';
import { db } from '@/lib/db';
import { uuidv7 } from 'uuidv7';
import { getChasamManselyeokPageState, calculateMasterSajuId } from '@repo/saju-core';

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

export default function NewConnectionPage() {
  const router = useRouter();

  const [name, setName] = useState('');
  const [birthInput, setBirthInput] = useState('');
  const [isLunar, setIsLunar] = useState(false);
  const [isLeapMonth, setIsLeapMonth] = useState(false);
  const [gender, setGender] = useState<'M' | 'F'>('M');
  const [memo, setMemo] = useState('');

  const [isSaving, setIsSaving] = useState(false);

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
               return calculateMasterSajuId(y.stem+y.branch, m.stem+m.branch, d.stem+d.branch);
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
          bonwonId: getPillarId('bonwon'),
          charyeokId: getPillarId('charyeok'),
          buheojaBonwonId: getPillarId('buheoja-bonwon'),
          buheojaCharyeokId: getPillarId('buheoja-charyeok'),
          heojaBonwonId: getPillarId('heoja-bonwon'),
          heojaCharyeokId: getPillarId('heoja-charyeok'),
        };

      } else if (chasamState.errors.length > 0) {
        alert('사주 계산 오류: ' + chasamState.errors.join(', '));
        setIsSaving(false);
        return;
      }

      await db.persons.add({
        id: uuidv7(),
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
        createdAt: new Date(),
        updatedAt: new Date()
      });

      router.push('/');
      router.refresh();
    } catch (error) {
      console.error('Failed to save connection:', error);
      alert('저장 중 오류가 발생했습니다.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex flex-col min-h-[100dvh] bg-gray-50 pb-24 max-w-2xl mx-auto">
      <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-gray-200 px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/" className="p-2 -ml-2 rounded-full hover:bg-gray-100 transition-colors">
            <ArrowLeft className="w-5 h-5 text-gray-700" />
          </Link>
          <h1 className="text-lg font-bold text-gray-900">새 인연 추가</h1>
        </div>
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white rounded-full text-sm font-semibold hover:bg-blue-700 disabled:opacity-50 transition-colors shadow-sm"
        >
          <Save className="w-4 h-4" />
          {isSaving ? '저장중..' : '저장'}
        </button>
      </header>

      <main className="p-5 flex flex-col gap-6 flex-1">
        <section className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex flex-col gap-5">
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">이름 (필수)</label>      
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="예: 홍길동, 김대리"
              className="w-full text-lg border-b-2 border-gray-200 focus:border-blue-600 outline-none pb-2 bg-transparent transition-colors placeholder:text-gray-300 font-medium"
              autoFocus
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">생년월일 및 시간 (필수)</label>
            <input
              type="tel"
              value={birthInput}
              onChange={handleBirthInputChange}
              placeholder="197201261130 (연속 숫자 입력)"
              className="w-full text-lg border-b-2 border-gray-200 focus:border-blue-600 outline-none pb-2 bg-transparent transition-colors placeholder:text-gray-300 font-medium tracking-wide"
            />
            <p className="text-xs text-gray-400 mt-2">시간을 모를 경우 8자리(YYYYMMDD)만 입력하세요.</p>
          </div>
        </section>

        <section className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex flex-col gap-5">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">양력 / 음력</span>
            <div className="flex bg-gray-100 rounded-lg p-1">
              <button
                type="button"
                onClick={() => setIsLunar(false)}
                className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${!isLunar ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500'}`}
              >
                양력
              </button>
              <button
                type="button"
                onClick={() => setIsLunar(true)}
                className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${isLunar ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500'}`}
              >
                음력
              </button>
            </div>
          </div>

          {isLunar && (
            <div className="flex items-center justify-between pt-2 border-t border-gray-50">
              <span className="text-sm font-medium text-gray-700">윤달 여부</span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" checked={isLeapMonth} onChange={(e) => setIsLeapMonth(e.target.checked)} />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
          )}

          <div className="flex items-center justify-between pt-2 border-t border-gray-50">
            <span className="text-sm font-medium text-gray-700">성별 (필수)</span>
            <div className="flex bg-gray-100 rounded-lg p-1">
              <button
                type="button"
                onClick={() => setGender('M')}
                className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${gender === 'M' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500'}`}
              >
                남성
              </button>
              <button
                type="button"
                onClick={() => setGender('F')}
                className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${gender === 'F' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500'}`}
              >
                여성
              </button>
            </div>
          </div>
        </section>

        <section className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex flex-col h-48">
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">메모 및 특이사항</label>  
          <textarea
            value={memo}
            onChange={(e) => setMemo(e.target.value)}
            placeholder="연락처, 직업, 인물과의 관계나 특이사항을 자유롭게 기록하세요."
            className="w-full flex-1 resize-none bg-transparent outline-none text-sm text-gray-800 placeholder:text-gray-300 leading-relaxed"
          ></textarea>
        </section>
      </main>
    </div>
  );
}
