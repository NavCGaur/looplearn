
import React from "react";
//@ts-ignore
import LeaderBoard from "../../components/leaderBoard/LeaderBoard";
import { Card, CardContent } from "@/components/ui/card";

const LeaderBoardPage: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="bg-white shadow-lg border-none">
        <CardContent className="p-6">
          <LeaderBoard />
        </CardContent>
      </Card>
    </div>
  );
};

export default LeaderBoardPage;