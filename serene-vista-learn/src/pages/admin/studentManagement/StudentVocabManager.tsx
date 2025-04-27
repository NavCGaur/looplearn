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
                  <TableHead>Assigned Words Count</TableHead>
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