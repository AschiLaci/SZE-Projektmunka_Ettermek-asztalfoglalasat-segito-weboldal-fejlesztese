import React from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Square, Circle, Sofa, Frame as Fence, Sprout, AppWindow, 
    DoorOpen, Copy, RefreshCw, XCircle, LayoutTemplate
} from 'lucide-react';

const ElementPalette = ({ onAddElement, onClear, onResetView, onApplyTemplate }) => {
    const elements = [
        { name: 'Table', icon: Square, props: { type: 'table', shape: 'square', seats: 4, width: 60, height: 60 } },
        { name: 'Round Table', icon: Circle, props: { type: 'table', shape: 'round', seats: 2, width: 60, height: 60 } },
        { name: 'Wall', icon: Fence, props: { type: 'wall', width: 200, height: 20 } },
        { name: 'Bar', icon: Sofa, props: { type: 'bar', width: 160, height: 60 } },
        { name: 'Plant', icon: Sprout, props: { type: 'plant', width: 40, height: 40 } },
        { name: 'Window', icon: AppWindow, props: { type: 'window', width: 80, height: 20 } },
        { name: 'Door', icon: DoorOpen, props: { type: 'door', width: 60, height: 80 } },
    ];

    const templates = {
        "Cozy Cafe": [
            { id: 1, type: 'table', shape: 'round', seats: 2, width: 60, height: 60, x: 60, y: 60, rotation: 0, number: 1 },
            { id: 2, type: 'table', shape: 'round', seats: 2, width: 60, height: 60, x: 60, y: 180, rotation: 0, number: 2 },
            { id: 3, type: 'table', shape: 'square', seats: 4, width: 80, height: 80, x: 200, y: 100, rotation: 0, number: 3 },
            { id: 4, type: 'bar', width: 240, height: 60, x: 400, y: 40, rotation: 0 },
            { id: 5, type: 'plant', width: 40, height: 40, x: 20, y: 300, rotation: 0 },
        ],
        "Fine Dining": [
            { id: 1, type: 'table', shape: 'square', seats: 4, width: 80, height: 80, x: 100, y: 100, rotation: 0, number: 1 },
            { id: 2, type: 'table', shape: 'square', seats: 4, width: 80, height: 80, x: 100, y: 240, rotation: 0, number: 2 },
            { id: 3, type: 'table', shape: 'square', seats: 4, width: 80, height: 80, x: 100, y: 380, rotation: 0, number: 3 },
            { id: 4, type: 'table', shape: 'round', seats: 6, width: 100, height: 100, x: 300, y: 180, rotation: 0, number: 4 },
            { id: 5, type: 'table', shape: 'round', seats: 6, width: 100, height: 100, x: 300, y: 340, rotation: 0, number: 5 },
            { id: 6, type: 'wall', width: 20, height: 500, x: 500, y: 40, rotation: 0 },
            { id: 7, type: 'plant', width: 40, height: 40, x: 40, y: 40, rotation: 0 },
        ]
    };

    return (
        <div className="w-full p-2 bg-card/80 backdrop-blur-sm border-b rounded-t-lg shadow-lg">
            <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center space-x-4">
                    <h4 className="text-sm font-semibold px-2 whitespace-nowrap">Add Element</h4>
                    <div className="flex flex-wrap gap-1">
                        {elements.map(({ name, icon: Icon, props }) => (
                            <Button
                                key={name}
                                variant="ghost"
                                size="sm"
                                onClick={() => onAddElement(props)}
                                className="flex flex-col h-auto p-2"
                                title={`Click to add ${name}`}
                            >
                                <Icon className="h-5 w-5" />
                                <span className="text-xs mt-1 text-center">{name}</span>
                            </Button>
                        ))}
                    </div>
                </div>
                <div className="flex items-center space-x-2">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="sm"><LayoutTemplate className="mr-2 h-4 w-4" /> Templates</Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                            <DropdownMenuLabel>Load a Template</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            {Object.keys(templates).map(name => (
                                <DropdownMenuItem key={name} onClick={() => onApplyTemplate(templates[name])}>
                                    {name}
                                </DropdownMenuItem>
                            ))}
                        </DropdownMenuContent>
                    </DropdownMenu>
                    <Button variant="outline" size="sm" onClick={onResetView}><RefreshCw className="mr-2 h-4 w-4" /> Reset View</Button>
                    <Button variant="destructive" size="sm" onClick={onClear}><XCircle className="mr-2 h-4 w-4" /> Clear All</Button>
                </div>
            </div>
        </div>
    );
};

export default ElementPalette;