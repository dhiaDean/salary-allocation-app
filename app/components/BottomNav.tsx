
import React, { useState } from 'react';

type NavItem = {
  label: string;
  icon: string;
};

const navItems: NavItem[] = [
  { label: 'Home', icon: 'home' },
  { label: 'Vault', icon: 'savings' },
  { label: 'Trends', icon: 'monitoring' },
  { label: 'Settings', icon: 'settings' },
];

const BottomNav: React.FC = () => {
  const [activeItem, setActiveItem] = useState('Home');

  return (
    <nav className="fixed bottom-0 left-0 right-0 w-full max-w-md mx-auto h-24 bg-brand-dark/80 backdrop-blur-lg border-t border-white/10 px-4">
      <div className="flex justify-around items-center h-full">
        {navItems.map((item) => (
          <button
            key={item.label}
            onClick={() => setActiveItem(item.label)}
            className={`flex flex-col items-center gap-1 w-16 transition-colors ${
              activeItem === item.label ? 'text-brand-primary' : 'text-gray-400 hover:text-white'
            }`}
          >
            <span className={`material-symbols-outlined text-2xl ${activeItem === item.label ? 'text-brand-primary' : ''}`}
             style={{fontVariationSettings: `'FILL' ${activeItem === item.label ? 1 : 0}`}}>
              {item.icon}
            </span>
            <span className="text-xs font-medium">{item.label}</span>
          </button>
        ))}
      </div>
    </nav>
  );
};

export default BottomNav;
