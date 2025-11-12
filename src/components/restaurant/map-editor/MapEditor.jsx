import React, { useState, useRef, useMemo, useEffect } from 'react';
import { motion } from 'framer-motion';
import DraggableItem from './DraggableItem';
import InspectorPanel from './InspectorPanel';
import ElementPalette from './ElementPalette';
import { MAP_WIDTH, MAP_HEIGHT, GRID_SIZE } from './constants';
import { snapToGrid } from './utils';

const MapEditor = ({ layout, onLayoutChange }) => {
  const [selectedId, setSelectedId] = useState(null);
  const mapRef = useRef(null);
  
  const currentLayout = Array.isArray(layout) ? layout : [];

  useEffect(() => {
    if (!currentLayout.find(item => item.id === selectedId)) {
      setSelectedId(null);
    }
  }, [currentLayout, selectedId]);

  const enforceBoundaries = (item) => {
    const boundedItem = { ...item };
    const width = boundedItem.width || 50;
    const height = boundedItem.height || 50;

    if (boundedItem.x < 0) boundedItem.x = 0;
    if (boundedItem.y < 0) boundedItem.y = 0;
    if (boundedItem.x + width > MAP_WIDTH) boundedItem.x = MAP_WIDTH - width;
    if (boundedItem.y + height > MAP_HEIGHT) boundedItem.y = MAP_HEIGHT - height;

    return boundedItem;
  };

  const handleUpdate = (id, props) => {
    const newLayout = currentLayout.map((item) => {
      if (item.id === id) {
        const updatedItem = { ...item, ...props };
        return enforceBoundaries(updatedItem);
      }
      return item;
    });
    onLayoutChange(newLayout);
  };
  
  const handleDelete = (id) => {
    onLayoutChange(currentLayout.filter(item => item.id !== id));
    setSelectedId(null);
  };
  
  const handleSelect = (id) => setSelectedId(id);

  const handleAddElement = (props) => {
    const tableNumbers = currentLayout.filter(i => i.type === 'table').map(i => i.number || 0);
    const nextTableNumber = tableNumbers.length > 0 ? Math.max(...tableNumbers) + 1 : 1;

    const newItem = {
      id: Date.now(),
      x: snapToGrid(mapRef.current ? mapRef.current.scrollLeft + GRID_SIZE : GRID_SIZE),
      y: snapToGrid(mapRef.current ? mapRef.current.scrollTop + GRID_SIZE : GRID_SIZE),
      rotation: 0,
      ...props,
      ...(props.type === 'table' && { number: nextTableNumber, isOccupied: false }),
    };

    onLayoutChange([...currentLayout, newItem]);
    setSelectedId(newItem.id);
  };

  const handleDuplicate = (id) => {
    const itemToDuplicate = currentLayout.find(item => item.id === id);
    if (!itemToDuplicate) return;

    const tableNumbers = currentLayout.filter(i => i.type === 'table').map(i => i.number || 0);
    const nextTableNumber = tableNumbers.length > 0 ? Math.max(...tableNumbers) + 1 : 1;

    const newItem = {
        ...itemToDuplicate,
        id: Date.now(),
        x: snapToGrid(itemToDuplicate.x + GRID_SIZE),
        y: snapToGrid(itemToDuplicate.y + GRID_SIZE),
        ...(itemToDuplicate.type === 'table' && { number: nextTableNumber, isOccupied: false }),
    };
    
    const boundedNewItem = enforceBoundaries(newItem);
    onLayoutChange([...currentLayout, boundedNewItem]);
    setSelectedId(boundedNewItem.id);
  };

  const handleClear = () => {
    onLayoutChange([]);
    setSelectedId(null);
  };

  const handleResetView = () => {
    if (mapRef.current) {
        mapRef.current.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
    }
  };

  const handleApplyTemplate = (template) => {
    const newLayout = template.map(item => ({
        ...item,
        id: item.id + Date.now(),
        isOccupied: false,
    }));
    onLayoutChange(newLayout);
    setSelectedId(null);
  };

  const gridStyle = useMemo(() => ({
    width: MAP_WIDTH,
    height: MAP_HEIGHT,
    backgroundImage: `
      linear-gradient(to right, var(--muted) 1px, transparent 1px),
      linear-gradient(to bottom, var(--muted) 1px, transparent 1px)
    `,
    backgroundSize: `${GRID_SIZE}px ${GRID_SIZE}px`,
  }), []);
  
  const selectedItem = useMemo(() => currentLayout.find(item => item.id === selectedId), [currentLayout, selectedId]);

  return (
    <div className="h-full w-full flex flex-col">
      <ElementPalette 
        onAddElement={handleAddElement} 
        onClear={handleClear}
        onResetView={handleResetView}
        onApplyTemplate={handleApplyTemplate}
      />
      <div className="flex-grow relative overflow-auto rounded-b-lg bg-card" ref={mapRef} onClick={(e) => { if (e.target === mapRef.current || (e.target.style && e.target.style.width === `${MAP_WIDTH}px`)) setSelectedId(null); }}>
        <motion.div 
            className="relative origin-top-left"
            style={{width: MAP_WIDTH, height: MAP_HEIGHT}}
        >
          <motion.div className="absolute inset-0" style={gridStyle}></motion.div>
          {currentLayout.map((item) => (
            <DraggableItem
              key={item.id}
              item={item}
              onUpdate={handleUpdate}
              onSelect={handleSelect}
              isSelected={item.id === selectedId}
            />
          ))}
        </motion.div>
        
        <InspectorPanel item={selectedItem} onUpdate={handleUpdate} onDelete={handleDelete} onDuplicate={handleDuplicate} />
      </div>
    </div>
  );
};

export default MapEditor;