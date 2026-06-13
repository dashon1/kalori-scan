import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Droplets, Plus, Minus } from 'lucide-react';
import { User } from '@/entities/User';
import { format } from 'date-fns';

export default function WaterTracker({ currentUser, onWaterUpdate }) {
  const [isLoading, setIsLoading] = useState(false);
  
  const waterGoal = currentUser?.water_goal || 8;
  const currentIntake = currentUser?.daily_water_intake || 0;
  const progress = Math.min((currentIntake / waterGoal) * 100, 100);

  const addWater = async (amount) => {
    if (isLoading) return;

    const today = format(new Date(), 'yyyy-MM-dd');
    const prevIntake = currentIntake;
    const newIntake = Math.max(0, prevIntake + amount);

    // Optimistic UI update
    onWaterUpdate && onWaterUpdate(newIntake);
    setIsLoading(true);

    try {
      await User.updateMyUserData({
        daily_water_intake: newIntake,
        last_water_reset_date: today
      });
    } catch (error) {
      console.error('Failed to update water intake:', error);
      // Rollback on failure
      onWaterUpdate && onWaterUpdate(prevIntake);
    }
    setIsLoading(false);
  };

  return (
    <Card className="glass-effect border-0 shadow-lg rounded-3xl overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <Droplets className="w-5 h-5 text-blue-500" />
          Water Intake
        </CardTitle>
        <p className="text-sm font-semibold text-blue-500">
          {currentIntake}/{waterGoal} glasses
        </p>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Progress Bar */}
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
            <div 
              className="bg-gradient-to-r from-blue-400 to-cyan-500 h-3 rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
          
          {/* Controls */}
          <div className="flex items-center justify-center gap-4">
            <Button
              variant="outline"
              size="icon"
              onClick={() => addWater(-1)}
              disabled={isLoading || currentIntake === 0}
              className="rounded-full w-10 h-10"
            >
              <Minus className="w-4 h-4" />
            </Button>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {currentIntake}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">glasses</div>
            </div>
            
            <Button
              variant="outline"
              size="icon"
              onClick={() => addWater(1)}
              disabled={isLoading}
              className="rounded-full w-10 h-10 border-blue-300 hover:bg-blue-50 dark:border-blue-700 dark:hover:bg-blue-900/20"
            >
              <Plus className="w-4 h-4 text-blue-600" />
            </Button>
          </div>
          
          {progress >= 100 && (
            <div className="text-center">
              <p className="text-sm font-medium text-green-600 dark:text-green-400">
                🎉 Daily hydration goal achieved!
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}