import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Flame, Book, Mic, Pen, Lightbulb, TrendingUp } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { ActivityChart } from "./ActivityChart";
import { AccuracyTrend } from "./AccuracyTrend";

const mockActivityData = [
  { day: "Mon", sessions: 2 },
  { day: "Tue", sessions: 4 },
  { day: "Wed", sessions: 3 },
  { day: "Thu", sessions: 5 },
  { day: "Fri", sessions: 2 },
  { day: "Sat", sessions: 6 },
  { day: "Sun", sessions: 4 },
];

const StatsOverview = () => {
  return (
    <div className="grid gap-6 p-6">
      {/* Streak and Activity */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-lg font-medium">Current Streak</CardTitle>
            <Flame className="h-5 w-5 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-orange-500">7 Days</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-lg font-medium">Weekly Activity</CardTitle>
          </CardHeader>
          <CardContent className="h-[150px]">
            <ActivityChart data={mockActivityData} />
          </CardContent>
        </Card>
      </div>

      {/* Feature Metrics */}
      <div className="grid gap-6 md:grid-cols-3">
        {/* Vocabulary Stats */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-lg font-medium">Vocabulary</CardTitle>
            <Book className="h-5 w-5 text-blue-500" />
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm">Words Mastered</span>
              <span className="font-bold">248</span>
            </div>
            <div>
              <span className="text-sm">Retention Rate</span>
              <Progress value={85} className="mt-2" />
            </div>
            <div className="flex flex-wrap gap-2">
              <Badge variant="destructive">consider</Badge>
              <Badge variant="destructive">although</Badge>
              <Badge variant="destructive">therefore</Badge>
            </div>
            <div className="text-sm text-muted-foreground">
              Next review in 2 days
            </div>
          </CardContent>
        </Card>

        {/* Speech Stats */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-lg font-medium">Speech</CardTitle>
            <Mic className="h-5 w-5 text-green-500" />
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm">Pronunciation Score</span>
              <span className="font-bold">87/100</span>
            </div>
            <div>
              <span className="text-sm">Native Comparison</span>
              <Progress value={75} className="mt-2" />
            </div>
            <div className="flex flex-wrap gap-2">
              <Badge>th</Badge>
              <Badge>r</Badge>
              <Badge>l</Badge>
            </div>
            <div className="text-sm text-muted-foreground">
              Most practiced sounds
            </div>
          </CardContent>
        </Card>

        {/* Grammar Stats */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-lg font-medium">Grammar</CardTitle>
            <Pen className="h-5 w-5 text-purple-500" />
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm">Rules Completed</span>
              <span className="font-bold">32/40</span>
            </div>
            <div>
              <span className="text-sm">Writing Fluency</span>
              <Progress value={70} className="mt-2" />
            </div>
            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary">Article Usage</Badge>
              <Badge variant="secondary">Past Perfect</Badge>
            </div>
            <div className="text-sm text-muted-foreground">
              Common mistakes
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Accuracy Trend */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-lg font-medium">Accuracy Trend</CardTitle>
          <TrendingUp className="h-5 w-5 text-green-500" />
        </CardHeader>
        <CardContent className="h-[200px]">
          <AccuracyTrend />
        </CardContent>
      </Card>

      {/* Improvement Tips */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-lg font-medium">Improvement Tips</CardTitle>
          <Lightbulb className="h-5 w-5 text-yellow-500" />
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            <li className="flex items-start gap-2">
              <span className="text-sm">• Focus on practicing 'th' sounds in daily conversations</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-sm">• Review past perfect tense exercises</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-sm">• Schedule vocabulary review for weak words</span>
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
};

export default StatsOverview;
