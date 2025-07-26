import { useForm } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";
import { useState } from "react";
import { 
  openAssignModal, 
  closeAssignModal, 
  openAssignedWordsModal, 
  closeAssignedWordsModal,
  openBulkAssignModal,
  closeBulkAssignModal,
  toggleUserSelection,
  selectAllUsers,
  clearAllSelections,                     
  openDeleteModal,
  closeDeleteModal,
  openBulkDeleteModal,
  closeBulkDeleteModal
} from "../../../state/slices/userSlice";
import { 
  useGetUsersQuery, 
  useAssignWordToUserMutation,
  useAssignWordToBulkUsersMutation,
  useDeleteUserMutation,
  useDeleteBulkUsersMutation
} from "../../../state/api/userApi";

// UI Components
import { 
  Table, 
  TableHeader, 
  TableBody, 
  TableHead, 
  TableRow, 
  TableCell 
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// Icons
import { 
  X, 
  Users, 
  Check, 
  AlertCircle, 
  MoreHorizontal,
  UserX,
  Trash2,
  AlertTriangle
} from 'lucide-react';

// Hooks
import useMediaQuery from '../../../hooks/use-media-query.ts';

// Components
import StudentAssignedWords from "./StudentAssignedWords";

/**
 * Formats user activity data for display
 */
const formatActivityData = (user) => {
  const features = [
    { id: 'vocabSpacedRepetition', name: 'Spaced Repetition' },
    { id: 'vocabQuiz', name: 'Vocabulary Quiz' },
  ];
  
  const activities = features.map(feature => ({
    featureId: feature.id,
    featureName: feature.name,
    timestamp: user.latestFeatureAccess?.[feature.id] || null
  }));
  
  const validActivities = activities
    .filter(activity => activity.timestamp !== null)
    //@ts-ignore
    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    
  return validActivities.length > 0 ? validActivities[0] : null;
};

/**
 * Formats relative time display
 */
const formatRelativeTime = (dateString) => {
  if (!dateString) return "Never used";
  
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return "Invalid date";
  
  const now = new Date();
  //@ts-ignore
  const diffInSeconds = Math.floor((now - date) / 1000);
  
  if (diffInSeconds < 60) return 'Just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
  
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

/**
 * Formats exact time for tooltip
 */
const formatExactTime = (dateString) => {
  if (!dateString) return "";
  
  const date = new Date(dateString);
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

/**
 * Activity Cell Component
 */
const ActivityCell = ({ user }) => {
  const activity = formatActivityData(user);
  
  if (!activity) {
    return <span className="text-gray-400">No activity</span>;
  }
  
  const tooltipContent = `Feature: ${activity.featureName}\nAccessed: ${formatExactTime(activity.timestamp)}`;
  
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger className="inline-flex">
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
        <TooltipContent side="top" className="text-sm bg-white shadow-lg border p-3">
          <div className="whitespace-pre-line">{tooltipContent}</div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

/**
 * Bulk Assignment Result Modal
 */
const BulkAssignmentResultModal = ({ isOpen, onClose, results }) => {
 const safeResults = Array.isArray(results) ? results : [];
  const successCount = safeResults.filter(r => r.success).length;
  const failureCount = safeResults.filter(r => !r.success).length;
  
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
              <Badge variant="destructive">{failureCount} users</Badge>
            </div>
          )}
          
          {safeResults && safeResults.length > 0 && (
            <div className="max-h-40 overflow-y-auto space-y-2">
              {safeResults.map((result, index) => (
                <div 
                  key={index}
                  className={`flex items-center justify-between p-2 rounded text-sm ${
                    // @ts-ignore
                    safeResults.success 
                      ? 'bg-green-50 text-green-800' 
                      : 'bg-red-50 text-red-800'
                  }`}
                >
                  <span className="truncate">{safeResults.
                  
                        //@ts-ignore
                        userName}</span>
                  {safeResults.
                        //@ts-ignore
                        success ? (
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
          <Button onClick={onClose} variant="outline">Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

/**
 * Delete Confirmation Modal
 */
const DeleteConfirmationModal = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  isLoading, 
  user, 
  isBulk = false, 
  userCount = 0 
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-red-600">
            <AlertTriangle className="h-5 w-5" />
            {isBulk ? 'Delete Multiple Users' : 'Delete User'}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-800">
              <strong>Warning:</strong> This action cannot be undone.
            </p>
          </div>
          
          {isBulk ? (
            <div>
              <p className="text-sm text-gray-600 mb-2">
                You are about to delete <strong>{userCount}</strong> user{userCount !== 1 ? 's' : ''}.
              </p>
              <p className="text-sm text-gray-600">
                All their assigned words and progress will be permanently removed.
              </p>
            </div>
          ) : (
            <div>
              <p className="text-sm text-gray-600 mb-2">
                Are you sure you want to delete <strong>{user?.name}</strong>?
              </p>
              <p className="text-sm text-gray-600">
                All their assigned words and progress will be permanently removed.
              </p>
            </div>
          )}
        </div>
        
        <DialogFooter className="gap-2">
          <Button 
            onClick={onClose} 
            variant="outline"
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button 
            onClick={onConfirm}
            variant="destructive"
            disabled={isLoading}
          >
            {isLoading ? 'Deleting...' : `Delete ${isBulk ? 'Users' : 'User'}`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

/**
 * Enhanced Bulk Selection Floating Action Bar
 */
const BulkSelectionBar = ({ 
  selectedUsers, 
  onBulkAssign, 
  onBulkDelete, 
  onClearSelection 
}) => {
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
                variant="destructive"
                size="sm"
                onClick={onBulkDelete}
                className="h-8"
              >
                {isMobile ? <Trash2 className="h-4 w-4" /> : 'Delete'}
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

/**
 * User Actions Dropdown
 */
const UserActionsDropdown = ({ user, onAssign, onDelete, onViewWords }) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={onAssign}>
          Assign Word
        </DropdownMenuItem>
        <DropdownMenuItem onClick={onViewWords}>
          View Words
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={onDelete}
          className="text-red-600 focus:text-red-600"
        >
          <UserX className="h-4 w-4 mr-2" />
          Delete User
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

/**
 * Main Student Vocabulary Manager Component
 */
const StudentVocabManager = () => {
  const dispatch = useDispatch();
  const [deleteResults, setDeleteResults] = useState(null);
  //@ts-ignore
  const userState = useSelector((state) => state.user) || { 
    selectedUserId: null, 
    selectedUserIds: [],
    isAssignModalOpen: false, 
    isAssignedWordsModalOpen: false,
    isBulkAssignModalOpen: false,
    isDeleteModalOpen: false,
    isBulkDeleteModalOpen: false,
    bulkAssignResults: null
  };
  
  const { 
    selectedUserId, 
    selectedUserIds,
    isAssignModalOpen, 
    isAssignedWordsModalOpen,
    isBulkAssignModalOpen,
    isDeleteModalOpen,
    isBulkDeleteModalOpen,
    bulkAssignResults
  } = userState;

  const isMobile = useMediaQuery("(max-width: 768px)");
  
  // API Hooks
  //@ts-ignore
  const { data: users = [], isLoading, isError, error } = useGetUsersQuery();
  const [assignWord, { isLoading: isAssigning, error: assignError }] = useAssignWordToUserMutation();
  const [assignWordToBulk, { isLoading: isBulkAssigning, error: bulkAssignError }] = useAssignWordToBulkUsersMutation();
  const [deleteUser, { isLoading: isDeleting }] = useDeleteUserMutation();
  const [deleteBulkUsers, { isLoading: isBulkDeleting }] = useDeleteBulkUsersMutation();
  
  // Forms
  const singleAssignForm = useForm({ defaultValues: { word: '' } });
  const bulkAssignForm = useForm({ defaultValues: { word: '' } });
  
  // Computed values
  const selectedUser = users?.find(user => user?.id === selectedUserId) || null;
  const selectedUsers = users?.filter(user => selectedUserIds.includes(user.id)) || [];
  const allUsersSelected = users.length > 0 && selectedUserIds.length === users.length;
  
  // Event Handlers
  const handleSingleAssign = async (data) => {
    if (!selectedUserId) return;
    
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
  };
  
  const handleBulkAssign = async (data) => {
    if (selectedUserIds.length === 0) return;
    
    try {
      await assignWordToBulk({
        userIds: selectedUserIds,
        wordData: { word: data.word }
      }).unwrap();
      
      bulkAssignForm.reset();
      dispatch(closeBulkAssignModal());
      dispatch(clearAllSelections());
    } catch (err) {
      console.error('Failed to bulk assign word:', err);
    }
  };
  
  const handleDeleteUser = async () => {
    if (!selectedUserId) return;
    
    try {
      await deleteUser(selectedUserId).unwrap();
      dispatch(closeDeleteModal());
    } catch (err) {
      console.error('Failed to delete user:', err);
    }
  };
  
  const handleBulkDelete = async () => {
    if (selectedUserIds.length === 0) return;
    
    try {
      const result = await deleteBulkUsers(selectedUserIds).unwrap();
      setDeleteResults(result);
      dispatch(closeBulkDeleteModal());
      dispatch(clearAllSelections());
    } catch (err) {
      console.error('Failed to bulk delete users:', err);
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
  
  // Loading and Error States
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
        {//@ts-ignore
        <p>{error?.data?.message || error?.error || 'Failed to load student data. Please try again later.'}</p>
  }
      </div>
    );
  }
  
  return (
    <div className="space-y-6 pb-24">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Student Vocabulary Management</h2>
        {selectedUserIds.length > 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => dispatch(clearAllSelections())}
            className="md:hidden"
          >
            Clear Selection
          </Button>
        )}
      </div>
      
      {/* Content */}
      {users.length === 0 ? (
        <div className="text-center p-6 bg-gray-50 rounded-md">
          <p>No students found. Please add students to the system.</p>
        </div>
      ) : (
        <>
          {/* Desktop Table View */}
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
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      <UserActionsDropdown
                        user={user}
                        onAssign={() => dispatch(openAssignModal(user.id))}
                        onDelete={() => dispatch(openDeleteModal(user.id))}
                        onViewWords={() => dispatch(openAssignedWordsModal(user.id))}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}

          {/* Mobile Accordion View */}
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
                            
                            <Button
                              variant="destructive"
                              size="sm"
                              className="w-full"
                              onClick={() => dispatch(openDeleteModal(user.id))}
                            >
                              <UserX className="h-4 w-4 mr-2" />
                              Delete User
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
          onBulkAssign={() => dispatch(openBulkAssignModal())}
          onBulkDelete={() => dispatch(openBulkDeleteModal())}
          onClearSelection={() => dispatch(clearAllSelections())}
        />
      )}

      {/* Modals */}
      
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
              
              {assignError?.
              //@ts-ignore
              data?.message || 'Failed to assign word. Please try again.'}
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
              {bulkAssignError?.
              //@ts-ignore
              data?.message || 'Failed to assign word. Please try again.'}
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

      {/* Delete Single User Modal */}
      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => dispatch(closeDeleteModal())}
        onConfirm={handleDeleteUser}
        isLoading={isDeleting}
        user={selectedUser}
      />

      {/* Delete Multiple Users Modal */}
      {//@ts-ignore
      <DeleteConfirmationModal
        isOpen={isBulkDeleteModalOpen}
        onClose={() => dispatch(closeBulkDeleteModal())}
        onConfirm={handleBulkDelete}
        isLoading={isBulkDeleting}
        isBulk={true}
        userCount={selectedUsers.length}
      />}

      {/* Bulk Assignment Results Modal */}
      <BulkAssignmentResultModal
        isOpen={!!bulkAssignResults}
        onClose={() => dispatch({ type: 'user/clearBulkAssignResults' })}
        results={bulkAssignResults}
      />

      {/* Delete Results Modal */}
      <BulkAssignmentResultModal
        isOpen={!!deleteResults}
        onClose={() => setDeleteResults(null)}
        results={deleteResults}
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