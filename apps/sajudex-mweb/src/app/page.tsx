import Link from 'next/link';

export default function Home() {
  return (
    <div className="p-6">
      <header className="mb-8 mt-4">
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">내 인연록</h1>
        <p className="text-sm text-gray-500 mt-1">소중한 사람들의 명식과 메모를 기록하세요.</p>
      </header>

      {/* Empty State Placeholder */}
      <div className="flex flex-col items-center justify-center py-24 bg-gray-50 rounded-2xl border border-dashed border-gray-300">
        <div className="text-5xl mb-4 opacity-80">📇</div>
        <h3 className="text-base font-semibold text-gray-800">등록된 인연이 없습니다</h3>
        <p className="text-sm text-gray-500 mt-2 text-center px-6 leading-relaxed">
          아래 버튼을 눌러 새로운<br/>지인의 사주를 추가해보세요.
        </p>
        <Link href="/new" className="mt-8 px-6 py-3 bg-blue-600 text-white text-sm rounded-full font-bold hover:bg-blue-700 transition-all shadow-md active:scale-95">
          + 새 인연 추가
        </Link>
      </div>
    </div>
  );
}
