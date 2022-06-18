import { IBody, Body } from "./body";
import Component from "../component.ts";
import {Unit} from "./unit/unit";
import gravity from "../gravity";
import {Position} from "../entity";
import {store} from "../state";

@gravity
export class Coin extends Unit {
    sprite = new Component("img", { src: "./src/img/environment.png" });
    trackable = false;
    position: Position;
    body: IBody;
    action: string = 'wait';

    constructor(position: Position) {
        store.set('score', store.get('score') + 100);
        this.position = position;
        this.body = new Body(32, 32);
        super();
    }

    velocity = {
        x: 1,
        y: 60 / window.framerate
    }

    render = (ctx: CanvasRenderingContext2D) => {
        if (this.collisions[180]) {
            this.action = 'active';
        }

        let frame = this.getCurrentFrame();
        ctx.drawImage(
            this.sprite.getInstance(),
            frame.x,
            frame.y,
            this.body.width,
            this.body.height,
            this.position.x  + window.camera.x,
            768 - this.position.y - this.body.height,
            this.body.width,
            this.body.height
        );
    };

    getCurrentFrame = () => {
        return this.animations['default'].render();
    };

    animations: { [key: string]: any } = {
        'default': (() => {
            let frames = [
                {x: 23*32, y: 32},
                {x: 24*32, y: 32},
                {x: 25*32, y: 32},
            ];

            let frame = 0;
            let time = 0;

            let render = () => {
                time += 1;
                if (time % 8 / window.framerate == 0)
                    frame = frame + 1 < frames.length ? frame + 1 : 0;
                if (time >= window.framerate)
                    this.layer.deleteObject(this);
                return frames[frame];
            };
            return { render };
        })()
    };
}