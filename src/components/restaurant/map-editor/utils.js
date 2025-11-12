import { GRID_SIZE } from './constants';

export const snapToGrid = (value) => Math.round(value / GRID_SIZE) * GRID_SIZE;