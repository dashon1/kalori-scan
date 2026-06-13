import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Activity } from '@/entities/Activity';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowLeft, Activity as ActivityIcon, Flame, Clock, Zap, Calendar as CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';

export default function ActivityDetailsPage() {
    const [searchParams] = useSearchParams();
    const [activity, setActivity] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const navigate = useNavigate();
    const activityId = searchParams.get('id');

    useEffect(() => {
        if (activityId) {
            Activity.get(activityId)
                .then(setActivity)
                .catch(console.error)
                .finally(() => setIsLoading(false));
        } else {
            setIsLoading(false);
        }
    }, [activityId]);

    if (isLoading) {
        return <div className="flex items-center justify-center h-screen"><div className="w-8 h-8 animate-spin rounded-full border-2 border-dashed border-blue-500"></div></div>;
    }

    if (!activity) {
        return <div className="flex items-center justify-center h-screen text-center">Activity not found.</div>;
    }
    
    return (
        <div className="min-h-screen bg-gray-50 dark:bg-slate-900 p-4">
            <div className="max-w-md mx-auto space-y-6">
                <div className="flex items-center gap-4">
                    <Button variant="outline" size="icon" onClick={() => navigate(-1)} className="rounded-full">
                        <ArrowLeft className="w-4 h-4" />
                    </Button>
                    <h1 className="text-2xl font-bold">Activity Details</h1>
                </div>

                <Card className="glass-effect overflow-hidden">
                    <div className="p-6 bg-gradient-to-br from-orange-400 to-red-500 text-white">
                        <div className="flex items-center gap-3 mb-2">
                           <ActivityIcon className="w-8 h-8" />
                           <h2 className="text-2xl font-bold">{activity.name}</h2>
                        </div>
                        <p className="text-sm opacity-90 capitalize">{activity.type} workout</p>
                    </div>
                    <CardContent className="p-6 space-y-4">
                        <div className="grid grid-cols-2 gap-4 text-center">
                            <div className="p-4 bg-gray-100 dark:bg-slate-800 rounded-xl">
                                <Flame className="mx-auto w-6 h-6 text-red-500 mb-1" />
                                <p className="text-sm text-gray-600 dark:text-gray-400">Calories Burned</p>
                                <p className="text-xl font-bold text-gray-900 dark:text-white">{activity.calories_burned}</p>
                            </div>
                            <div className="p-4 bg-gray-100 dark:bg-slate-800 rounded-xl">
                                <Clock className="mx-auto w-6 h-6 text-blue-500 mb-1" />
                                <p className="text-sm text-gray-600 dark:text-gray-400">Duration</p>
                                <p className="text-xl font-bold text-gray-900 dark:text-white">{activity.duration_minutes} min</p>
                            </div>
                        </div>

                         <div className="p-4 bg-gray-100 dark:bg-slate-800 rounded-xl">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Zap className="w-5 h-5 text-yellow-500" />
                                    <span className="font-medium text-gray-800 dark:text-gray-200">Intensity</span>
                                </div>
                                <span className="capitalize font-semibold text-gray-900 dark:text-white">{activity.intensity}</span>
                            </div>
                        </div>
                        
                         <div className="p-4 bg-gray-100 dark:bg-slate-800 rounded-xl">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <CalendarIcon className="w-5 h-5 text-green-500" />
                                    <span className="font-medium text-gray-800 dark:text-gray-200">Date</span>
                                </div>
                                <span className="font-semibold text-gray-900 dark:text-white">
                                    {format(new Date(activity.date), "MMMM d, yyyy")}
                                </span>
                            </div>
                        </div>
                        
                        {activity.notes && (
                            <div className="p-4 bg-gray-100 dark:bg-slate-800 rounded-xl">
                                <h4 className="font-semibold mb-2 text-gray-800 dark:text-gray-200">Notes</h4>
                                <p className="text-sm text-gray-600 dark:text-gray-400">{activity.notes}</p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}