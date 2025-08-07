"use client";

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { AlertTriangle } from 'lucide-react';

interface CategoryDeleteDialogProps {
  isOpen: boolean;
  onClose: () => void;
  categoryName: string;
  onDelete: (deleteType: 'soft' | 'hard') => void;
}

export function CategoryDeleteDialog({ 
  isOpen, 
  onClose, 
  categoryName, 
  onDelete 
}: CategoryDeleteDialogProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async (deleteType: 'soft' | 'hard') => {
    setIsDeleting(true);
    await onDelete(deleteType);
    setIsDeleting(false);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <div className="flex items-center space-x-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            <DialogTitle>Delete Category: {categoryName}</DialogTitle>
          </div>
          <DialogDescription className="pt-2 space-y-3">
            <p>Choose how you want to handle this category:</p>
            <div className="space-y-2 text-sm">
              <div className="p-3 bg-muted rounded-md">
                <strong>Stop Tracking:</strong> Keep historical data but remove from future tracking
              </div>
              <div className="p-3 bg-destructive/10 rounded-md">
                <strong>Delete Permanently:</strong> Remove category and ALL associated activity data
              </div>
            </div>
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex space-x-2">
          <Button variant="outline" onClick={onClose} disabled={isDeleting}>
            Cancel
          </Button>
          <Button
            variant="secondary"
            onClick={() => handleDelete('soft')}
            disabled={isDeleting}
          >
            Stop Tracking
          </Button>
          <Button
            variant="destructive"
            onClick={() => handleDelete('hard')}
            disabled={isDeleting}
          >
            Delete Permanently
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}