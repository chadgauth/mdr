import { Point, Rectangle, NumberEntity } from '../types';
import { GameConfig, LayoutConstants, FourTempers } from '../utils/constants';
import { useGameStore } from '../stores/gameStore';

export class WorldSystem {
  private static instance: WorldSystem;
  
  // Grid and viewport properties
  private worldGridSize = GameConfig.world.gridSize;
  private cellSize = GameConfig.world.cellSize;
  private cellSpacing = GameConfig.world.cellSpacing;
  private viewportMargin = LayoutConstants.gridMargin;
  
  // Spatial partitioning for performance
  private spatialGrid: Map<string, NumberEntity[]> = new Map();
  private spatialGridSize = 100; // Grid cell size for spatial partitioning
  
  private constructor() {
    this.initializeSpatialGrid();
  }
  
  static getInstance(): WorldSystem {
    if (!WorldSystem.instance) {
      WorldSystem.instance = new WorldSystem();
    }
    return WorldSystem.instance;
  }
  
  private initializeSpatialGrid(): void {
    const cols = Math.ceil(this.getWorldWidth() / this.spatialGridSize);
    const rows = Math.ceil(this.getWorldHeight() / this.spatialGridSize);
    
    for (let x = 0; x < cols; x++) {
      for (let y = 0; y < rows; y++) {
        this.spatialGrid.set(`${x},${y}`, []);
      }
    }
  }
  
  // Coordinate conversion methods
  screenToWorld(screenPos: Point): Point {
    const { viewport, scale } = useGameStore.getState().world;
    return {
      x: (screenPos.x - viewport.x) / scale,
      y: (screenPos.y - viewport.y) / scale,
    };
  }
  
  worldToScreen(worldPos: Point): Point {
    const { viewport, scale } = useGameStore.getState().world;
    return {
      x: worldPos.x * scale + viewport.x,
      y: worldPos.y * scale + viewport.y,
    };
  }
  
  // World dimensions
  getWorldWidth(): number {
    return this.worldGridSize.cols * (this.cellSize + this.cellSpacing);
  }
  
  getWorldHeight(): number {
    return this.worldGridSize.rows * (this.cellSize + this.cellSpacing);
  }
  
  getVisibleViewport(): Rectangle {
    const { viewport, scale } = useGameStore.getState().world;
    return {
      x: viewport.x,
      y: viewport.y,
      width: viewport.width,
      height: viewport.height,
    };
  }
  
  // Viewport management
  updateViewportCenter(center: Point): void {
    const { viewport, scale } = useGameStore.getState().world;
    const viewportWidth = viewport.width / scale;
    const viewportHeight = viewport.height / scale;
    
    // Calculate new viewport position to center on the given point
    const newViewport = {
      x: center.x - viewportWidth / 2,
      y: center.y - viewportHeight / 2,
      width: viewport.width,
      height: viewport.height,
    };
    
    // Apply world boundaries
    const boundedViewport = this.constrainToWorldBounds(newViewport);
    
    useGameStore.getState().updateViewport(boundedViewport);
  }
  
  panViewport(deltaX: number, deltaY: number): void {
    const { viewport } = useGameStore.getState().world;
    const newViewport = {
      ...viewport,
      x: viewport.x + deltaX,
      y: viewport.y + deltaY,
    };
    
    const boundedViewport = this.constrainToWorldBounds(newViewport);
    useGameStore.getState().updateViewport(boundedViewport);
  }
  
  private constrainToWorldBounds(viewport: Rectangle): Rectangle {
    const worldWidth = this.getWorldWidth();
    const worldHeight = this.getWorldHeight();
    
    return {
      x: Math.max(-this.viewportMargin, Math.min(worldWidth - viewport.width + this.viewportMargin, viewport.x)),
      y: Math.max(-this.viewportMargin, Math.min(worldHeight - viewport.height + this.viewportMargin, viewport.y)),
      width: viewport.width,
      height: viewport.height,
    };
  }
  
  // Grid cell management
  getGridCellAt(worldPos: Point): { col: number; row: number } {
    const col = Math.floor(worldPos.x / (this.cellSize + this.cellSpacing));
    const row = Math.floor(worldPos.y / (this.cellSize + this.cellSpacing));
    
    return { col, row };
  }
  
  getGridCellCenter(col: number, row: number): Point {
    return {
      x: col * (this.cellSize + this.cellSpacing) + this.cellSize / 2,
      y: row * (this.cellSize + this.cellSpacing) + this.cellSize / 2,
    };
  }
  
  // Number entity management
  addNumber(number: NumberEntity): void {
    useGameStore.getState().addNumber(number);
    this.updateSpatialGrid(number);
  }
  
  updateNumberPosition(number: NumberEntity, newPosition: Point): void {
    useGameStore.getState().updateNumber(number.id, { position: newPosition, worldPosition: newPosition });
    this.updateSpatialGrid(number);
  }
  
  removeNumber(numberId: string): void {
    const number = useGameStore.getState().world.numbers.find(n => n.id === numberId);
    if (number) {
      this.removeFromSpatialGrid(number);
      useGameStore.getState().removeNumber(numberId);
    }
  }
  
  // Spatial partitioning for performance
  private updateSpatialGrid(number: NumberEntity): void {
    // Remove from old spatial cells
    this.removeFromSpatialGrid(number);
    
    // Add to new spatial cells
    const spatialCells = this.getSpatialCellsForNumber(number);
    spatialCells.forEach(cellKey => {
      const cell = this.spatialGrid.get(cellKey);
      if (cell) {
        cell.push(number);
      }
    });
  }
  
  private removeFromSpatialGrid(number: NumberEntity): void {
    const spatialCells = this.getSpatialCellsForNumber(number);
    spatialCells.forEach(cellKey => {
      const cell = this.spatialGrid.get(cellKey);
      if (cell) {
        const index = cell.findIndex(n => n.id === number.id);
        if (index > -1) {
          cell.splice(index, 1);
        }
      }
    });
  }
  
  private getSpatialCellsForNumber(number: NumberEntity): string[] {
    const cells: string[] = [];
    const { x, y } = number.worldPosition;
    const size = this.spatialGridSize;
    
    // Check which spatial grid cells this number overlaps with
    const startX = Math.floor(x / size);
    const startY = Math.floor(y / size);
    const endX = Math.floor((x + this.cellSize) / size);
    const endY = Math.floor((y + this.cellSize) / size);
    
    for (let gx = startX; gx <= endX; gx++) {
      for (let gy = startY; gy <= endY; gy++) {
        cells.push(`${gx},${gy}`);
      }
    }
    
    return cells;
  }
  
  // Culling for performance - get only visible numbers
  getVisibleNumbers(): NumberEntity[] {
    const { viewport, scale } = useGameStore.getState().world;
    const visibleNumbers: NumberEntity[] = [];
    
    // Calculate expanded viewport bounds for culling
    const expandedViewport = {
      x: viewport.x - 100, // Add margin for smooth transitions
      y: viewport.y - 100,
      width: viewport.width + 200,
      height: viewport.height + 200,
    };
    
    // Get spatial cells that intersect with the expanded viewport
    const spatialCells = this.getSpatialCellsInViewport(expandedViewport);
    
    spatialCells.forEach(cellKey => {
      const cell = this.spatialGrid.get(cellKey);
      if (cell) {
        cell.forEach(number => {
          const screenPos = this.worldToScreen(number.worldPosition);
          if (this.isPointInViewport(screenPos, expandedViewport)) {
            visibleNumbers.push(number);
          }
        });
      }
    });
    
    return visibleNumbers;
  }
  
  private getSpatialCellsInViewport(viewport: Rectangle): string[] {
    const cells: string[] = [];
    const size = this.spatialGridSize;
    
    const startX = Math.floor(viewport.x / size);
    const startY = Math.floor(viewport.y / size);
    const endX = Math.floor((viewport.x + viewport.width) / size);
    const endY = Math.floor((viewport.y + viewport.height) / size);
    
    for (let gx = startX; gx <= endX; gx++) {
      for (let gy = startY; gy <= endY; gy++) {
        cells.push(`${gx},${gy}`);
      }
    }
    
    return cells;
  }
  
  private isPointInViewport(point: Point, viewport: Rectangle): boolean {
    return (
      point.x >= viewport.x &&
      point.x <= viewport.x + viewport.width &&
      point.y >= viewport.y &&
      point.y <= viewport.y + viewport.height
    );
  }
  
  // Grid generation and population
  generateGrid(): NumberEntity[] {
    const numbers: NumberEntity[] = [];
    const { gridSize } = GameConfig.world;
    const numberDensity = GameConfig.world.numberDensity;
    
    for (let row = 0; row < gridSize.rows; row++) {
      for (let col = 0; col < gridSize.cols; col++) {
        if (Math.random() < numberDensity) {
          const number = this.createNumberAtGridCell(col, row);
          numbers.push(number);
        }
      }
    }
    
    return numbers;
  }
  
  private createNumberAtGridCell(col: number, row: number): NumberEntity {
    const center = this.getGridCellCenter(col, row);
    const temperTypes: Array<'WO' | 'FC' | 'DR' | 'MA'> = ['WO', 'FC', 'DR', 'MA'];
    const temper = temperTypes[Math.floor(Math.random() * temperTypes.length)];
    const targetNumbers = FourTempers[temper].targetNumbers;
    const value = targetNumbers[Math.floor(Math.random() * targetNumbers.length)];
    
    return {
      id: `number_${col}_${row}_${Date.now()}_${Math.random()}`,
      value,
      position: center,
      worldPosition: center,
      temper,
      color: FourTempers[temper].color,
      baseColor: FourTempers[temper].color,
      scale: 1.0,
      isPinned: false,
      pinStrength: 0,
      driftOffset: { x: 0, y: 0 },
      targetColor: FourTempers[temper].color,
      isScary: temper === 'WO' && Math.random() < 0.3, // 30% of WO numbers are scary
      wellupIntensity: 0,
    };
  }
  
  // Cluster management for "wellup" events
  triggerClusterWellup(center: Point, radius: number): void {
    const visibleNumbers = this.getVisibleNumbers();
    const affectedNumbers = visibleNumbers.filter(number => {
      const distance = this.getDistance(number.worldPosition, center);
      return distance <= radius;
    });
    
    affectedNumbers.forEach(number => {
      useGameStore.getState().updateNumber(number.id, {
        wellupIntensity: 1.0,
      });
    });
    
    // Schedule wellup decay
    setTimeout(() => {
      affectedNumbers.forEach(number => {
        useGameStore.getState().updateNumber(number.id, {
          wellupIntensity: 0,
        });
      });
    }, GameConfig.animations.wellupDuration);
  }
  
  // Utility methods
  private getDistance(p1: Point, p2: Point): number {
    const dx = p1.x - p2.x;
    const dy = p1.y - p2.y;
    return Math.sqrt(dx * dx + dy * dy);
  }
  
  getGridBounds(): Rectangle {
    return {
      x: 0,
      y: 0,
      width: this.getWorldWidth(),
      height: this.getWorldHeight(),
    };
  }
  
  // Performance monitoring
  getSpatialGridStats(): { totalCells: number; populatedCells: number; averageLoad: number } {
    let totalCells = 0;
    let populatedCells = 0;
    let totalLoad = 0;
    
    this.spatialGrid.forEach((cell, key) => {
      totalCells++;
      if (cell.length > 0) {
        populatedCells++;
        totalLoad += cell.length;
      }
    });
    
    return {
      totalCells,
      populatedCells,
      averageLoad: populatedCells > 0 ? totalLoad / populatedCells : 0,
    };
  }
}