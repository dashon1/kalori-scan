
import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Zap, Award } from 'lucide-react';
import { User } from '@/entities/User';
import { format, isYesterday, startOfToday } from 'date-fns';

const motivationalMessages = [
    "Every healthy choice is a step towards your goal. Keep going!",
    "Consistency is key. You're building habits that will last a lifetime.",
    "Your future self will thank you for today's effort.",
    "One meal at a time, one day at a time. You've got this!",
    "Progress, not perfection. Celebrate every small victory!"
];

export default function SmartInsights({ user }) {
    const [streak, setStreak] = useState(user.login_streak || 0);
    const [motivationalMessage, setMotivationalMessage] = useState("");

    useEffect(() => {
        const updateStreak = async () => {
            const today = startOfToday();
            const lastLogin = user.last_login_date ? new Date(user.last_login_date) : null;
            let newStreak = user.login_streak || 0;

            if (!lastLogin || format(lastLogin, 'yyyy-MM-dd') === format(today, 'yyyy-MM-dd')) {
                // Already logged in today or first login
                newStreak = newStreak === 0 ? 1 : newStreak;
            } else if (isYesterday(lastLogin)) {
                // Logged in yesterday, increment streak
                newStreak++;
            } else {
                // Missed a day, reset streak
                newStreak = 1;
            }

            // Only update if the streak has changed to avoid unnecessary re-renders/API calls
            // Note: The original code compared `newStreak` with `streak` from the outer scope,
            // which might be stale if `streak` was updated by `setStreak` inside this effect.
            // However, the intent seems to be to update the *database* only if the calculated
            // `newStreak` based on current logic differs from the last stored/initial `streak`.
            // Given the eslint directive, we're preserving the original logic's dependencies.
            if (newStreak !== streak) { 
                setStreak(newStreak);
                try {
                    await User.updateMyUserData({ 
                        login_streak: newStreak,
                        last_login_date: today.toISOString()
                    });
                } catch (e) {
                    console.error("Failed to update streak", e);
                }
            }
        };

        updateStreak();
        setMotivationalMessage(motivationalMessages[Math.floor(Math.random() * motivationalMessages.length)]);
     
    }, [user]);

    return (
        <Card className="glass-effect border-0 shadow-lg rounded-3xl overflow-hidden">
            <CardContent className="p-6">
                <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col items-center justify-center p-3 bg-gray-50 dark:bg-gray-800/50 rounded-2xl text-center">
                        <Award className="w-8 h-8 text-yellow-500 mb-2" />
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">{streak}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Day Streak</p>
                    </div>
                    <div className="flex flex-col items-center justify-center p-3 bg-gray-50 dark:bg-gray-800/50 rounded-2xl text-center">
                        <Zap className="w-8 h-8 text-purple-500 mb-2" />
                        <p className="text-sm font-medium text-gray-800 dark:text-gray-300 leading-tight">
                            {motivationalMessage}
                        </p>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
