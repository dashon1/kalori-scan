import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Activity, Flame, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';

const activityIcons = {
  running: <Activity className="w-5 h-5" />,
  walking: <Activity className="w-5 h-5" />,
  cycling: <Activity className="w-5 h-5" />,
  strength: <Activity className="w-5 h-5" />,
  default: <Activity className="w-5 h-5" />
};

export default function ActivityTracker({ activities }) {
  const navigate = useNavigate();
  const totalCaloriesBurned = activities.reduce((sum, activity) => sum + activity.calories_burned, 0);

  return (
    <Card className="glass-effect border-0 shadow-lg rounded-3xl overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg font-bold text-gray-900 dark:text-white">Activity</CardTitle>
        <p className="text-sm font-semibold text-orange-500 flex items-center gap-1">
          <Flame className="w-4 h-4" />
          {Math.round(totalCaloriesBurned)} Cal Burned
        </p>
      </CardHeader>
      <CardContent>
        {activities.length === 0 ? (
          <div className="text-center py-4">
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">No activities logged today.</p>
            <Button variant="outline" size="sm" onClick={() => navigate(createPageUrl("LogActivity"))}>
              <Plus className="w-4 h-4 mr-2" />
              Log Activity
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {activities.map(activity => (
              <div key={activity.id} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl cursor-pointer" onClick={() => navigate(createPageUrl(`ActivityDetails?id=${activity.id}`))}>
                <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center text-orange-500">
                  {activityIcons[activity.type] || activityIcons.default}
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-sm text-gray-900 dark:text-white">{activity.name}</h4>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{activity.duration_minutes} min</p>
                </div>
                <p className="text-sm font-medium text-gray-800 dark:text-gray-200">
                  -{Math.round(activity.calories_burned)} cal
                </p>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}