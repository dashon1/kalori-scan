import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Bell, BellOff } from 'lucide-react';

export default function FloatingNotificationBell() {
  const [isMuted, setIsMuted] = useState(false);

  return (
    <div className="fixed top-20 right-6 z-50">
      <Button
        onClick={() => setIsMuted(!isMuted)}
        variant="ghost"
        size="icon"
        className="w-12 h-12 rounded-full glass-effect dark:bg-slate-800/80 dark:border-slate-700/50"
      >
        {isMuted ? (
          <BellOff className="w-6 h-6 text-gray-500 dark:text-gray-400" />
        ) : (
          <Bell className="w-6 h-6 text-blue-500 dark:text-blue-400" />
        )}
      </Button>
    </div>
  );
}