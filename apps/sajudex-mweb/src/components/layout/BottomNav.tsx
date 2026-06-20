import Link from 'next/link';
import { Calendar, Users, Settings } from 'lucide-react';

export default function BottomNav() {
  return (
    <nav className="absolute bottom-0 w-full bg-white border-t border-gray-200 z-50">
      <div className="flex justify-around items-center h-16">
        <Link href="/public" className="flex flex-col items-center justify-center w-full h-full text-gray-400 hover:text-gray-900 transition-colors">
          <Calendar className="w-5 h-5 mb-1" />
          <span className="text-[10px] font-medium">명식록</span>
        </Link>
        <Link href="/" className="flex flex-col items-center justify-center w-full h-full text-blue-600 transition-colors">
          <Users className="w-5 h-5 mb-1" />
          <span className="text-[10px] font-bold">인연록</span>
        </Link>
        <Link href="/settings" className="flex flex-col items-center justify-center w-full h-full text-gray-400 hover:text-gray-900 transition-colors">
          <Settings className="w-5 h-5 mb-1" />
          <span className="text-[10px] font-medium">설정</span>
        </Link>
      </div>
    </nav>
  );
}
