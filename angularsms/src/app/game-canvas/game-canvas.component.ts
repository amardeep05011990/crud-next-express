import { Component, ElementRef, ViewChild } from '@angular/core';
import * as PIXI from 'pixi.js';
import { Application, Graphics, Sprite, Text, BLEND_MODES  } from 'pixi.js';

@Component({
  selector: 'app-game-canvas',
  standalone: true,
  imports: [],
  templateUrl: './game-canvas.component.html',
  styleUrl: './game-canvas.component.scss'
})
export class GameCanvasComponent {
 name = 'Angular';

  @ViewChild('pixi') pixi: any;
  public pixiApp: any;
app: any;

drawingLayer = new Graphics();
currentTool: 'pen' | 'rectangle' | 'circle' | 'line' | 'eraser' = 'pen';
isDrawing = false;
startX = 0;
startY = 0;
previewShape: any;

  // async ngOnInit() {
  //    this.app = new Application();

  //   // Initialize the application
  //   await this.app.init({ background: '#1099bb', resizeTo: window });

  //   // Append the application canvas to the document body
  //   // document.body.appendChild(this.app.canvas);
  //   this.pixi.nativeElement.appendChild(this.app.canvas);

  //   // Add a rectangle
  //   const rect = new Graphics();
  //   rect.beginFill(0xff0000);
  //   rect.drawRect(100, 100, 200, 150);
  //   rect.endFill();
  //   this.app.stage.addChild(rect);

  //   // Add text
  //   const text = new Text('Hello PixiJS!', { fontSize: 36, fill: '#ffffff' });
  //   text.x = 150;
  //   text.y = 300;
  //   this.app.stage.addChild(text);
  // }

  async ngOnInit() {
  this.app = new Application();
  await this.app.init({ background: '#1099bb', resizeTo: window });
  this.pixi.nativeElement.appendChild(this.app.canvas);

  // Drawing layer
  this.app.stage.addChild(this.drawingLayer);

  // Mouse events
  this.app.stage.eventMode = 'static';
  this.app.stage.hitArea = this.app.screen;

  this.app.stage.on('pointerdown', this.onPointerDown.bind(this));
  this.app.stage.on('pointermove', this.onPointerMove.bind(this));
  this.app.stage.on('pointerup', this.onPointerUp.bind(this));
}
onPointerDown(event: any) {
  this.isDrawing = true;
  const pos = event.global;
  this.startX = pos.x;
  this.startY = pos.y;

  if (this.currentTool === 'pen') {
    this.drawingLayer.setStrokeStyle({ width: 2, color: 0x000000 });
    this.drawingLayer.moveTo(pos.x, pos.y);
  }
  if (this.currentTool === 'eraser') {
    this.drawingLayer.cut(); // start cutting mode
    this.drawingLayer.circle(pos.x, pos.y, 10); // erase circle
    this.drawingLayer.fill();
  }
}

onPointerMove(event: any) {
  if (!this.isDrawing) return;
  const pos = event.global;

  if (this.currentTool === 'pen') {
    this.drawingLayer.lineTo(pos.x, pos.y);
    this.drawingLayer.stroke();
  }

  if (['rectangle', 'circle', 'line'].includes(this.currentTool)) {
    // Clear previous preview
    this.app.stage.removeChild(this.previewShape);
    this.previewShape?.destroy();

    // Create a new preview shape
    this.previewShape = new Graphics();
    this.previewShape.setStrokeStyle({ width: 2, color: 0x000000 });

    if (this.currentTool === 'rectangle') {
      this.previewShape.rect(
        this.startX,
        this.startY,
        pos.x - this.startX,
        pos.y - this.startY
      );
    }

    if (this.currentTool === 'circle') {
      const radius = Math.sqrt(
        Math.pow(pos.x - this.startX, 2) + Math.pow(pos.y - this.startY, 2)
      );
      this.previewShape.circle(this.startX, this.startY, radius);
    }

    if (this.currentTool === 'line') {
      this.previewShape.moveTo(this.startX, this.startY);
      this.previewShape.lineTo(pos.x, pos.y);
    }

    this.previewShape.stroke();
    this.app.stage.addChild(this.previewShape);
  }

  if (this.currentTool === 'eraser') {
    this.drawingLayer.cut();
    this.drawingLayer.circle(pos.x, pos.y, 10); // keep cutting along the pointer
    this.drawingLayer.fill();
  }
}

onPointerUp(event: any) {
  this.isDrawing = false;
  const pos = event.global;

  // Remove preview
  if (this.previewShape) {
    this.app.stage.removeChild(this.previewShape);
    this.previewShape.destroy();
    this.previewShape = null;
  }

  // Final shape
  this.drawingLayer.setStrokeStyle({ width: 2, color: 0x000000 });

  if (this.currentTool === 'rectangle') {
    this.drawingLayer.rect(
      this.startX,
      this.startY,
      pos.x - this.startX,
      pos.y - this.startY
    );
  }

  if (this.currentTool === 'circle') {
    const radius = Math.sqrt(
      Math.pow(pos.x - this.startX, 2) + Math.pow(pos.y - this.startY, 2)
    );
    this.drawingLayer.circle(this.startX, this.startY, radius);
  }

  if (this.currentTool === 'line') {
    this.drawingLayer.moveTo(this.startX, this.startY);
    this.drawingLayer.lineTo(pos.x, pos.y);
  }

  this.drawingLayer.stroke();
}

ngDoCheck(): void {
console.log(this.currentTool)


}

ngOnDestroy() {
  // this.unsubscribe.forEach((sb) => sb.unsubscribe());
  this.drawingLayer.destroy()
}

}
