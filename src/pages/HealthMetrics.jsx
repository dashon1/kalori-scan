
import React, { useState, useEffect } from "react";
import { HealthMetric } from "@/entities/HealthMetric";
import { User } from "@/entities/User";
import { InvokeLLM } from "@/integrations/Core"; // New import for AI functionality
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge"; // New import for Badge component
import { format } from "date-fns";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, ReferenceArea } from 'recharts'; // Updated recharts imports
import { Plus, TrendingUp, Sparkles, Activity } from "lucide-react"; // Updated lucide-react imports
import PremiumGate from "../components/premium/PremiumGate";

export default function HealthMetrics() {
  const [metrics, setMetrics] = useState([]);
  const [metricType, setMetricType] = useState("blood_pressure");
  const [formData, setFormData] = useState({ value1: "", value2: "" });
  const [isLoading, setIsLoading] = useState(true);
  const [isAnalyzing, setIsAnalyzing] = useState(false); // New state for AI analysis loading
  const [aiInsight, setAiInsight] = useState(null); // New state for AI insight text
  const [currentUser, setCurrentUser] = useState(null); // Add currentUser state

  useEffect(() => {
    loadMetrics();
  }, []);

  const loadMetrics = async () => {
    setIsLoading(true);
    try {
      const user = await User.me();
      setCurrentUser(user);

      if (user.subscription_status === 'premium') {
        // Ensure metrics are loaded from newest to oldest by using a negative sign for sorting
        const userMetrics = await HealthMetric.filter({ created_by: user.email }, '-logged_at');
        setMetrics(userMetrics);
      } else {
        setMetrics([]); // Clear metrics if not premium
      }
    } catch (error) {
      console.error("Failed to load metrics:", error);
      setMetrics([]); // Clear metrics on error
    }
    setIsLoading(false);
  };

  // New function to get AI insight
  const getMetricInsight = async (metricData) => {
    setIsAnalyzing(true);
    setAiInsight(null); // Clear previous insight

    let prompt;
    if (metricData.metric_type === "blood_pressure") {
      prompt = `A user logged a blood pressure of ${metricData.value1}/${metricData.value2} mmHg. Briefly explain what this reading means in simple terms (e.g., Normal, Elevated, Hypertension Stage 1). Provide one short, non-medical, actionable tip related to managing blood pressure. Keep it supportive and under 40 words.`;
    } else if (metricData.metric_type === "blood_glucose") {
      prompt = `A user logged a blood glucose level of ${metricData.value1} mg/dL. Briefly explain what this reading might indicate for a fasting test (e.g., Normal, Prediabetes, Diabetes range). Provide one short, actionable tip for managing blood sugar. Keep it supportive and under 40 words.`;
    } else {
      setIsAnalyzing(false);
      return; // No prompt for unknown metric types
    }

    try {
      const result = await InvokeLLM({ prompt });
      setAiInsight(result);
    } catch (error) {
      console.error("AI analysis failed:", error);
      setAiInsight("Could not get an insight at this time.");
    }
    setIsAnalyzing(false);
  };

  const handleSave = async () => {
    if (!formData.value1) return; // Value 1 is always required

    let metricData = {
      metric_type: metricType,
      value1: parseFloat(formData.value1),
      logged_at: new Date().toISOString()
    };

    if (metricType === "blood_pressure") {
      // Both value1 and value2 are required for blood pressure
      if (!formData.value2) return;
      metricData.value2 = parseFloat(formData.value2);
      metricData.unit = "mmHg";
    } else if (metricType === "blood_glucose") {
      metricData.unit = "mg/dL";
    }

    try {
      await HealthMetric.create(metricData);
      setFormData({ value1: "", value2: "" }); // Clear form fields
      loadMetrics(); // Reload metrics to update the list and chart
      getMetricInsight(metricData); // Get AI insight for the newly logged metric
    } catch (error) {
      console.error("Failed to save metric:", error);
    }
  };

  const filteredMetrics = metrics.filter(m => m.metric_type === metricType);
  // Reverse the array to display chronologically ascending on the chart
  const chartData = filteredMetrics.map(m => ({
    date: format(new Date(m.logged_at), "MMM d"),
    value1: m.value1,
    value2: m.value2,
  })).reverse();

  // New function to render reference ranges for the chart
  const renderChartRanges = () => {
    if (metricType === 'blood_pressure') {
      return (
        <>
          {/* Systolic Reference Areas (simplified for primary value on YAxis) */}
          <ReferenceArea y1={0} y2={120} fill="#10b981" strokeOpacity={0.3} fillOpacity={0.1} label={{ value: 'Normal', position: 'insideTopLeft', fill: '#10b981', fontSize: 10 }} />
          <ReferenceArea y1={120} y2={130} fill="#f59e0b" strokeOpacity={0.3} fillOpacity={0.1} label={{ value: 'Elevated', position: 'insideTopLeft', fill: '#f59e0b', fontSize: 10 }} />
          <ReferenceArea y1={130} y2={200} fill="#ef4444" strokeOpacity={0.3} fillOpacity={0.1} label={{ value: 'High', position: 'insideTopLeft', fill: '#ef4444', fontSize: 10 }} />
          {/* Diastolic reference line (as YAxis is for systolic, this is more indicative) */}
          <ReferenceLine y={80} label={{ value: '80 Diastolic', position: 'right', fontSize: 10, fill: '#a1a1aa' }} stroke="#a1a1aa" strokeDasharray="3 3" />
        </>
      );
    }
    if (metricType === 'blood_glucose') {
       return (
        <>
          <ReferenceArea y1={0} y2={100} fill="#10b981" strokeOpacity={0.3} fillOpacity={0.1} label={{ value: 'Normal', position: 'insideTopLeft', fill: '#10b981', fontSize: 10 }} />
          <ReferenceArea y1={100} y2={126} fill="#f59e0b" strokeOpacity={0.3} fillOpacity={0.1} label={{ value: 'Prediabetes', position: 'insideTopLeft', fill: '#f59e0b', fontSize: 10 }} />
          <ReferenceArea y1={126} y2={300} fill="#ef4444" strokeOpacity={0.3} fillOpacity={0.1} label={{ value: 'High', position: 'insideTopLeft', fill: '#ef4444', fontSize: 10 }} />
        </>
      );
    }
    return null;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-blue-300 border-t-blue-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  // If currentUser is null or not premium, show the PremiumGate
  if (currentUser?.subscription_status !== 'premium') {
    return (
      <div className="p-6">
        <PremiumGate
          feature="Health Metrics Tracking"
          description="Upgrade to Premium to monitor key health indicators like blood pressure and blood glucose, helping you manage your overall health proactively."
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-sm mx-auto space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-white mb-2">Health Metrics</h1>
          <p className="text-gray-500 dark:text-gray-400">Track your vital signs to gain powerful health insights</p>
        </div>

        <Card className="glass-effect card-shadow rounded-3xl">
          <CardHeader>
            <CardTitle>Log New Metric</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Select value={metricType} onValueChange={setMetricType}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="blood_pressure">Blood Pressure</SelectItem>
                <SelectItem value="blood_glucose">Blood Glucose</SelectItem>
              </SelectContent>
            </Select>

            {metricType === 'blood_pressure' && (
              <div className="flex gap-4">
                <div className="flex-1">
                  <Label htmlFor="systolic">Systolic (mmHg)</Label>
                  <Input id="systolic" type="number" placeholder="120" value={formData.value1} onChange={e => setFormData({...formData, value1: e.target.value})} />
                </div>
                <div className="flex-1">
                  <Label htmlFor="diastolic">Diastolic (mmHg)</Label>
                  <Input id="diastolic" type="number" placeholder="80" value={formData.value2} onChange={e => setFormData({...formData, value2: e.target.value})} />
                </div>
              </div>
            )}

            {metricType === 'blood_glucose' && (
              <div>
                <Label htmlFor="glucose">Glucose (mg/dL)</Label>
                <Input id="glucose" type="number" placeholder="90" value={formData.value1} onChange={e => setFormData({...formData, value1: e.target.value})} />
              </div>
            )}
            
            <Button onClick={handleSave} className="w-full bg-gradient-to-r from-green-600 to-teal-600 text-white" disabled={isAnalyzing}>
              <Plus className="w-4 h-4 mr-2" />Add Metric
            </Button>
          </CardContent>
        </Card>

        {(isAnalyzing || aiInsight) && (
          <Card className="glass-effect card-shadow rounded-3xl bg-gradient-to-r from-teal-50 to-blue-50 dark:from-teal-900/30 dark:to-blue-900/30">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-teal-800 dark:text-teal-300">
                <Sparkles className="w-5 h-5"/>
                AI Health Insight
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isAnalyzing ? (
                <p className="text-center text-gray-600 dark:text-gray-400">Analyzing your data...</p>
              ) : (
                <p className="text-teal-900 dark:text-teal-200">{aiInsight}</p>
              )}
            </CardContent>
          </Card>
        )}

        <Card className="glass-effect card-shadow rounded-3xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-teal-500" />
              {metricType === 'blood_pressure' ? 'Blood Pressure Trend' : 'Blood Glucose Trend'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {chartData.length > 0 ? (
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" fontSize={12} />
                    <YAxis fontSize={12} domain={['dataMin - 10', 'dataMax + 10']}/>
                    <Tooltip />
                    {renderChartRanges()}
                    <Line type="monotone" dataKey="value1" stroke="#8884d8" name={metricType === 'blood_pressure' ? 'Systolic' : 'Glucose'} strokeWidth={2} />
                    {metricType === 'blood_pressure' && <Line type="monotone" dataKey="value2" stroke="#82ca9d" name="Diastolic" strokeWidth={2} />}
                  </LineChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <p className="text-center text-gray-500 dark:text-gray-400">No data yet. Log a metric to see your trend.</p>
            )}
          </CardContent>
        </Card>

        {/* New Card for Recent Logs */}
        {filteredMetrics.length > 0 && (
           <Card className="glass-effect card-shadow rounded-3xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-gray-500"/>
                Recent Logs
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {filteredMetrics.slice(0, 5).map(metric => ( // Show only the 5 most recent
                <div key={metric.id} className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                   <div>
                    <p className="font-semibold text-gray-800 dark:text-gray-200">
                      {metric.metric_type === 'blood_pressure' ? `${metric.value1}/${metric.value2}` : metric.value1}
                      <span className="text-sm ml-1 text-gray-500">{metric.unit}</span>
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{format(new Date(metric.logged_at), "MMM d, yyyy - h:mm a")}</p>
                   </div>
                   {/* Badge for metric type, using a simple conditional variant */}
                   <Badge variant={metric.metric_type === 'blood_pressure' ? "destructive" : "secondary"}>{metric.metric_type.replace('_', ' ')}</Badge>
                </div>
              ))}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
