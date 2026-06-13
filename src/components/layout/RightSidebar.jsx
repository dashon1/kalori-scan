import React from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { Camera, Mic, Dumbbell } from "lucide-react";

export default function RightSidebar() {
  return (
    <div className="sticky top-[72px] space-y-4">
      <div className="glass-effect border-0 rounded-2xl p-4">
        <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-3">Quick actions</h3>
        <div className="grid grid-cols-1 gap-2">
          <Link to={createPageUrl("Camera")}>
            <Button className="w-full justify-start gap-2 bg-blue-600 hover:bg-blue-700">
              <Camera className="w-4 h-4" />
              Scan meal
            </Button>
          </Link>
          <Link to={createPageUrl("VoiceLogging")}>
            <Button className="w-full justify-start gap-2 bg-violet-600 hover:bg-violet-700">
              <Mic className="w-4 h-4" />
              Voice log
            </Button>
          </Link>
          <Link to={createPageUrl("LogActivity")}>
            <Button className="w-full justify-start gap-2 bg-emerald-600 hover:bg-emerald-700">
              <Dumbbell className="w-4 h-4" />
              Log activity
            </Button>
          </Link>
        </div>
      </div>

      <div className="glass-effect border-0 rounded-2xl p-4">
        <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-2">Tip</h3>
        <p className="text-sm text-slate-600 dark:text-slate-300">
          Use the left sidebar to switch tabs without losing your scroll or filters. Mobile keeps the bottom bar.
        </p>
      </div>
    </div>
  );
}