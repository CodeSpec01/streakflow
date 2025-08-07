"use client";

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Calendar } from '@/components/ui/calendar';
import { Navbar } from '@/components/Navbar';
import { Calendar as CalendarIcon, Save, Activity } from 'lucide-react';

interface Category {
  _id: string;
  name: string;
  isActive: boolean;
}

interface ActivityEntry {
  categoryId: string;
  level: 'inactive' | 'partially_active' | 'super_active';
}

interface ActivityData {
  _id?: string;
  date: string;
  entries: ActivityEntry[];
}

export default function UpdateActivityPage() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [categories, setCategories] = useState<Category[]>([]);
  const [activityLevels, setActivityLevels] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    if (selectedDate) {
      fetchActivityForDate(selectedDate.toISOString().split('T')[0]);
    }
  }, [selectedDate]);

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/categories');
      if (response.ok) {
        const data = await response.json();
        setCategories(data);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchActivityForDate = async (dateStr: string) => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/activities/${dateStr}`);
      if (response.ok) {
        const activity: ActivityData = await response.json();
        
        // Create a map of category ID to activity level
        const levels: Record<string, string> = {};
        
        if (activity.entries) {
          activity.entries.forEach((entry) => {
            levels[entry.categoryId] = entry.level;
          });
        }
        
        // Set default values for categories without entries
        categories.forEach((category) => {
          if (!levels[category._id]) {
            levels[category._id] = 'inactive';
          }
        });
        
        setActivityLevels(levels);
      }
    } catch (error) {
      console.error('Error fetching activity:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleActivityLevelChange = (categoryId: string, level: string) => {
    setActivityLevels(prev => ({
      ...prev,
      [categoryId]: level
    }));
  };

  const handleSaveChanges = async () => {
    setIsSaving(true);
    try {
      const dateStr = selectedDate.toISOString().split('T')[0];
      const entries: ActivityEntry[] = Object.entries(activityLevels).map(([categoryId, level]) => ({
        categoryId,
        level: level as 'inactive' | 'partially_active' | 'super_active'
      }));

      const response = await fetch('/api/activities', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          date: dateStr,
          entries
        }),
      });

      if (response.ok) {
        // Show success feedback
        alert('Activity updated successfully!');
      } else {
        const data = await response.json();
        alert(data.error || 'Failed to save activity');
      }
    } catch (error) {
      console.error('Error saving activity:', error);
      alert('Failed to save activity');
    } finally {
      setIsSaving(false);
    }
  };

  const getLevelLabel = (level: string) => {
    switch (level) {
      case 'inactive':
        return 'Completely Inactive';
      case 'partially_active':
        return 'Partially Active';
      case 'super_active':
        return 'Super Active';
      default:
        return level;
    }
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'inactive':
        return 'text-muted-foreground';
      case 'partially_active':
        return 'text-yellow-600';
      case 'super_active':
        return 'text-green-600';
      default:
        return 'text-muted-foreground';
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar isAuthenticated={true} />

      <div className="max-w-6xl mx-auto p-6">
        <div className="flex items-center space-x-2 mb-8">
          <Activity className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold">Update Activity</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Calendar Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <CalendarIcon className="h-5 w-5" />
                <span>Select Date</span>
              </CardTitle>
              <CardDescription>
                Choose a date to update your activity levels
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={(date) => date && setSelectedDate(date)}
                disabled={(date) =>
                  date > new Date() // Disable future dates
                }
                className="rounded-md border"
              />
              
              <div className="mt-4 p-3 bg-muted/50 rounded-md">
                <div className="text-sm font-medium">Selected Date</div>
                <div className="text-lg font-semibold text-primary">
                  {selectedDate.toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Activity Levels */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Activity Levels</CardTitle>
                <CardDescription>
                  Set your activity level for each category on the selected date
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="text-center py-8 text-muted-foreground">
                    Loading activity data...
                  </div>
                ) : categories.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <p>No categories found.</p>
                    <p className="text-sm">
                      <a href="/dashboard" className="text-primary hover:underline">
                        Go to dashboard to create categories
                      </a>
                    </p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {categories.map((category) => (
                      <div key={category._id} className="border rounded-lg p-4">
                        <h3 className="font-semibold text-lg mb-3">{category.name}</h3>
                        <RadioGroup
                          value={activityLevels[category._id] || 'inactive'}
                          onValueChange={(value) => handleActivityLevelChange(category._id, value)}
                          className="grid grid-cols-1 sm:grid-cols-3 gap-4"
                        >
                          {['inactive', 'partially_active', 'super_active'].map((level) => (
                            <div key={level} className="flex items-center space-x-2">
                              <RadioGroupItem value={level} id={`${category._id}-${level}`} />
                              <Label 
                                htmlFor={`${category._id}-${level}`}
                                className={`cursor-pointer ${getLevelColor(level)}`}
                              >
                                {getLevelLabel(level)}
                              </Label>
                            </div>
                          ))}
                        </RadioGroup>
                      </div>
                    ))}

                    <div className="pt-6 border-t">
                      <Button
                        onClick={handleSaveChanges}
                        disabled={isSaving || categories.length === 0}
                        size="lg"
                        className="w-full sm:w-auto"
                      >
                        <Save className="h-4 w-4 mr-2" />
                        {isSaving ? 'Saving Changes...' : 'Save Changes'}
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Activity Legend */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Activity Level Guide</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                <div className="w-4 h-4 bg-gray-300 rounded"></div>
                <div>
                  <div className="font-medium">Completely Inactive</div>
                  <div className="text-muted-foreground">No activity for this category</div>
                </div>
              </div>
              <div className="flex items-center space-x-3 p-3 bg-yellow-50 rounded-lg">
                <div className="w-4 h-4 bg-yellow-400 rounded"></div>
                <div>
                  <div className="font-medium">Partially Active</div>
                  <div className="text-muted-foreground">Some activity, but below target</div>
                </div>
              </div>
              <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
                <div className="w-4 h-4 bg-green-500 rounded"></div>
                <div>
                  <div className="font-medium">Super Active</div>
                  <div className="text-muted-foreground">Met or exceeded goals</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}