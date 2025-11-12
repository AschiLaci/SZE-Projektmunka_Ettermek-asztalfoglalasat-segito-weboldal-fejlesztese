import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { GRID_SIZE } from './constants';
import { Trash2, RotateCw, Copy, Square, Circle } from 'lucide-react';

const InspectorPanel = ({ item, onUpdate, onDelete, onDuplicate }) => {
  if (!item) return null;
  
  const handleUpdate = (props) => onUpdate(item.id, props);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, x: '100%' }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: '100%' }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        className="absolute right-0 top-0 h-full w-64 bg-card/80 backdrop-blur-sm border-l p-4 space-y-6 overflow-y-auto"
      >
        <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold capitalize">{item.type} Properties</h3>
            <Button variant="ghost" size="icon" onClick={() => onDuplicate(item.id)} title="Duplicate Element">
                <Copy className="h-4 w-4" />
            </Button>
        </div>
        
        {(item.type !== 'table') && (
          <>
            <div>
              <label className="text-sm font-medium">Width: {item.width}</label>
              <Slider value={[item.width]} onValueChange={v => handleUpdate({ width: v[0] })} min={20} max={500} step={GRID_SIZE} />
            </div>
            <div>
              <label className="text-sm font-medium">Height: {item.height}</label>
              <Slider value={[item.height]} onValueChange={v => handleUpdate({ height: v[0] })} min={20} max={500} step={GRID_SIZE} />
            </div>
            <div>
              <label className="text-sm font-medium">Rotation: {item.rotation}°</label>
              <div className="flex items-center space-x-2">
                <Slider value={[item.rotation]} onValueChange={v => handleUpdate({ rotation: v[0] })} min={0} max={359} step={1} />
                <Button size="icon" variant="ghost" onClick={() => handleUpdate({ rotation: (item.rotation + 90) % 360 })}>
                  <RotateCw className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </>
        )}

        {item.type === 'table' && (
          <>
            <div>
              <label className="text-sm font-medium">Width: {item.width}</label>
              <Slider value={[item.width]} onValueChange={v => handleUpdate({ width: v[0] })} min={20} max={500} step={GRID_SIZE} />
            </div>
            <div>
              <label className="text-sm font-medium">Height: {item.height}</label>
              <Slider value={[item.height]} onValueChange={v => handleUpdate({ height: v[0] })} min={20} max={500} step={GRID_SIZE} />
            </div>
             <div>
              <label className="text-sm font-medium">Rotation: {item.rotation}°</label>
              <div className="flex items-center space-x-2">
                <Slider value={[item.rotation]} onValueChange={v => handleUpdate({ rotation: v[0] })} min={0} max={359} step={1} />
                <Button size="icon" variant="ghost" onClick={() => handleUpdate({ rotation: (item.rotation + 90) % 360 })}>
                  <RotateCw className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium">Seats: {item.seats}</label>
              <Slider value={[item.seats]} onValueChange={v => handleUpdate({ seats: v[0] })} min={1} max={12} step={1} />
            </div>
            <div>
              <label className="text-sm font-medium">Shape</label>
              <div className="flex space-x-2 mt-2">
                <Button size="sm" variant={item.shape === 'square' ? 'secondary' : 'ghost'} onClick={() => handleUpdate({ shape: 'square' })}><Square/></Button>
                <Button size="sm" variant={item.shape === 'round' ? 'secondary' : 'ghost'} onClick={() => handleUpdate({ shape: 'round' })}><Circle/></Button>
              </div>
            </div>
          </>
        )}
        
        <Button variant="destructive" size="sm" onClick={() => onDelete(item.id)} className="w-full">
          <Trash2 className="mr-2 h-4 w-4" /> Delete Element
        </Button>
      </motion.div>
    </AnimatePresence>
  );
};

export default InspectorPanel;