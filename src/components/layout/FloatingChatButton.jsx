import React from 'react';
import { Button } from '@/components/ui/button';
import { MessageCircle, X } from 'lucide-react';
import { motion } from 'framer-motion';

export default function FloatingChatButton({ onClick, isOpen }) {
  return (
    <div className="fixed bottom-24 left-6 z-50">
      <Button
        onClick={onClick}
        className="w-16 h-16 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-2xl"
        size="icon"
      >
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0, scale: isOpen ? 0.8 : 1 }}
          transition={{ duration: 0.3 }}
        >
          {isOpen ? <X className="w-8 h-8" /> : <MessageCircle className="w-8 h-8" />}
        </motion.div>
      </Button>
    </div>
  );
}