export interface IBody {
  width: number;
  height: number;
}

export class Body implements IBody {
  readonly width;
  readonly height;
  constructor(width: number, height: number) {
    this.width = width;
    this.height = height;
  }
}