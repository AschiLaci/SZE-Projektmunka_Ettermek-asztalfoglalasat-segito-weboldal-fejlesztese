import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import MapEditor from '@/components/restaurant/map-editor/MapEditor';

const FloorPlanEditorDialog = ({ isOpen, onClose, onSave, restaurantName, initialLayout }) => {
  const [currentLayout, setCurrentLayout] = useState([]);

  useEffect(() => {
    if (isOpen) {
      setCurrentLayout(initialLayout || []);
    }
  }, [initialLayout, isOpen]);

  const handleSave = () => {
    onSave(currentLayout);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-7xl h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Edit Floor Plan: {restaurantName}</DialogTitle>
          <DialogDescription>
            Arrange tables, walls, and other elements for this restaurant's layout.
          </DialogDescription>
        </DialogHeader>
        <div className="flex-grow h-full overflow-hidden">
          <MapEditor layout={currentLayout} onLayoutChange={setCurrentLayout} />
        </div>
        <DialogFooter className="mt-4">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="button" onClick={handleSave}>Save Floor Plan</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default FloorPlanEditorDialog;