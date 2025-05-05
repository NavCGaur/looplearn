import { useForm } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";
import { 
  openAssignModal, 
  closeAssignModal, 
  openAssignedWordsModal, 
  closeAssignedWordsModal 
} from "../../../state/slices/userSlice";
import { 
  useGetUsersQuery, 
  useAssignWordToUserMutation 
} from "../../../state/api/userApi";

import { 
  Table, 
  TableHeader, 
  TableBody, 
  TableHead, 
  TableRow, 
  TableCell,
  
} from "../../../components/ui/table";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import { Badge } from "../../../components/ui/badge";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { 
  Dialog, 
  DialogContent, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from "../../../components/ui/dialog";
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel 
} from "../../../components/ui/form";
import { Spinner } from "../../../components/ui/spinner";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "../../../components/ui/accordion";
import  useMediaQuery  from '../../../hooks/use-media-query.ts';

import StudentAssignedWords from "./StudentAssignedWords";


const formatActivityData = (user) => {
  // Define all possible features with display names
  const features = [
    { id: 'vocabSpacedRepetition', name: 'Spaced Repetition' },
    { id: 'vocabQuiz', name: 'Vocabulary Quiz' },
    // Add more features as they're implemented
  ];
  
  // Create array of feature activities with timestamps
  const activities = features.map(feature => ({
    featureId: feature.id,
    featureName: feature.name,
    timestamp: user.latestFeatureAccess?.[feature.id] || null
  }));
  
  // Filter out null timestamps and sort by most recent
  const validActivities = activities
    .filter(activity => activity.timestamp !== null)
    .sort(//@ts-ignore
      (a, b) => new Date(b.timestamp) - new Date(a.timestamp)
    );
    
  // Return the most recent activity or null if none
  return validActivities.length > 0 ? validActivities[0] : null;
};

// Step 2: Format relative time (from your existing code)
const formatRelativeTime = (dateString) => {
  if (!dateString) return "Never used";
  
  const date = new Date(dateString);
  
  // Check if date is valid
  if (isNaN(date.getTime())) return "Invalid date";
  
  const now = new Date();
  //@ts-ignore
  const diffInSeconds = Math.floor((now - date) / 1000);
  
  // Less than a minute
  if (diffInSeconds < 60) {
    return 'Just now';
  }
  
  // Less than an hour
  if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60);
    return `${minutes}m ago`;
  }
  
  // Less than a day
  if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600);
    return `${hours}h ago`;
  }
  
  // Less than a week
  if (diffInSeconds < 604800) {
    const days = Math.floor(diffInSeconds / 86400);
    return `${days}d ago`;
  }
  
  // Default: standard date format
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric'
  });
};

// Step 3: Format exact time for tooltip
const formatExactTime = (dateString) => {
  if (!dateString) return "";
  
  const date = new Date(dateString);
  
  // Check if date is valid
  if (isNaN(date.getTime())) return "";
  
  return date.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });
};


const ActivityCell = ({ user }) => {
  const activity = formatActivityData(user);
  
  if (!activity) {
    return <span className="text-gray-400">No activity</span>;
  }
  
  const tooltipContent = `Feature: ${activity.featureName}\nAccessed: ${formatExactTime(activity.timestamp)}`;
  
  return (
    <TooltipProvider>
      <Tooltip>
        {/* Changed from asChild to direct control */}
        <TooltipTrigger className="inline-flex">
          {/* Mobile-friendly click target */}
          <button 
            className="text-left appearance-none focus:outline-none"
            aria-label="View activity details"
          >
            <span className="flex items-center">
              <span className="font-medium">{activity.featureName}</span>
              <span className="mx-1 text-gray-400">•</span>
              <span className="text-gray-500">
                {formatRelativeTime(activity.timestamp)}
              </span>
            </span>
          </button>
        </TooltipTrigger>
        
        <TooltipContent 
          side="top" 
          className="text-sm bg-white shadow-lg border p-3"
        >
          <div className="whitespace-pre-line">
            {tooltipContent}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};



const StudentVocabManager = () => {
  const dispatch = useDispatch();
  
  // Add error handling for selector
  // @ts-ignore
  const userState = useSelector((state) => state.user) || { 
    selectedUserId: null, 
    isAssignModalOpen: false, 
    isAssignedWordsModalOpen: false 
  };
  
  const { selectedUserId, isAssignModalOpen, isAssignedWordsModalOpen } = userState;

  const isMobile = useMediaQuery("(max-width: 768px)");

  
  //@ts-ignore
  const {     data: users = [],     isLoading,     isError,    error   } = useGetUsersQuery();

  console.log("RTK Query state:", users);
  
  const [assignWord, { isLoading: isAssigning, error: assignError }] = useAssignWordToUserMutation();
  
  const form = useForm({
    defaultValues: {
      word: ''
    }
  });
  
  const selectedUser = users?.find(user => user?.id === selectedUserId) || null;
  
  const handleSubmit = async (data) => {
    if (selectedUserId) {
      try {
        await assignWord({
          userId: selectedUserId,
          wordData: {
            word: data.word
          }
        }).unwrap();
        
        form.reset();
        dispatch(closeAssignModal());
      } catch (err) {
        console.error('Failed to assign word:', err);
        // You could add UI feedback for errors here
      }
    }
  };
  
  if (isLoading) {
    return (
      <div className="flex justify-center p-10">
        <Spinner />
      </div>
    );
  }
  
  if (isError) {
    return (
      <div className="p-6 text-red-500 border border-red-300 rounded-md bg-red-50">
        <h3 className="font-bold mb-2">Error loading data</h3>
       {/* @ts-ignore */} 
        <p>{error?.data?.message || error?.error || 'Failed to load student data. Please try again later.'}</p>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Student Vocabulary Management</h2>
      
      {users.length === 0 ? (
        <div className="text-center p-6 bg-gray-50 rounded-md">
          <p>No students found. Please add students to the system.</p>
        </div>
      ) : (
        <>
          {/* Desktop view - Table */}
          {!isMobile && (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Last Activity</TableHead>
                  <TableHead>Words Count</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow 
                    key={user.id}
                    className="cursor-pointer"
                    onClick={() => dispatch(openAssignedWordsModal(user.id))}
                  >
                    <TableCell>{user.name}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      <ActivityCell user={user} />
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">
                        {user.assignedWords?.length || 0} words
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="default" // Changed from outline to default to match current theme
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation(); // Prevent row click event
                          dispatch(openAssignModal(user.id));
                        }}
                      >
                        Assign New Word
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}

          {/* Mobile view - Accordion */}
         {/* Mobile view - Accordion */}
          {isMobile && (
            <div className="space-y-2">
              {users.map((user) => (
                <Accordion type="single" collapsible key={user.id}>
                  <AccordionItem value={user.id}>
                    <AccordionTrigger className="text-left">
                      {user.name}
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="grid grid-cols-2 gap-2 p-4">
                        <div className="font-medium">Email:</div>
                        <div>{user.email}</div>
                        
                        {/* Add Last Activity row */}
                        <div className="font-medium">Last Activity:</div>
                        <div>
                          <ActivityCell user={user} />
                        </div>
                        
                        <div className="font-medium">Assigned Words:</div>
                        <div>
                          <Badge variant="secondary">
                            {user.assignedWords?.length || 0} words
                          </Badge>
                        </div>
                        
                        <div className="col-span-2 mt-4 space-y-2">
                          <Button
                            variant="default"
                            size="sm"
                            className="w-full"
                            onClick={() => dispatch(openAssignModal(user.id))}
                          >
                            Assign New Word
                          </Button>
                          
                          <Button
                            variant="outline"
                            size="sm"
                            className="w-full"
                            onClick={() => dispatch(openAssignedWordsModal(user.id))}
                          >
                            View Assigned Words
                          </Button>
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              ))}
            </div>
          )}
          
        </>
      )}

      {/* Assign New Word Modal */}
      <Dialog 
        open={isAssignModalOpen} 
        onOpenChange={(open) => !open && dispatch(closeAssignModal())}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Assign New Word to {selectedUser?.name || ''}
            </DialogTitle>
          </DialogHeader>
          
          {assignError && (
            <div className="p-3 mb-3 text-sm bg-red-50 border border-red-200 text-red-600 rounded">
              {/* @ts-ignore */}
              {assignError?.data?.message || 'Failed to assign word. Please try again.'}
            </div>
          )}
          
          <Form {...form}>
            <form 
              onSubmit={form.handleSubmit(handleSubmit)}
              className="space-y-4"
            >
              <FormField
                control={form.control}
                name="word"
                rules={{ required: "Word is required" }}
                render={({ field, fieldState }) => (
                  <FormItem>
                    <FormLabel>Word</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Enter new word" />
                    </FormControl>
                    {fieldState.error && (
                      <p className="text-sm text-red-500">{fieldState.error.message}</p>
                    )}
                  </FormItem>
                )}
              />
              
              <DialogFooter className="mt-4">
                <Button 
                  type="submit"
                  disabled={isAssigning}
                  variant="default" // Using default variant to match theme
                >
                  {isAssigning ? 'Adding...' : 'Add Word'}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* View Assigned Words Modal */}
      {selectedUserId && (
        <StudentAssignedWords
          studentId={selectedUserId}
          isOpen={isAssignedWordsModalOpen}
          onClose={() => dispatch(closeAssignedWordsModal())}
        />
      )}
    </div>
  );
}


export default StudentVocabManager;