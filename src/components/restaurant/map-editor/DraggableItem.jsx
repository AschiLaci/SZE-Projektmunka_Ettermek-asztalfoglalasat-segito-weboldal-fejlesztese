import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { MAP_WIDTH, MAP_HEIGHT, GRID_SIZE } from './constants';
import { snapToGrid } from './utils';
import { Sprout, DoorOpen } from 'lucide-react';

const DraggableItem = ({ item, onUpdate, onSelect, isSelected }) => {
  const handleDragEnd = (event, info) => {
    const newX = snapToGrid(item.x + info.offset.x);
    const newY = snapToGrid(item.y + info.offset.y);

    const itemWidth = item.width || 50;
    const itemHeight = item.height || 50;

    const boundedX = Math.max(0, Math.min(newX, MAP_WIDTH - itemWidth));
    const boundedY = Math.max(0, Math.min(newY, MAP_HEIGHT - itemHeight));

    onUpdate(item.id, {
      x: boundedX,
      y: boundedY,
    });
  };

  const itemStyles = {
    table: {
      square: "rounded-md",
      round: "rounded-full",
    },
    wall: "bg-slate-500",
    bar: "bg-yellow-700/80 border-yellow-900 border-2 rounded-md",
    plant: "bg-green-500/80 border-green-700 border-2 rounded-full",
    window: "bg-blue-300/60 border-blue-500 border-2",
    door: "bg-amber-600/80 border-amber-800 border",
  };

  const getStyle = () => {
    switch (item.type) {
      case "table":
        return `flex items-center justify-center text-xs font-bold ${itemStyles.table[item.shape]} ${item.isOccupied ? "bg-red-400/80 border-red-600" : "bg-green-400/80 border-green-600"} border-2`;
      case "wall": return itemStyles.wall;
      case "bar": return itemStyles.bar;
      case "plant": return itemStyles.plant;
      case "window": return itemStyles.window;
      case "door": return itemStyles.door;
      default: return `bg-gray-300`;
    }
  };
  
  const width = item.width || 50;
  const height = item.height || 50;

  return (
    <motion.div
      key={item.id}
      drag
      dragMomentum={false}
      onDragEnd={handleDragEnd}
      onTap={() => onSelect(item.id)}
      initial={{ x: item.x, y: item.y, rotate: item.rotation || 0 }}
      animate={{ x: item.x, y: item.y, rotate: item.rotation || 0 }}
      whileDrag={{ zIndex: 50, scale: 1.05 }}
      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
      className={cn(
        'absolute cursor-grab active:cursor-grabbing',
        isSelected && 'ring-2 ring-blue-400 ring-offset-2 ring-offset-card'
      )}
      style={{ width, height }}
    >
      <div className={cn("w-full h-full flex items-center justify-center", getStyle())}>
        {item.type === 'table' && (
          <div className="text-white text-center select-none">
            <div>T{item.number}</div>
            <div>{item.seats}p</div>
          </div>
        )}
        {item.type === 'bar' && <div className="text-white font-bold text-sm select-none">BAR</div>}
        {item.type === 'door' && <DoorOpen className="text-white/80" />}
        {item.type === 'plant' && <Sprout className="text-white/80" />}
      </div>
    </motion.div>
  );
};

export default DraggableItem;