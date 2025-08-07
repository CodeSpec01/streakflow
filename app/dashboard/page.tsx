"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Navbar } from '@/components/Navbar';
import { DeleteAccountDialog } from '@/components/DeleteAccountDialog';
import { CategoryDeleteDialog } from '@/components/CategoryDeleteDialog';
import { HeatmapCalendar } from '@/components/HeatmapCalendar';
import { 
  User, 
  Plus, 
  Trash2, 
  Calendar, 
  Target, 
  TrendingUp,
  BarChart3,
  Activity
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { getHeatmapData } from '@/lib/streaks';

interface Category {
  _id: string;
  name: string;
  isActive: boolean;
}

interface Stats {
  currentStreak: number;
  maxStreak: number;
  activeDays: number;
  totalDays: number;
}

interface ActivityData {
  _id: string;
  date: string;
  entries: Array<{
    categoryId: string;
    level: 'inactive' | 'partially_active' | 'super_active';
  }>;
}

export default function DashboardPage() {
  const [userEmail, setUserEmail] = useState('');
  const [categories, setCategories] = useState<Category[]>([]);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [stats, setStats] = useState<Stats>({ currentStreak: 0, maxStreak: 0, activeDays: 0, totalDays: 0 });
  const [activities, setActivities] = useState<ActivityData[]>([]);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [heatmapData, setHeatmapData] = useState<Array<{ date: string; count: number }>>([]);
  const [showDeleteAccount, setShowDeleteAccount] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<{ id: string; name: string } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // Generate year options (current year and previous 2 years)
  const yearOptions = Array.from({ length: 3 }, (_, i) => new Date().getFullYear() - i);

  useEffect(() => {
    fetchUserData();
    fetchCategories();
    fetchStats();
    fetchActivities();
  }, []);

  useEffect(() => {
    if (activities.length > 0) {
      //@ts-ignore
      const data = getHeatmapData(activities, selectedYear, selectedCategory === 'all' ? undefined : selectedCategory);
      setHeatmapData(data);
    }
  }, [activities, selectedYear, selectedCategory]);

  const fetchUserData = async () => {
    try {
      const response = await fetch('/api/user/get');
      if (response.ok) {
        const email = await response.json();
        setUserEmail(email);
      } else {
        console.error('Failed to fetch user data');
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  };

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

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/stats');
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const fetchActivities = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/activities');
      if (response.ok) {
        const data = await response.json();
        setActivities(data);
      }
    } catch (error) {
      console.error('Error fetching activities:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategoryName.trim()) return;

    try {
      const response = await fetch('/api/categories', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: newCategoryName.trim() }),
      });

      if (response.ok) {
        setNewCategoryName('');
        fetchCategories();
      } else {
        const data = await response.json();
        alert(data.error || 'Failed to add category');
      }
    } catch (error) {
      console.error('Error adding category:', error);
      alert('Failed to add category');
    }
  };

  const handleDeleteCategory = async (deleteType: 'soft' | 'hard') => {
    if (!categoryToDelete) return;

    try {
      const response = await fetch(`/api/categories/${categoryToDelete.id}?type=${deleteType}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        fetchCategories();
        fetchActivities();
        fetchStats();
      } else {
        alert('Failed to delete category');
      }
    } catch (error) {
      console.error('Error deleting category:', error);
      alert('Failed to delete category');
    }
  };

  // Prepare pie chart data
  const pieData = [
    { name: 'Active Days', value: stats.activeDays, color: '#22c55e' },
    { name: 'Inactive Days', value: Math.max(0, stats.totalDays - stats.activeDays), color: '#e5e7eb' }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar isAuthenticated={true} userEmail={userEmail} />

      <div className="max-w-7xl mx-auto p-6 space-y-8">
        {/* Header */}
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <Button asChild>
            <a href="/update-activity">Update Activity</a>
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Division 1: Account Information */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <User className="h-5 w-5" />
                  <span>Account Information</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="font-medium">{userEmail || 'user@example.com'}</p>
                </div>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => setShowDeleteAccount(true)}
                  className="w-full"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Account
                </Button>
              </CardContent>
            </Card>

            {/* Category Management */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <BarChart3 className="h-5 w-5" />
                  <span>Manage Categories</span>
                </CardTitle>
                <CardDescription>
                  Add and manage your activity categories
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <form onSubmit={handleAddCategory} className="flex space-x-2">
                  <Input
                    placeholder="Category name"
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                    required
                  />
                  <Button type="submit" size="sm">
                    <Plus className="h-4 w-4" />
                  </Button>
                </form>

                <div className="space-y-2">
                  {categories.map((category) => (
                    <div
                      key={category._id}
                      className="flex items-center justify-between p-2 rounded-md border"
                    >
                      <span className="text-sm font-medium">{category.name}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setCategoryToDelete({ id: category._id, name: category.name })}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Division 2: Activity Heatmap */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle className="flex items-center space-x-2">
                    <Calendar className="h-5 w-5" />
                    <span>Activity Heatmap</span>
                  </CardTitle>
                  <div className="flex space-x-2">
                    <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                      <SelectTrigger className="w-40">
                        <SelectValue placeholder="Category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Categories</SelectItem>
                        {categories.map((category) => (
                          <SelectItem key={category._id} value={category._id}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Select value={selectedYear.toString()} onValueChange={(value) => setSelectedYear(parseInt(value))}>
                      <SelectTrigger className="w-24">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {yearOptions.map((year) => (
                          <SelectItem key={year} value={year.toString()}>
                            {year}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="h-40 flex items-center justify-center">
                    <div className="text-muted-foreground">Loading heatmap...</div>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <HeatmapCalendar
                      values={heatmapData}
                      startDate={new Date(selectedYear, 0, 1)}
                      endDate={new Date(selectedYear, 11, 31)}
                    />
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Division 3: Numerical Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Target className="h-5 w-5" />
                    <span>Activity Overview</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={pieData}
                          cx="50%"
                          cy="50%"
                          innerRadius={40}
                          outerRadius={80}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          {pieData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <TrendingUp className="h-5 w-5" />
                    <span>Streak Statistics</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-4 bg-primary/10 rounded-lg">
                      <div className="text-2xl font-bold text-primary">{stats.currentStreak}</div>
                      <div className="text-sm text-muted-foreground">Current Streak</div>
                    </div>
                    <div className="text-center p-4 bg-secondary/10 rounded-lg">
                      <div className="text-2xl font-bold">{stats.maxStreak}</div>
                      <div className="text-sm text-muted-foreground">Max Streak</div>
                    </div>
                  </div>
                  <div className="text-center p-4 bg-muted/50 rounded-lg">
                    <div className="text-lg font-semibold">
                      {stats.activeDays} / {stats.totalDays}
                    </div>
                    <div className="text-sm text-muted-foreground">Active Days</div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      <DeleteAccountDialog
        isOpen={showDeleteAccount}
        onClose={() => setShowDeleteAccount(false)}
      />

      {categoryToDelete && (
        <CategoryDeleteDialog
          isOpen={true}
          onClose={() => setCategoryToDelete(null)}
          categoryName={categoryToDelete.name}
          onDelete={handleDeleteCategory}
        />
      )}
    </div>
  );
}