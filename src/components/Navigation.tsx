'use client';

import { Gift, Calendar, Heart } from 'lucide-react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';

export default function Navigation() {
  const pathname = usePathname();

  const navItems = [
    { href: '/', icon: Heart, label: 'Início' },
    { href: '/presentes', icon: Gift, label: 'Presentes' },
    { href: '/confirmacao', icon: Calendar, label: 'RSVP' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-50">
      <div className="flex justify-around items-center py-2 px-4 max-w-md mx-auto">
        {navItems.map(({ href, icon: Icon, label }) => {
          const isActive = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={`flex flex-col items-center py-2 px-3 rounded-lg transition-all duration-200 ${
                isActive
                  ? 'text-black bg-gray-100'
                  : 'text-gray-600 hover:text-black hover:bg-gray-50'
              }`}
            >
              <Icon size={20} />
              <span className="text-xs mt-1 font-medium">{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
