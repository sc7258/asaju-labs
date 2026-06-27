'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Settings, Menu as MenuIcon } from 'lucide-react';

export default function BottomNav() {
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const isHome = pathname === '/';
  const isSettings = pathname === '/settings';

  if (pathname === '/new') return null;

  return (
    <>
      <nav className="shrink-0 relative w-full bg-white/90 backdrop-blur-md border-t border-gray-100 z-40 shadow-[0_-4px_20px_-10px_rgba(0,0,0,0.05)] pb-safe">
        <div className="flex justify-around items-center h-16 px-2">
          <Link 
            href="/" 
            className={`flex flex-col items-center justify-center w-full h-full transition-all duration-200 ${isHome ? 'text-blue-600 scale-105' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-xl'}`}
          >
            <div className={`p-1.5 rounded-full ${isHome ? 'bg-blue-50' : ''}`}>
              <Home className="w-5 h-5 mb-0.5" strokeWidth={isHome ? 2.5 : 2} />
            </div>
            <span className={`text-[10px] ${isHome ? 'font-bold' : 'font-medium'}`}>홈</span>
          </Link>
          
          <Link 
            href="/settings" 
            className={`flex flex-col items-center justify-center w-full h-full transition-all duration-200 ${isSettings ? 'text-blue-600 scale-105' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-xl'}`}
          >
            <div className={`p-1.5 rounded-full ${isSettings ? 'bg-blue-50' : ''}`}>
              <Settings className="w-5 h-5 mb-0.5" strokeWidth={isSettings ? 2.5 : 2} />
            </div>
            <span className={`text-[10px] ${isSettings ? 'font-bold' : 'font-medium'}`}>설정</span>
          </Link>

          <button 
            onClick={() => setIsMenuOpen(true)}
            className="flex flex-col items-center justify-center w-full h-full text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-xl transition-all duration-200"
          >
            <div className="p-1.5 rounded-full">
              <MenuIcon className="w-5 h-5 mb-0.5" strokeWidth={2} />
            </div>
            <span className="text-[10px] font-medium">전체메뉴</span>
          </button>
        </div>
      </nav>

      {/* Bottom Sheet Menu */}
      {isMenuOpen && (
        <div className="absolute inset-0 z-50 flex flex-col justify-end overflow-hidden">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity" 
            onClick={() => setIsMenuOpen(false)}
          />
          
          {/* Sheet */}
          <div className="relative bg-white rounded-t-3xl shadow-2xl p-6 min-h-[45vh] flex flex-col animate-in slide-in-from-bottom-full duration-300 ease-out">
            <div className="w-12 h-1.5 bg-gray-200 rounded-full mx-auto mb-8" />
            
            <h2 className="text-xl font-bold text-gray-900 mb-6 px-2">전체 메뉴</h2>
            
            <div className="flex-1 px-2 space-y-4">
              <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                <p className="text-sm text-gray-500 font-medium leading-relaxed">
                  이곳에 다양한 확장 기능이나<br/>추가 메뉴들을 배치할 수 있습니다.
                </p>
              </div>
              {/* Add more menu items here later */}
            </div>
            
            <button 
              onClick={() => setIsMenuOpen(false)}
              className="mt-auto w-full py-4 bg-gray-100 text-gray-700 font-bold rounded-2xl hover:bg-gray-200 active:scale-[0.98] transition-all"
            >
              닫기
            </button>
          </div>
        </div>
      )}
    </>
  );
}
