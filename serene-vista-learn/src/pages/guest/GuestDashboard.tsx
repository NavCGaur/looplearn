import { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { setWords } from "../../state/slices/vocabSlice.ts";
import { Outlet } from "react-router-dom";
import GuestDashboardNavbar from "@/components/dashboard/guestDashboard/GuestDashboardNavbar";
import GuestDashboardSidebar from "../../components/dashboard/guestDashboard/GuestDashboardSidebar";
import { useGetPracticeWordsQuery } from "../../state/api/vocabApi.ts";
import { useGetScienceWordsQuery } from "../../state/api/scienceApi.ts";
import { Loader2 } from "lucide-react"; // ShadCN-compatible loader icon
import { cn } from "@/lib/utils"; // utility from shadcn for className merging

const GuestDashboard = () => {
  const dispatch = useDispatch();
  // @ts-ignore
  const userId = useSelector((state) => state.auth?.user?.uid);

  const {
    data: words,
    isLoading:isloadingWords,
    error,
    refetch,
  } = useGetPracticeWordsQuery(userId);

  const { 
    data: scienceWords,
    isLoading: isLoadingScience,
    error: errorScience,
    refetch: refetchScience,
  } = useGetScienceWordsQuery(userId);

  useEffect(() => {
    if (words) {
      dispatch(setWords(words));
    };

    if (scienceWords) {
      dispatch(setWords(scienceWords));
    }
  }, [words, , scienceWords, dispatch]);

  return (
    <div className="min-h-screen bg-gray-50 border w-full">
      <GuestDashboardNavbar />
      <div className="flex">
        <GuestDashboardSidebar />
        <main className="flex-1 mt-16 flex items-center justify-center min-h-[calc(100vh-4rem)] p-2">
          {isloadingWords ? (
            <Loader2 className={cn("h-10 w-10 animate-spin text-primary")} />
          ) : (
            <Outlet />
          )}
        </main>
      </div>
    </div>
  );
};

export default GuestDashboard;
