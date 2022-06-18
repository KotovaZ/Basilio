import { IBody, Body } from "./body";
import Component from "../component.ts";
import {Unit} from "./unit/unit";
import {Particles} from "./particles";
import {collision} from "../collision";
import {Position} from "../entity";

interface IGround {
  position: any;
  body: IBody
}

@collision
export class Ground extends Unit implements IGround {

  sprite = new Component("img", { src: "./src/img/environment.png" });
  trackable = false;
  component: string;
  position: Position;
  body: IBody;

  constructor(position: Position, width: number, height: number, component: string) {
    super();
    this.position = position;
    this.body = new Body(width, height);
    this.component = component;
    this.setTexture(component)
  }

  setTexture = (component: string) => {
    switch (component) {
      case 'g':
        this.texture = {x: 0, y: 0};
        break;
      case 'b':
        this.texture = {x: 64, y: 0};
        break;
      case 'B':
        this.texture = {x: 32, y: 0};
        break;
      case '?':
        this.texture = {x: 23*32, y: 0};
        break;
      case 'P':
        this.texture = {x: 0, y: 320};
        break;
      case 'p':
        this.texture = {x: 0, y: 288};
        break;
      /*case 'W':
        this.texture = {x: 0, y: 0};
        break;*/
      case 'M':
        this.texture = {x: 32*5, y: 32*13};
        break;
      case 'd':
        this.texture = {x: 32, y: 96};
        break;
    }
  }

  render = (ctx: CanvasRenderingContext2D) => {
    if (this.collisions[180]) {
      /*if (this.component === 'b') {
        this.position.y += 10
        this.layer.deleteObject(this, 2)
      }*/
    }
    /*if (this.component === 'g' && this.collisions[0) {
      this.position.y -= 1
    }*/
    if (this.component == 'W') {
      for (let i=0; i < 1; i++) {
        let particlePosition = {
          x: this.position.x + window.game.random(-30, 30) + this.body.width / 2,
          y: this.position.y + this.body.height
        };
        let particleVelocity = {x: window.game.random(-50, 50) / 100, y: window.game.random(1, 2)};
        const lifeTime = window.game.random(1, 100);
        const particleSize = 14 - Math.ceil(lifeTime / 10);
        this.layer.addObject(new Particles(particlePosition, particleVelocity, lifeTime, particleSize))
      }
    }

    let frame = this.getCurrentFrame();
    ctx.drawImage(
      this.sprite.getInstance(),
      frame.x,
      frame.y,
      this.body.width,
      this.body.height,
      this.position.x  + window.camera.x * this.layer.config.speed,
      768 - this.position.y - this.body.height,
      this.body.width,
      this.body.height
    );
  };

  getCurrentFrame = () => {
    return this.texture;
  };
}