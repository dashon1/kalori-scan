import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { Plus, Camera, Mic, Scan, ChefHat, Activity, Droplets } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { User } from "@/entities/User";
import { format } from "date-fns";

export default function FloatingActionButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [waterIntake, setWaterIntake] = useState(0);
  const navigate = useNavigate();

  const actions = [
    { icon: Camera, label: "Scan Meal", href: createPageUrl("Camera"), color: "bg-blue-500" },
    { icon: Mic, label: "Voice Log", href: createPageUrl("VoiceLogging"), color: "bg-purple-500" },
    { icon: Scan, label: "Barcode", href: createPageUrl("BarcodeScanner"), color: "bg-orange-500" },
    { icon: ChefHat, label: "Pantry", href: createPageUrl("PantryScanner"), color: "bg-green-500" },
    { icon: Activity, label: "Exercise", href: createPageUrl("LogActivity"), color: "bg-red-500" },
    { icon: ChefHat, label: "Upload Recipe", href: createPageUrl("Recipes"), color: "bg-pink-500" },
  ];

  const toggleOpen = () => setIsOpen(!isOpen);

  const addWater = async () => {
    try {
      const user = await User.me();
      const today = format(new Date(), 'yyyy-MM-dd');
      const currentIntake = user?.daily_water_intake || 0;
      const newIntake = currentIntake + 1;
      
      await User.updateMyUserData({
        daily_water_intake: newIntake,
        last_water_reset_date: today
      });
      
      setWaterIntake(newIntake);
      
      // Show quick feedback
      const button = document.getElementById('water-quick-add');
      if (button) {
        button.style.transform = 'scale(1.2)';
        setTimeout(() => {
          button.style.transform = 'scale(1)';
        }, 200);
      }
    } catch (error) {
      console.error('Failed to add water:', error);
    }
  };

  return (
    <div className="fixed bottom-24 right-6 z-50">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="flex flex-col items-center gap-3 mb-4"
          >
            {/* Water Quick Add */}
            <div onClick={addWater} className="flex items-center gap-3 group cursor-pointer">
              <span className="bg-gray-800 text-white text-xs font-semibold px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                Add Water
              </span>
              <Button
                id="water-quick-add"
                className="bg-cyan-500 text-white rounded-full shadow-lg w-12 h-12 hover:scale-110 transition-transform"
                size="icon"
              >
                <Droplets className="w-6 h-6" />
              </Button>
            </div>

            {actions.map((action) => (
              <div key={action.label} onClick={() => { navigate(action.href); setIsOpen(false); }} className="flex items-center gap-3 group cursor-pointer">
                <span className="bg-gray-800 text-white text-xs font-semibold px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                  {action.label}
                </span>
                <Button
                  className={`${action.color} text-white rounded-full shadow-lg w-12 h-12 hover:scale-110 transition-transform`}
                  size="icon"
                >
                  <action.icon className="w-6 h-6" />
                </Button>
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      <Button
        onClick={toggleOpen}
        className="w-16 h-16 rounded-full bg-gradient-to-r from-teal-600 to-blue-600 text-white shadow-2xl hover:shadow-3xl transition-shadow"
        size="icon"
      >
        <motion.div 
          animate={{ rotate: isOpen ? 45 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <Plus className="w-8 h-8" />
        </motion.div>
      </Button>
    </div>
  );
}