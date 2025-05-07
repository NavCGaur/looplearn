import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from '@/components/ui/dialog';
import { useMediaQuery } from '@/hooks/use-mobile';
import { Box } from '@mui/material';
import VocabCardDetail from './VocabCardDetail';

const VocabDetailModal = ({ word, open, onClose }) => {
  const isMobile = useMediaQuery('(max-width: 640px)');

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="sm:max-w-md md:max-w-lg lg:max-w-xl">
        <DialogTitle className="text-center text-lg font-semibold text-gray-900">
          Word Details
        </DialogTitle>
        <div className="p-0 sm:p-4">
          <Box sx={{ 
              p: { xs: 1, sm: 2 }, 
              maxHeight: '70vh',
              overflowY: 'auto'
          }}>
            <VocabCardDetail 
              word={word} 
              expanded={true}
              showCloseButton={true}
              onClose={onClose}
              isMobile={isMobile}
            />
          </Box>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default VocabDetailModal;