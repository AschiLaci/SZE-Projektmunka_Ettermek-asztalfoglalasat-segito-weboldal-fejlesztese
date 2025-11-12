import React, { useMemo, useRef } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { MAP_WIDTH, MAP_HEIGHT, GRID_SIZE } from './map-editor/constants';
import { Sprout, DoorOpen } from 'lucide-react';

const MapElement = ({ item, onTableClick }) => {
    const itemStyles = {
        table: {
            square: "rounded-md",
            circle: "rounded-full",
            rectangle: "rounded-md"
        },
        wall: "bg-slate-500",
        bar: "bg-yellow-700/80 border-yellow-900 border-2 rounded-md",
        plant: "bg-green-500/80 border-green-700 border-2 rounded-full",
        window: "bg-blue-300/60 border-blue-500 border-2",
        entry: "bg-amber-600/80 border-amber-800 border",
    };

    const getStyle = () => {
        switch (item.type) {
            case "table":
                const shapeClass = itemStyles.table[item.shape] || itemStyles.table.square;
                return `flex items-center justify-center text-xs font-bold ${shapeClass} ${item.isOccupied ? "bg-red-500/80 border-red-700 cursor-pointer hover:bg-red-600/90" : "bg-green-500/80 border-green-700 cursor-pointer hover:bg-green-600/90"} border-2 transition-colors`;
            case "wall": return itemStyles.wall;
            case "bar": return itemStyles.bar;
            case "plant": return itemStyles.plant;
            case "window": return itemStyles.window;
            case "entry": return itemStyles.entry;
            default: return `bg-gray-300`;
        }
    };

    const handleClick = () => {
        if (item.type === 'table' && onTableClick) {
            onTableClick(item);
        }
    }

    return (
        <motion.div
            layout
            key={item.id}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1, x: item.x, y: item.y, rotate: item.rotation || 0, }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            className='absolute'
            style={{ width: item.width, height: item.height }}
            onClick={handleClick}
        >
            <div className={cn("w-full h-full flex items-center justify-center", getStyle())}>
                {item.type === 'table' && (
                    <div className="text-white text-center select-none">
                        <div>T{item.number}</div>
                        <div>{item.seats}p</div>
                    </div>
                )}
                {item.type === 'bar' && <div className="text-white font-bold text-sm select-none">{item.label || "BAR"}</div>}
                {item.type === 'entry' && <DoorOpen className="text-white/80" />}
                {item.type === 'plant' && <Sprout className="text-white/80" />}
            </div>
        </motion.div>
    );
};

const TableMap = ({ layout, onTableClick }) => {
    const mapRef = useRef(null);

    const gridStyle = useMemo(() => ({
        width: MAP_WIDTH,
        height: MAP_HEIGHT,
        backgroundImage: `
            linear-gradient(to right, var(--muted) 1px, transparent 1px),
            linear-gradient(to bottom, var(--muted) 1px, transparent 1px)
        `,
        backgroundSize: `${GRID_SIZE}px ${GRID_SIZE}px`,
    }), []);

    return (
        <div className="h-full w-full flex flex-col">
            <div className="flex-grow relative overflow-auto rounded-lg bg-card" ref={mapRef}>
                <motion.div
                    className="relative origin-top-left"
                    style={{ width: MAP_WIDTH, height: MAP_HEIGHT }}
                >
                    <div className="absolute inset-0" style={gridStyle}></div>
                    {layout.map((item) => (
                        <MapElement
                            key={item.id}
                            item={item}
                            onTableClick={onTableClick}
                        />
                    ))}
                </motion.div>
            </div>
        </div>
    );
};

export default TableMap;