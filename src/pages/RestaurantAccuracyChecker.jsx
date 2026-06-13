import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Search, AlertTriangle, CheckCircle, TrendingUp } from "lucide-react";

export default function RestaurantAccuracyChecker() {
  const [showForm, setShowForm] = useState(false);
  const [newReport, setNewReport] = useState({
    restaurant_name: "",
    dish_name: "",
    claimed_calories: "",
    estimated_actual_calories: "",
    photo_url: "",
    accuracy_rating: 3,
    notes: ""
  });
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const queryClient = useQueryClient();

  const { data: reports = [] } = useQuery({
    queryKey: ['restaurantAccuracy'],
    queryFn: () => base44.entities.RestaurantAccuracy.list('-created_date')
  });

  const createReportMutation = useMutation({
    mutationFn: (data) => base44.entities.RestaurantAccuracy.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['restaurantAccuracy'] });
      setShowForm(false);
      setNewReport({
        restaurant_name: "",
        dish_name: "",
        claimed_calories: "",
        estimated_actual_calories: "",
        photo_url: "",
        accuracy_rating: 3,
        notes: ""
      });
    }
  });

  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadingPhoto(true);
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    setNewReport({ ...newReport, photo_url: file_url });
    setUploadingPhoto(false);
  };

  const handleSubmit = () => {
    createReportMutation.mutate({
      ...newReport,
      claimed_calories: parseFloat(newReport.claimed_calories),
      estimated_actual_calories: parseFloat(newReport.estimated_actual_calories)
    });
  };

  const getAccuracyStatus = (claimed, actual) => {
    const diff = Math.abs(claimed - actual);
    const percentDiff = (diff / claimed) * 100;
    
    if (percentDiff < 10) return { color: 'text-green-600', icon: CheckCircle, label: 'Accurate' };
    if (percentDiff < 25) return { color: 'text-yellow-600', icon: AlertTriangle, label: 'Slightly Off' };
    return { color: 'text-red-600', icon: AlertTriangle, label: 'Very Inaccurate' };
  };

  // Group by restaurant
  const restaurantStats = reports.reduce((acc, report) => {
    if (!acc[report.restaurant_name]) {
      acc[report.restaurant_name] = {
        reports: [],
        avgRating: 0
      };
    }
    acc[report.restaurant_name].reports.push(report);
    return acc;
  }, {});

  Object.keys(restaurantStats).forEach(restaurant => {
    const reports = restaurantStats[restaurant].reports;
    restaurantStats[restaurant].avgRating = 
      (reports.reduce((sum, r) => sum + r.accuracy_rating, 0) / reports.length).toFixed(1);
  });

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Restaurant Accuracy Checker</h1>
            <p className="text-gray-600 dark:text-gray-400">Crowd-sourced calorie verification</p>
          </div>
          <Button onClick={() => setShowForm(!showForm)} className="bg-gradient-to-r from-red-600 to-orange-600">
            <Search className="w-4 h-4 mr-2" />
            Report
          </Button>
        </div>

        {showForm && (
          <Card className="glass-effect border-0">
            <CardHeader>
              <CardTitle>Report Calorie Accuracy</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input
                placeholder="Restaurant Name"
                value={newReport.restaurant_name}
                onChange={(e) => setNewReport({ ...newReport, restaurant_name: e.target.value })}
              />
              <Input
                placeholder="Dish Name"
                value={newReport.dish_name}
                onChange={(e) => setNewReport({ ...newReport, dish_name: e.target.value })}
              />
              <div className="grid grid-cols-2 gap-4">
                <Input
                  type="number"
                  placeholder="Claimed Calories"
                  value={newReport.claimed_calories}
                  onChange={(e) => setNewReport({ ...newReport, claimed_calories: e.target.value })}
                />
                <Input
                  type="number"
                  placeholder="Actual Calories (estimate)"
                  value={newReport.estimated_actual_calories}
                  onChange={(e) => setNewReport({ ...newReport, estimated_actual_calories: e.target.value })}
                />
              </div>
              <div>
                <p className="text-sm font-medium mb-2">Accuracy Rating: {newReport.accuracy_rating}/5</p>
                <input
                  type="range"
                  min="1"
                  max="5"
                  value={newReport.accuracy_rating}
                  onChange={(e) => setNewReport({ ...newReport, accuracy_rating: parseInt(e.target.value) })}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400">
                  <span>Very Inaccurate</span>
                  <span>Very Accurate</span>
                </div>
              </div>
              <Textarea
                placeholder="Additional notes..."
                value={newReport.notes}
                onChange={(e) => setNewReport({ ...newReport, notes: e.target.value })}
              />
              <div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  className="hidden"
                  id="photo-upload"
                />
                <label htmlFor="photo-upload">
                  <Button type="button" variant="outline" className="w-full" disabled={uploadingPhoto}>
                    {uploadingPhoto ? "Uploading..." : newReport.photo_url ? "Photo Uploaded ✓" : "Upload Photo (Optional)"}
                  </Button>
                </label>
              </div>
              <Button onClick={handleSubmit} disabled={!newReport.restaurant_name || !newReport.dish_name || !newReport.claimed_calories} className="w-full">
                Submit Report
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Restaurant Rankings */}
        <Card className="glass-effect border-0">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Restaurant Trust Rankings
            </CardTitle>
          </CardHeader>
          <CardContent>
            {Object.entries(restaurantStats).sort((a, b) => b[1].avgRating - a[1].avgRating).map(([restaurant, stats]) => (
              <div key={restaurant} className="flex items-center justify-between p-3 mb-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white">{restaurant}</h4>
                  <p className="text-xs text-gray-600 dark:text-gray-400">{stats.reports.length} report{stats.reports.length > 1 ? 's' : ''}</p>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <span key={i} className={`text-lg ${i < Math.round(stats.avgRating) ? 'text-yellow-500' : 'text-gray-300'}`}>
                        ⭐
                      </span>
                    ))}
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-400">{stats.avgRating}/5.0</p>
                </div>
              </div>
            ))}
            {Object.keys(restaurantStats).length === 0 && (
              <p className="text-center text-gray-600 dark:text-gray-400 py-8">No reports yet</p>
            )}
          </CardContent>
        </Card>

        {/* Recent Reports */}
        <Card className="glass-effect border-0">
          <CardHeader>
            <CardTitle>Recent Reports</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {reports.slice(0, 10).map(report => {
                const status = getAccuracyStatus(report.claimed_calories, report.estimated_actual_calories);
                const Icon = status.icon;
                const diff = report.estimated_actual_calories - report.claimed_calories;
                
                return (
                  <div key={report.id} className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h4 className="font-semibold text-gray-900 dark:text-white">{report.restaurant_name}</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{report.dish_name}</p>
                      </div>
                      <div className={`flex items-center gap-1 ${status.color}`}>
                        <Icon className="w-4 h-4" />
                        <span className="text-sm font-semibold">{status.label}</span>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3 mt-3">
                      <div className="text-center p-2 bg-white dark:bg-gray-700 rounded">
                        <p className="text-xs text-gray-600 dark:text-gray-400">Claimed</p>
                        <p className="text-lg font-bold">{report.claimed_calories}</p>
                      </div>
                      <div className="text-center p-2 bg-white dark:bg-gray-700 rounded">
                        <p className="text-xs text-gray-600 dark:text-gray-400">Actual (est.)</p>
                        <p className="text-lg font-bold">{report.estimated_actual_calories}</p>
                      </div>
                    </div>
                    {diff !== 0 && (
                      <p className="text-sm mt-2 text-center">
                        <span className={diff > 0 ? 'text-red-600' : 'text-green-600'}>
                          {diff > 0 ? '+' : ''}{diff} calories difference
                        </span>
                      </p>
                    )}
                    {report.notes && (
                      <p className="text-sm text-gray-700 dark:text-gray-300 mt-2 italic">"{report.notes}"</p>
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}