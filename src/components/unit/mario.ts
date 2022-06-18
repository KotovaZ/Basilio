import {IUnit, Unit} from './unit';
import { IKeyboardController } from "../../modules/keyboard/keyboardController";
import { IKeyboard } from "../../modules/keyboard/keyboard";
import { Body } from "../body";
import Component from "../../component";
import gravity from "../../gravity";
import {Fireball} from "../fireball";
import {Particles} from "../particles";
import {Jetpack} from "../jetpack";
import Layer from "../../layer";
import {collision} from "../../collision";
import {enemy} from "./enemy";
import {store} from "../../state";

@collision
@gravity
@enemy(0)
export class Mario extends Unit implements IUnit  {
  name = 'Mario';
  speed = 32*7;
  health = 100;
  weight = 80;
  trackable = true;
  body = new Body(31, 31);
  sprite = new Component("img", { src: "./src/img/mario.png" });
  controller: IKeyboardController;
  position: any;
  start: any;
  action = "stay";
  jetpack: Jetpack;

  constructor(controller: IKeyboardController, position: any, layer: Layer) {
    super();
    this.controller = controller;
    this.position = position;
    this.start = {...position};
    this.controller.addEventHandler(this.controllerEventHandler);
    this.jetpack = new Jetpack(this);
    layer.addObject(this.jetpack)
    this.addEventListener('damage', this.setDamage)
    store.set('player', this);
  }

  private setDamage = (props: any): void => {
    this.health -= props.value;
    store.set('health', this.health);
    if (this.health <= 0) {
      window.game.pause();
      window.gameManager.reload();
    }
  }

  controllerEventHandler = (event: string, active: boolean) => {
    if (active) {
      switch (event) {
        case "RIGHT":
          this.setAction("walk");
          this.animations.walk.clear();
          this.vector.x = 1;
          break;

        case "LEFT":
          this.setAction("walk");
          this.vector.x = -1;
          this.animations.walk.clear();
          break;

        case "JUMP":
          if (!this.collisions[180]) break;
          this.animations.jump.clear();
          this.setAction("jump");
          break;
        case "DOWN":
          this.setAction("sit");
          break;
        case "FLY":
          this.setAction("fly");
          break;
        case "ATTACk":
          this.layer.addObject(new Fireball({x: this.position.x + (this.vector.x > 0 ? this.body.width + this.velocity.x*2 : -25), y: this.position.y}, {...this.vector, y: 1}))
          break;
        default:
          this.setAction("stay");
          break;
      }
    } else {
      if (this.controller.actions.length == 0) {
        this.setAction("stay");
      } else {
        this.controllerEventHandler(this.controller.actions[0], true);
      }

      if (event === 'FLY') {
        this.jetpack.deactivate();
      }
    }
  }

  velocity = {
    x: 0,
    y: 0
  }

  vector = {
    x: 1,
    y: 0
  }

  getMaxVelocity() {
    return this.vector.x * this.speed / 60;
  }

  animations: { [key: string]: any } = {
    'walk': (() => {
      let frames_right = [
        { x: 32, y: 96 },
        { x: 64, y: 96 },
        { x: 96, y: 96 },
      ];

      let frames_left = [
        { x: 608, y: 480 },
        { x: 576, y: 480 },
        { x: 544, y: 480 },
      ];

      let frame = 0;
      let time = 0;
      let render = () => {
        const maxVelocity = this.getMaxVelocity();
        if (time < window.framerate && Math.abs(this.velocity.x) < Math.abs(maxVelocity)) {
          const newVelocity = this.vector.x * ((100 - (window.framerate - time)) / 100 * this.speed) / window.framerate;
          this.velocity.x = Math.abs(this.velocity.x) > Math.abs(newVelocity) ? this.velocity.x : newVelocity;
          this.velocity.x = Math.floor(this.velocity.x   * 100) /100;
        } else {
          this.velocity.x = maxVelocity;
        }

        let frames = this.vector.x > 0 ? frames_right : frames_left;
        frame = frame < frames.length - 1 ? frame : 0;
        let position = frames[frame];

        time += 1;
        if (time % (3 * ( Math.ceil((Math.abs(maxVelocity) - Math.abs(this.velocity.x)) + 1))) / (window.framerate) == 0)
          frame += 1;

        if (this.vector.x !== Math.sign(this.velocity.x)) {
          return this.vector.x > 0 ? { x: 128, y: 96 } : { x: 516, y: 480 };
        }

        return position;
      };
      return { render, clear: () => { time = 0 } };
    })(),

    'jump': (() => {
      let time = 0;
      let render = () => {
        if (time == 0) {
          this.velocity.y = 18;
        }
        time += 1;
        return this.vector.x > 0 ? { x: 160, y: 96 } : { x: 480, y: 480 };
      };
      return { render, clear: () => { time = 0 } };
    })(),

    'stay': {
      render: () => {
        this.velocity.x = 0;
        return this.vector.x > 0 ? { x: 0, y: 96 } : { x: 640, y: 480 };
      },
    },

    'fly': {
      render: () => {
        this.jetpack.activate();
        return this.vector.x > 0 ? { x: 224, y: 96 } : { x: 416, y: 480 };
      },
      clear: () => {

      }
    },
    'sit': {
      render: () => {
        return this.vector.x > 0 ? { x: 224, y: 96 } : { x: 416, y: 480 };
      },
      clear: () => {}
    }
  };

  setAction = (variant: string) => {
    this.action = variant;
  };

  getCurrentFrame = () => {
    return this.animations[this.action].render();
  }

  render = (ctx: CanvasRenderingContext2D) => {
    let frame = this.getCurrentFrame();

    if (this.collisions[180] && Math.abs(this.velocity.x) ) {
      for (let i=0; i < 1; i++) {
        let particlePosition = {x: this.position.x + (this.velocity.x > 0 ? 0 : this.body.width) + window.game.random(-8, 8), y: this.position.y};
        let particleVelocity = {x: 1 * this.vector.x * -1, y: 3};
        const lifeTime = window.game.random(3, Math.abs(this.velocity.x) * 600 / this.speed);
        const particleSize = 1;
        this.layer.addObject(new Particles(particlePosition, particleVelocity, lifeTime, particleSize))
      }
    }

    ctx.drawImage(
        this.sprite.getInstance(),
        frame.x,
        frame.y,
        this.body.width,
        this.body.height,
        this.position.x + window.camera.x,
        768 - this.position.y - this.body.height,
        this.body.width,
        this.body.height
    );
  };
};