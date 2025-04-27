import { useGetUserByIdQuery, useRemoveWordFromUserMutation } from '../../../state/api/userApi';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../../components/ui/dialog';
import { Button } from "../../../components/ui/button";
import { Spinner } from "../../../components/ui/spinner";

const StudentAssignedWords = ({ studentId, isOpen, onClose }) => {
  const { 
    data: student, 
    isLoading, 
    isError, 
    error 
  } = useGetUserByIdQuery(studentId, {
    skip: !isOpen || !studentId
  });
  
  const [removeWord, { 
    isLoading: isRemoving, 
    error: removeError 
  }] = useRemoveWordFromUserMutation();
  
  const handleRemoveWord = async (wordId) => {
    if (!wordId || !studentId) return;
    
    try {
      await removeWord({ userId: studentId, wordId }).unwrap();
    } catch (err) {
      console.error('Failed to remove word:', err);
      // You could add UI feedback for errors here
    }
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>
            {student?.name || 'Student'}'s Vocabulary Words
          </DialogTitle>
        </DialogHeader>
        
        {removeError && (
          <div className="p-3 mb-3 text-sm bg-red-50 border border-red-200 text-red-600 rounded">
            <h3 className="font-bold mb-2">Error</h3>
            {/* @ts-ignore */}
            {removeError?.data?.message || 'Failed to remove word. Please try again.'}
          </div>
        )}
        
        {isLoading ? (
          <div className="flex justify-center p-6">
            <Spinner />
          </div>
        ) : isError ? (
          <div className="p-4 text-red-500 border border-red-300 rounded-md bg-red-50">
            <h3 className="font-bold mb-2">Error</h3>
            {/* @ts-ignore */}
            <p>{error?.data?.message || error?.error || 'Failed to load student vocabulary'}</p>
          </div>
        ) : (
          <div className="overflow-y-auto max-h-96">
            {student?.vocabulary?.length > 0 ? (
              <table className="w-full border-collapse">
                <thead className="bg-muted">
                  <tr>
                    <th className="p-2 text-left">Word</th>
                    <th className="p-2 text-left">Definition</th>
                    <th className="p-2 text-left">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {student.vocabulary.map((item) => (
                    <tr key={item.wordId || `word-${Math.random()}`} className="border-b">
                      <td className="p-2">{item.word || 'Unknown'}</td>
                      <td className="p-2">{item.definition || 'No definition available'}</td>
                      <td className="p-2">
                        <Button 
                          variant="destructive" 
                          size="sm"
                          onClick={() => handleRemoveWord(item.wordId)}
                          disabled={isRemoving}
                        >
                          {isRemoving ? 'Removing...' : 'Remove'}
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p className="text-center p-4">No words assigned yet.</p>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default StudentAssignedWords;