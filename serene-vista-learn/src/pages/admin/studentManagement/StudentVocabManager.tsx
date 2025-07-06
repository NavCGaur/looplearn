import { useForm } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";
import { 
  openAssignModal, 
  closeAssignModal, 
  openAssignedWordsModal, 
  closeAssignedWordsModal,
   openBulkAssignModal,
  closeBulkAssignModal,
  toggleUserSelection,
  selectAllUsers,
  clearAllSelections
} from "../../../state/slices/userSlice";
import { 
  useGetUsersQuery, 
  useAssignWordToUserMutation,
  useAssignWordToBulkUsersMutation
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
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent } from '@/components/ui/card';


import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "../../../components/ui/accordion";

import { X, Users, Check, AlertCircle } from 'lucide-react';

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


const BulkAssignmentResultModal = ({ isOpen, onClose, results }) => {
  const successCount = results?.filter(r => r.success).length || 0;
  const failureCount = results?.filter(r => !r.success).length || 0;
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {failureCount === 0 ? (
              <>
                <Check className="h-5 w-5 text-green-500" />
                Assignment Successful
              </>
            ) : (
              <>
                <AlertCircle className="h-5 w-5 text-yellow-500" />
                Assignment Results
              </>
            )}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
            <span>Successfully assigned:</span>
            <Badge variant="default" className="bg-green-100 text-green-800">
              {successCount} users
            </Badge>
          </div>
          
          {failureCount > 0 && (
            <div className="flex justify-between items-center p-3 bg-red-50 rounded-lg">
              <span>Failed assignments:</span>
              <Badge variant="destructive">
                {failureCount} users
              </Badge>
            </div>
          )}
          
          {results && results.length > 0 && (
            <div className="max-h-40 overflow-y-auto space-y-2">
              {results.map((result, index) => (
                <div 
                  key={index}
                  className={`flex items-center justify-between p-2 rounded text-sm ${
                    result.success 
                      ? 'bg-green-50 text-green-800' 
                      : 'bg-red-50 text-red-800'
                  }`}
                >
                  <span className="truncate">{result.userName}</span>
                  {result.success ? (
                    <Check className="h-4 w-4 flex-shrink-0" />
                  ) : (
                    <AlertCircle className="h-4 w-4 flex-shrink-0" />
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
        
        <DialogFooter>
          <Button onClick={onClose} variant="outline">
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

// Bulk Selection Floating Action Bar
const BulkSelectionBar = ({ selectedUsers, onBulkAssign, onClearSelection }) => {
  const isMobile = useMediaQuery("(max-width: 768px)");
  
  return (
    <div className={`fixed ${isMobile ? 'bottom-4 left-4 right-4' : 'bottom-8 left-1/2 transform -translate-x-1/2'} z-50`}>
      <Card className="shadow-lg border-2 border-primary/20">
        <CardContent className="p-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Users className="h-5 w-5 text-primary" />
              <span className="font-medium">
                {selectedUsers.length} user{selectedUsers.length !== 1 ? 's' : ''} selected
              </span>
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={onClearSelection}
                className="h-8"
              >
                {isMobile ? <X className="h-4 w-4" /> : 'Clear'}
              </Button>
              <Button
                variant="default"
                size="sm"
                onClick={onBulkAssign}
                className="h-8"
              >
                Assign Word
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};



const StudentVocabManager = () => {
  const dispatch = useDispatch();
  
  //@ts-ignore
  const userState = useSelector((state) => state.user) || { 
    selectedUserId: null, 
    selectedUserIds: [],
    isAssignModalOpen: false, 
    isAssignedWordsModalOpen: false,
    isBulkAssignModalOpen: false,
    bulkAssignResults: null
  };
  
  const { 
    selectedUserId, 
    selectedUserIds,
    isAssignModalOpen, 
    isAssignedWordsModalOpen,
    isBulkAssignModalOpen,
    bulkAssignResults
  } = userState;

  const isMobile = useMediaQuery("(max-width: 768px)");
  
  //@ts-ignore
  const { data: users = [], isLoading, isError, error } = useGetUsersQuery();
  
  const [assignWord, { isLoading: isAssigning, error: assignError }] = useAssignWordToUserMutation();
  const [assignWordToBulk, { isLoading: isBulkAssigning, error: bulkAssignError }] = useAssignWordToBulkUsersMutation();
  
  const singleAssignForm = useForm({
    defaultValues: { word: '' }
  });
  
  const bulkAssignForm = useForm({
    defaultValues: { word: '' }
  });
  
  const selectedUser = users?.find(user => user?.id === selectedUserId) || null;
  const selectedUsers = users?.filter(user => selectedUserIds.includes(user.id)) || [];
  const allUsersSelected = users.length > 0 && selectedUserIds.length === users.length;
  
  // Single user assignment
  const handleSingleAssign = async (data) => {
    if (selectedUserId) {
      try {
        await assignWord({
          userId: selectedUserId,
          wordData: { word: data.word }
        }).unwrap();
        
        singleAssignForm.reset();
        dispatch(closeAssignModal());
      } catch (err) {
        console.error('Failed to assign word:', err);
      }
    }
  };
  
  // Bulk user assignment
  const handleBulkAssign = async (data) => {
    if (selectedUserIds.length > 0) {
      try {
        const result = await assignWordToBulk({
          userIds: selectedUserIds,
          wordData: { word: data.word }
        }).unwrap();
        
        bulkAssignForm.reset();
        dispatch(closeBulkAssignModal());
        dispatch(clearAllSelections());
        
        // Show results modal
        // The results will be handled by the reducer
      } catch (err) {
        console.error('Failed to bulk assign word:', err);
      }
    }
  };
  
  const handleSelectAll = () => {
    if (allUsersSelected) {
      dispatch(clearAllSelections());
    } else {
      dispatch(selectAllUsers(users.map(user => user.id)));
    }
  };
  
  const handleUserToggle = (userId) => {
    dispatch(toggleUserSelection(userId));
  };
  
  const handleBulkAssignClick = () => {
    dispatch(openBulkAssignModal());
  };
  
  const handleClearSelection = () => {
    dispatch(clearAllSelections());
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
        {// @ts-ignore }
  }        <p>{error?.data?.message || error?.error || 'Failed to load student data. Please try again later.'}</p>
      </div>
    );
  }
  
  return (
    <div className="space-y-6 pb-24">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Student Vocabulary Management</h2>
        {selectedUserIds.length > 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleClearSelection}
            className="md:hidden"
          >
            Clear Selection
          </Button>
        )}
      </div>
      
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
                  <TableHead className="w-12">
                    <Checkbox
                      checked={allUsersSelected}
                      onCheckedChange={handleSelectAll}
                      aria-label="Select all users"
                    />
                  </TableHead>
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
                    className={`cursor-pointer transition-colors ${
                      selectedUserIds.includes(user.id) ? 'bg-primary/5' : ''
                    }`}
                    onClick={() => dispatch(openAssignedWordsModal(user.id))}
                  >
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      <Checkbox
                        checked={selectedUserIds.includes(user.id)}
                        onCheckedChange={() => handleUserToggle(user.id)}
                        aria-label={`Select ${user.name}`}
                      />
                    </TableCell>
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
                        variant="default"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          dispatch(openAssignModal(user.id));
                        }}
                      >
                        Assign Word
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}

          {/* Mobile view - Accordion */}
          {isMobile && (
            <div className="space-y-2">
              {users.map((user) => (
                <div key={user.id} className="relative">
                  <div className="absolute top-4 right-4 z-10">
                    <Checkbox
                      checked={selectedUserIds.includes(user.id)}
                      onCheckedChange={() => handleUserToggle(user.id)}
                      aria-label={`Select ${user.name}`}
                    />
                  </div>
                  
                  <Accordion type="single" collapsible>
                    <AccordionItem 
                      value={user.id}
                      className={`transition-colors ${
                        selectedUserIds.includes(user.id) ? 'bg-primary/5' : ''
                      }`}
                    >
                      <AccordionTrigger className="text-left pr-12">
                        {user.name}
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className="grid grid-cols-2 gap-2 p-4">
                          <div className="font-medium">Email:</div>
                          <div>{user.email}</div>
                          
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
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* Bulk Selection Floating Action Bar */}
      {selectedUserIds.length > 0 && (
        <BulkSelectionBar
          selectedUsers={selectedUsers}
          onBulkAssign={handleBulkAssignClick}
          onClearSelection={handleClearSelection}
        />
      )}

      {/* Single User Assignment Modal */}
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
              {// @ts-ignore }
}              {assignError?.data?.message || 'Failed to assign word. Please try again.'}
            </div>
          )}
          
          <Form {...singleAssignForm}>
            <form 
              onSubmit={singleAssignForm.handleSubmit(handleSingleAssign)}
              className="space-y-4"
            >
              <FormField
                control={singleAssignForm.control}
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
                  variant="default"
                >
                  {isAssigning ? 'Adding...' : 'Add Word'}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Bulk Assignment Modal */}
      <Dialog 
        open={isBulkAssignModalOpen} 
        onOpenChange={(open) => !open && dispatch(closeBulkAssignModal())}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Assign Word to Multiple Users
            </DialogTitle>
          </DialogHeader>
          
          <div className="mb-4">
            <p className="text-sm text-gray-600 mb-2">
              Assigning to {selectedUsers.length} user{selectedUsers.length !== 1 ? 's' : ''}:
            </p>
            <div className="max-h-32 overflow-y-auto bg-gray-50 rounded p-2">
              {selectedUsers.map((user) => (
                <div key={user.id} className="text-sm py-1">
                  • {user.name}
                </div>
              ))}
            </div>
          </div>
          
          {bulkAssignError && (
            <div className="p-3 mb-3 text-sm bg-red-50 border border-red-200 text-red-600 rounded">
              {// @ts-ignore }
}                  {bulkAssignError?.data?.message || 'Failed to assign word. Please try again.'}
            </div>
          )}
          
          <Form {...bulkAssignForm}>
            <form 
              onSubmit={bulkAssignForm.handleSubmit(handleBulkAssign)}
              className="space-y-4"
            >
              <FormField
                control={bulkAssignForm.control}
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
                  disabled={isBulkAssigning}
                  variant="default"
                >
                  {isBulkAssigning ? 'Assigning...' : `Assign to ${selectedUsers.length} Users`}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Bulk Assignment Results Modal */}
      <BulkAssignmentResultModal
        isOpen={!!bulkAssignResults}
        onClose={() => dispatch({ type: 'user/clearBulkAssignResults' })}
        results={bulkAssignResults}
      />

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
};

export default StudentVocabManager;