'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

const menuItems = [
  {
    title: 'Dashboard',
    href: '/',
    description: 'System overview and statistics'
  },
  {
    title: 'Teachers',
    href: '/teachers',
    description: 'Manage teacher profiles and data'
  },
  {
    title: 'Timetable',
    href: '/timetable',
    description: 'Create and manage schedules',
    submenu: [
      { title: 'Class Timetables', href: '/timetable/class' },
      { title: 'Teacher Schedules', href: '/timetable/teacher' }
    ]
  },
  {
    title: 'Substitution',
    href: '/substitution',
    description: 'Automatic teacher substitution',
    submenu: [
      { title: 'Current Substitutions', href: '/substitution' },
      { title: 'Leave Requests', href: '/substitution/requests' }
    ]
  },
  {
    title: 'Rooms',
    href: '/rooms',
    description: 'Manage classroom allocation'
  },
  {
    title: 'Reports',
    href: '/reports',
    description: 'Generate system reports'
  }
];

export function Sidebar() {
  const pathname = usePathname();
  const [expandedItems, setExpandedItems] = useState<string[]>([]);

  const toggleExpanded = (href: string) => {
    setExpandedItems(prev => 
      prev.includes(href) 
        ? prev.filter(item => item !== href)
        : [...prev, href]
    );
  };

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  };

  const isExpanded = (href: string) => expandedItems.includes(href);

  return (
    <div className="w-64 h-screen bg-gray-50 border-r border-gray-200 flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <h1 className="text-xl font-bold text-gray-900">School Management</h1>
        <p className="text-sm text-gray-600 mt-1">Timetable & Substitution System</p>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        {menuItems.map((item) => (
          <div key={item.href}>
            {/* Main Menu Item */}
            <div className="space-y-1">
              {item.submenu ? (
                <Button
                  variant="ghost"
                  className={cn(
                    "w-full justify-start text-left h-auto p-3 rounded-lg",
                    isActive(item.href) 
                      ? "bg-blue-50 text-blue-700 border border-blue-200" 
                      : "hover:bg-gray-100"
                  )}
                  onClick={() => toggleExpanded(item.href)}
                >
                  <div className="flex-1">
                    <div className="font-medium">{item.title}</div>
                    <div className="text-xs text-gray-500 mt-1">{item.description}</div>
                  </div>
                  <div className={cn(
                    "ml-2 transition-transform",
                    isExpanded(item.href) ? "rotate-90" : ""
                  )}>
                    ▶
                  </div>
                </Button>
              ) : (
                <Link href={item.href}>
                  <Button
                    variant="ghost"
                    className={cn(
                      "w-full justify-start text-left h-auto p-3 rounded-lg",
                      isActive(item.href) 
                        ? "bg-blue-50 text-blue-700 border border-blue-200" 
                        : "hover:bg-gray-100"
                    )}
                  >
                    <div>
                      <div className="font-medium">{item.title}</div>
                      <div className="text-xs text-gray-500 mt-1">{item.description}</div>
                    </div>
                  </Button>
                </Link>
              )}
            </div>

            {/* Submenu Items */}
            {item.submenu && isExpanded(item.href) && (
              <div className="ml-4 mt-2 space-y-1">
                {item.submenu.map((subitem) => (
                  <Link key={subitem.href} href={subitem.href}>
                    <Button
                      variant="ghost"
                      size="sm"
                      className={cn(
                        "w-full justify-start text-sm",
                        isActive(subitem.href)
                          ? "bg-blue-50 text-blue-700"
                          : "text-gray-600 hover:bg-gray-100"
                      )}
                    >
                      {subitem.title}
                    </Button>
                  </Link>
                ))}
              </div>
            )}
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200">
        <Card className="p-3">
          <div className="text-xs text-gray-600">
            <div className="font-medium mb-1">System Status</div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>All systems operational</span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}