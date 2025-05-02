import {useEffect} from "react";
import { useSelector, useDispatch } from "react-redux";
import { setWords } from "../../state/slices/vocabSlice.ts";
import { Outlet } from "react-router-dom";
import GuestDashboardNavbar from "@/components/dashboard/guestDashboard/GuestDashboardNavbar";
import GuestDashboardSidebar from "../../components/dashboard/guestDashboard/GuestDashboardSidebar";
import { useGetPracticeWordsQuery } from '../../state/api/vocabApi.ts'


const GuestDashboard = () => {


    const dispatch = useDispatch();
  // @ts-ignore
    const userId = useSelector((state) => state.auth?.user?.uid);

    
   const { 
    data: words, 
    isLoading, 
    error,
    refetch 
  } = useGetPracticeWordsQuery(userId);
  
  console.log("RTK Query state:", { isLoading, hasData: !!words, error });
  
  useEffect(() => {
    if (words) {
      console.log("Words received from RTK Query:", words);
      dispatch(setWords(words));
    }
  }, [words, dispatch]);


  
  return (
    <div className="min-h-screen bg-gray-50 border w-full">
    <GuestDashboardNavbar />
    <div className="flex">
      <GuestDashboardSidebar />
      <main className="flex-1 mt-16 flex items-center justify-center min-h-[calc(100vh-4rem)] p-6">
        <Outlet />
      </main>
    </div>
  </div>
  );
};

export default GuestDashboard;