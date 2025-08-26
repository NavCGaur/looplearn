import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { 
  useGetAllUsersQuery, 
  useGetUserByIdQuery, 
  useAssignWordMutation, 
  useAssignWordToBulkUsersMutation,
  useRemoveWordMutation,
  useRemoveWordFromUserMutation,
  useDeleteUserMutation,
  useDeleteUsersByIdsMutation
} from "@/state/api/userApi";
import { Trash2, UserPlus, Users, BookOpen, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

interface AssignWordFormData {
  word: string;
  subject: string;
}

interface User {
  id: string;
  name: string;
  email: string;
  vocabulary: Array<{
    _id: string;
    wordId: string;
    rating?: number;
    lastReviewed?: string;
    nextReviewDate?: string;
    addedAt: string;
  }>;
  assignedWords?: Array<{
    _id: string;
    wordId: string;
    word: string;
    definition: string;
    addedAt: string;
  }>;
  classStandard?: string;
  vocabularyCount?: number;
}

const CLASS_STANDARDS = [
  'class-6', 'class-7', 'class-8', 'class-9', 'class-10', 'class-11', 'class-12'
];

const SUBJECTS = [
  'English', 'Hindi', 'Mathematics', 'Science', 'Social Studies', 'Computer Science'
];

const StudentVocabManager: React.FC = () => {
  // Form states
  const [selectedUserId, setSelectedUserId] = useState<string>('');
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  const [selectedClassStandard, setSelectedClassStandard] = useState<string>('');
  const [selectedWordIds, setSelectedWordIds] = useState<string[]>([]);
  const [wordForm, setWordForm] = useState<AssignWordFormData>({
    word: '',
    subject: 'English'
  });
  const [classWordForm, setClassWordForm] = useState<AssignWordFormData>({
    word: '',
    subject: 'English'
  });

  const { toast } = useToast();

  // API hooks
  const { data: users = [], isLoading: isLoadingUsers, refetch: refetchUsers } = useGetAllUsersQuery();
  const { data: selectedUser, isLoading: isLoadingUser } = useGetUserByIdQuery(selectedUserId, {
    skip: !selectedUserId
  });

  // Clear selected words when user changes
  React.useEffect(() => {
    setSelectedWordIds([]);
  }, [selectedUserId]);

  // Mutations
  const [assignWord, { isLoading: isAssigningWord }] = useAssignWordMutation();
  const [assignWordToBulk, { isLoading: isAssigningBulk }] = useAssignWordToBulkUsersMutation();
  const [removeWordFromUser, { isLoading: isRemovingWord }] = useRemoveWordFromUserMutation();
  const [removeWord] = useRemoveWordMutation();
  const [deleteUser] = useDeleteUserMutation();
  const [deleteUsers] = useDeleteUsersByIdsMutation();

  // Filter users by class standard
  const getUsersByClass = (classStandard: string) => {
    if (!classStandard) return [];
    
    // Debug: log all users and their classStandard values
    console.log('=== CLASS ASSIGNMENT DEBUG ===');
    console.log('All users with their classStandard values:');
    users.forEach(u => {
      console.log(`- ${u.name}: classStandard = "${u.classStandard}" (type: ${typeof u.classStandard})`);
    });
    console.log('Looking for classStandard:', classStandard);
    
    // Try exact match first
    let filteredUsers = users.filter((user: User) => user.classStandard === classStandard);
    console.log('Exact match results:', filteredUsers.length, 'users');
    
    // If no exact match, try flexible matching (handle different formats)
    if (filteredUsers.length === 0) {
      const classNumber = classStandard.replace('class-', '');
      console.log('Trying flexible matching for class number:', classNumber);
      
      filteredUsers = users.filter((user: User) => {
        if (!user.classStandard) return false;
        const userClass = user.classStandard.toString().toLowerCase();
        const matches = (
          userClass === classNumber ||
          userClass === `class-${classNumber}` ||
          userClass === `class ${classNumber}` ||
          userClass === `${classNumber}th` ||
          userClass === `${classNumber}st` ||
          userClass === `${classNumber}nd` ||
          userClass === `${classNumber}rd`
        );
        if (matches) {
          console.log(`- Flexible match: ${user.name} (${userClass}) matches ${classStandard}`);
        }
        return matches;
      });
    }
    
    console.log('Final filtered users for class:', classStandard, '=', filteredUsers.length, 'users');
    console.log('================================');
    return filteredUsers;
  };

  // Get available class standards (static list)
  const getAvailableClasses = () => {
    return CLASS_STANDARDS;
  };

  // Handle individual word assignment
  const handleAssignWord = async () => {
    if (!selectedUserId || !wordForm.word.trim()) {
      toast({
        title: "Error",
        description: "Please select a user and enter a word",
        variant: "destructive"
      });
      return;
    }

    try {
      await assignWord({
        userId: selectedUserId,
        wordData: wordForm
      }).unwrap();

      toast({
        title: "Success",
        description: "Word assigned successfully",
      });

      setWordForm({ word: '', subject: 'English' });
      refetchUsers();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error?.data?.message || "Failed to assign word",
        variant: "destructive"
      });
    }
  };

  // Handle bulk word assignment to selected users
  const handleBulkAssignWord = async () => {
    if (selectedUserIds.length === 0 || !wordForm.word.trim()) {
      toast({
        title: "Error",
        description: "Please select users and enter a word",
        variant: "destructive"
      });
      return;
    }

    try {
      const result = await assignWordToBulk({
        userIds: selectedUserIds,
        wordData: wordForm
      }).unwrap();

      toast({
        title: "Success",
        description: `Words assigned to ${result.successCount} users successfully`,
      });

      setWordForm({ word: '', subject: 'English' });
      setSelectedUserIds([]);
      refetchUsers();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error?.data?.message || "Failed to assign words",
        variant: "destructive"
      });
    }
  };

  // Handle class-based word assignment
  const handleClassAssignWord = async () => {
    if (!selectedClassStandard || !classWordForm.word.trim()) {
      toast({
        title: "Error",
        description: "Please select a class and enter a word",
        variant: "destructive"
      });
      return;
    }

    const classUsers = getUsersByClass(selectedClassStandard);
    if (classUsers.length === 0) {
      toast({
        title: "Error",
        description: "No users found in the selected class",
        variant: "destructive"
      });
      return;
    }

    try {
      const userIds = classUsers.map(user => user.id);
      const result = await assignWordToBulk({
        userIds,
        wordData: classWordForm
      }).unwrap();

      toast({
        title: "Success",
        description: `Words assigned to ${result.successCount} students in class ${selectedClassStandard}`,
      });

      setClassWordForm({ word: '', subject: 'English' });
      refetchUsers();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error?.data?.message || "Failed to assign words to class",
        variant: "destructive"
      });
    }
  };

  // Handle word removal
  const handleRemoveWord = async (wordId: string) => {
    if (!selectedUserId) return;

    try {
      await removeWordFromUser({ userId: selectedUserId, wordId }).unwrap();
      toast({
        title: "Success",
        description: "Word removed successfully",
      });
      refetchUsers();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error?.data?.message || "Failed to remove word",
        variant: "destructive"
      });
    }
  };

  // Handle removing word from all users in a class
  const handleClassRemoveWord = async (wordText: string, classStandard: string) => {
    const usersInClass = getUsersByClass(classStandard);
    
    if (usersInClass.length === 0) {
      toast({
        title: "Error",
        description: "No users found in selected class",
        variant: "destructive"
      });
      return;
    }

    try {
      for (const user of usersInClass) {
        const wordToRemove = user.vocabulary?.find(w => w.word === wordText);
        if (wordToRemove) {
          await removeWordFromUser({ userId: user.id, wordId: wordToRemove.wordId || wordToRemove._id }).unwrap();
        }
      }
      
      toast({
        title: "Success",
        description: `Word "${wordText}" removed from all students in class`,
      });
      refetchUsers();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error?.data?.message || "Failed to remove word from class",
        variant: "destructive"
      });
    }
  };

  // Handle word selection for bulk removal
  const handleWordSelection = (wordId: string, checked: boolean) => {
    if (checked) {
      setSelectedWordIds(prev => [...prev, wordId]);
    } else {
      setSelectedWordIds(prev => prev.filter(id => id !== wordId));
    }
  };

  // Handle select all words toggle
  const handleSelectAllWords = (checked: boolean) => {
    if (checked && selectedUser?.vocabulary) {
      const allWordIds = selectedUser.vocabulary.map(item => item.wordId || item._id);
      setSelectedWordIds(allWordIds);
    } else {
      setSelectedWordIds([]);
    }
  };

  // Handle bulk word removal
  const handleBulkRemoveWords = async () => {
    if (!selectedUserId || selectedWordIds.length === 0) {
      toast({
        title: "Error",
        description: "Please select words to remove",
        variant: "destructive"
      });
      return;
    }

    try {
      for (const wordId of selectedWordIds) {
        await removeWordFromUser({ userId: selectedUserId, wordId }).unwrap();
      }
      
      toast({
        title: "Success",
        description: `${selectedWordIds.length} words removed successfully`,
      });
      setSelectedWordIds([]);
      refetchUsers();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error?.data?.message || "Failed to remove words",
        variant: "destructive"
      });
    }
  };

  // Handle user selection for bulk operations
  const handleUserSelection = (userId: string, checked: boolean) => {
    if (checked) {
      setSelectedUserIds(prev => [...prev, userId]);
    } else {
      setSelectedUserIds(prev => prev.filter(id => id !== userId));
    }
  };

  // Handle select all users in class
  const handleSelectAllInClass = (classStandard: string) => {
    const classUsers = getUsersByClass(classStandard);
    const classUserIds = classUsers.map(user => user.id);
    
    const allSelected = classUserIds.every(id => selectedUserIds.includes(id));
    
    if (allSelected) {
      setSelectedUserIds(prev => prev.filter(id => !classUserIds.includes(id)));
    } else {
      setSelectedUserIds(prev => [...new Set([...prev, ...classUserIds])]);
    }
  };

  if (isLoadingUsers) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading students...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <BookOpen className="h-6 w-6" />
        <h2 className="text-2xl font-bold">Student Vocabulary Manager</h2>
      </div>

      <Tabs defaultValue="individual" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="individual" className="flex items-center gap-2">
            <UserPlus className="h-4 w-4" />
            Individual Assignment
          </TabsTrigger>
          <TabsTrigger value="bulk" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Bulk Assignment
          </TabsTrigger>
          <TabsTrigger value="class" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Class Assignment
          </TabsTrigger>
        </TabsList>

        {/* Individual Assignment Tab */}
        <TabsContent value="individual" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Assignment Form */}
            <Card>
              <CardHeader>
                <CardTitle>Assign Words to Student</CardTitle>
                <CardDescription>
                  Select a student and assign vocabulary words
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="student-select">Select Student</Label>
                  <Select value={selectedUserId} onValueChange={setSelectedUserId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a student" />
                    </SelectTrigger>
                    <SelectContent>
                      {users.map((user: User) => (
                        <SelectItem key={user.id} value={user.id}>
                          <div className="flex items-center justify-between w-full">
                            <span>{user.name}</span>
                            <div className="flex items-center gap-2">
                              {user.classStandard && (
                                <Badge variant="outline" className="text-xs">
                                  {user.classStandard}
                                </Badge>
                              )}
                              <Badge variant="secondary" className="text-xs">
                                {user.vocabulary?.length || 0} words
                              </Badge>
                            </div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="word-input">Words (comma-separated)</Label>
                  <Input
                    id="word-input"
                    value={wordForm.word}
                    onChange={(e) => setWordForm(prev => ({ ...prev, word: e.target.value }))}
                    placeholder="Enter words separated by commas"
                  />
                </div>

                <div>
                  <Label htmlFor="subject-select">Subject</Label>
                  <Select 
                    value={wordForm.subject} 
                    onValueChange={(value) => setWordForm(prev => ({ ...prev, subject: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {SUBJECTS.map(subject => (
                        <SelectItem key={subject} value={subject}>
                          {subject}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <Button 
                  onClick={handleAssignWord} 
                  disabled={isAssigningWord || !selectedUserId || !wordForm.word.trim()}
                  className="w-full"
                >
                  {isAssigningWord ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Assigning...
                    </>
                  ) : (
                    'Assign Words'
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* Student Details */}
            {selectedUserId && (
              <Card>
                <CardHeader>
                  <CardTitle>Student Vocabulary</CardTitle>
                  <CardDescription>
                    Manage {selectedUser?.name}'s assigned words
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoadingUser ? (
                    <div className="flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Loading vocabulary...
                    </div>
                  ) : selectedUser?.vocabulary?.length > 0 ? (
                    <div className="space-y-4">
                      {/* Bulk selection controls */}
                      <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={selectedUser.vocabulary.length > 0 && selectedWordIds.length === selectedUser.vocabulary.length}
                            onChange={(e) => handleSelectAllWords(e.target.checked)}
                            className="rounded"
                          />
                          <span className="text-sm font-medium">
                            Select All ({selectedUser.vocabulary.length} words)
                          </span>
                        </div>
                        {selectedWordIds.length > 0 && (
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={handleBulkRemoveWords}
                            disabled={isRemovingWord}
                          >
                            {isRemovingWord ? (
                              <>
                                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                Removing...
                              </>
                            ) : (
                              <>
                                <Trash2 className="h-4 w-4 mr-2" />
                                Remove Selected ({selectedWordIds.length})
                              </>
                            )}
                          </Button>
                        )}
                      </div>

                      {/* Word list */}
                      <div className="space-y-2 max-h-96 overflow-y-auto">
                        {selectedUser.vocabulary.map((item: any) => {
                          const wordId = item.wordId || item._id;
                          return (
                            <div
                              key={wordId}
                              className="flex items-center gap-3 p-3 border rounded-lg"
                            >
                              <input
                                type="checkbox"
                                checked={selectedWordIds.includes(wordId)}
                                onChange={(e) => handleWordSelection(wordId, e.target.checked)}
                                className="rounded"
                              />
                              <div className="flex-1">
                                <div className="font-medium">{item.word || 'Unknown Word'}</div>
                                <div className="text-sm text-muted-foreground">
                                  {item.definition || 'No definition available'}
                                </div>
                              </div>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleRemoveWord(wordId)}
                                disabled={isRemovingWord}
                              >
                                {isRemovingWord ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  <Trash2 className="h-4 w-4" />
                                )}
                              </Button>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ) : (
                    <Alert>
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>
                        No words assigned to this student yet.
                      </AlertDescription>
                    </Alert>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        {/* Bulk Assignment Tab */}
        <TabsContent value="bulk" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Bulk Assignment Form */}
            <Card>
              <CardHeader>
                <CardTitle>Bulk Word Assignment</CardTitle>
                <CardDescription>
                  Select multiple students and assign words to all of them
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Words (comma-separated)</Label>
                  <Input
                    value={wordForm.word}
                    onChange={(e) => setWordForm(prev => ({ ...prev, word: e.target.value }))}
                    placeholder="Enter words separated by commas"
                  />
                </div>

                <div>
                  <Label>Subject</Label>
                  <Select 
                    value={wordForm.subject} 
                    onValueChange={(value) => setWordForm(prev => ({ ...prev, subject: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {SUBJECTS.map(subject => (
                        <SelectItem key={subject} value={subject}>
                          {subject}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    {selectedUserIds.length} students selected
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedUserIds([])}
                    disabled={selectedUserIds.length === 0}
                  >
                    Clear Selection
                  </Button>
                </div>

                <Button 
                  onClick={handleBulkAssignWord} 
                  disabled={isAssigningBulk || selectedUserIds.length === 0 || !wordForm.word.trim()}
                  className="w-full"
                >
                  {isAssigningBulk ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Assigning...
                    </>
                  ) : (
                    `Assign to ${selectedUserIds.length} Students`
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* Student Selection */}
            <Card>
              <CardHeader>
                <CardTitle>Select Students</CardTitle>
                <CardDescription>
                  Choose students for bulk word assignment
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {/* Group by class */}
                  {getAvailableClasses().map(classStandard => {
                    const classUsers = getUsersByClass(classStandard);
                    const allSelected = classUsers.every(user => selectedUserIds.includes(user.id));
                    
                    return (
                      <div key={classStandard} className="space-y-2">
                        <div className="flex items-center justify-between p-2 bg-muted rounded">
                          <div className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={allSelected}
                              onChange={() => handleSelectAllInClass(classStandard)}
                            />
                            <span className="font-medium">{classStandard.replace('-', ' ').toUpperCase()}</span>
                            <Badge variant="outline">{classUsers.length} students</Badge>
                          </div>
                        </div>
                        
                        {classUsers.map(user => (
                          <div key={user.id} className="flex items-center gap-2 pl-6">
                            <input
                              type="checkbox"
                              checked={selectedUserIds.includes(user.id)}
                              onChange={(e) => handleUserSelection(user.id, e.target.checked)}
                            />
                            <span className="flex-1">{user.name}</span>
                            <Badge variant="secondary" className="text-xs">
                              {user.vocabulary?.length || 0} words
                            </Badge>
                          </div>
                        ))}
                      </div>
                    );
                  })}
                  
                  {/* Users without class */}
                  {users.filter((user: User) => !user.classStandard).length > 0 && (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 p-2 bg-muted rounded">
                        <span className="font-medium">No Class Assigned</span>
                        <Badge variant="outline">
                          {users.filter((user: User) => !user.classStandard).length} students
                        </Badge>
                      </div>
                      
                      {users.filter((user: User) => !user.classStandard).map(user => (
                        <div key={user.id} className="flex items-center gap-2 pl-6">
                          <input
                            type="checkbox"
                            checked={selectedUserIds.includes(user.id)}
                            onChange={(e) => handleUserSelection(user.id, e.target.checked)}
                          />
                          <span className="flex-1">{user.name}</span>
                          <Badge variant="secondary" className="text-xs">
                            {user.vocabulary?.length || 0} words
                          </Badge>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Class Assignment Tab */}
        <TabsContent value="class" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Class Assignment Form */}
            <Card>
              <CardHeader>
                <CardTitle>Assign Words to Entire Class</CardTitle>
                <CardDescription>
                  Select a class and assign words to all students in that class
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="class-select">Select Class</Label>
                  <Select value={selectedClassStandard} onValueChange={setSelectedClassStandard}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a class" />
                    </SelectTrigger>
                    <SelectContent>
                      {getAvailableClasses().map(classStandard => {
                        const classUsers = getUsersByClass(classStandard);
                        return (
                          <SelectItem key={classStandard} value={classStandard}>
                            <div className="flex items-center justify-between w-full">
                              <span>{classStandard.replace('-', ' ').toUpperCase()}</span>
                              <Badge variant="outline" className="text-xs ml-2">
                                {classUsers.length} students
                              </Badge>
                            </div>
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="class-word-input">Words (comma-separated)</Label>
                  <Input
                    id="class-word-input"
                    value={classWordForm.word}
                    onChange={(e) => setClassWordForm(prev => ({ ...prev, word: e.target.value }))}
                    placeholder="Enter words separated by commas"
                  />
                </div>

                <div>
                  <Label htmlFor="class-subject-select">Subject</Label>
                  <Select 
                    value={classWordForm.subject} 
                    onValueChange={(value) => setClassWordForm(prev => ({ ...prev, subject: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {SUBJECTS.map(subject => (
                        <SelectItem key={subject} value={subject}>
                          {subject}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {selectedClassStandard && (
                  <Alert>
                    <CheckCircle className="h-4 w-4" />
                    <AlertDescription>
                      Words will be assigned to all {getUsersByClass(selectedClassStandard).length} students in Class {selectedClassStandard}
                    </AlertDescription>
                  </Alert>
                )}

                <Button 
                  onClick={handleClassAssignWord} 
                  disabled={isAssigningBulk || !selectedClassStandard || !classWordForm.word.trim()}
                  className="w-full"
                >
                  {isAssigningBulk ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Assigning...
                    </>
                  ) : (
                    `Assign to Class ${selectedClassStandard}`
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* Class Overview */}
            <Card>
              <CardHeader>
                <CardTitle>Class Overview</CardTitle>
                <CardDescription>
                  Students and their vocabulary progress by class
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {getAvailableClasses().map(classStandard => {
                    const classUsers = getUsersByClass(classStandard);
                    const totalWords = classUsers.reduce((sum, user) => sum + (user.vocabularyCount || 0), 0);
                    const avgWords = classUsers.length > 0 ? Math.round(totalWords / classUsers.length) : 0;
                    
                    return (
                      <div key={classStandard} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-medium">{classStandard.replace('-', ' ').toUpperCase()}</h3>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline">{classUsers.length} students</Badge>
                            <Badge variant="secondary">{avgWords} avg words</Badge>
                          </div>
                        </div>
                        
                        <div className="space-y-1">
                          {classUsers.slice(0, 5).map(user => (
                            <div key={user.id} className="flex items-center justify-between text-sm">
                              <span>{user.name}</span>
                              <span className="text-muted-foreground">
                                {user.vocabularyCount || 0} words
                              </span>
                            </div>
                          ))}
                          {classUsers.length > 5 && (
                            <div className="text-sm text-muted-foreground">
                              +{classUsers.length - 5} more students
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default StudentVocabManager;
