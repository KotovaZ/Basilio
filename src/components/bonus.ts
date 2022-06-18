import { Body } from "./body";
import Component from "../component.ts";
import {Unit} from "./unit/unit";
import {Coin} from "./coin";
import {Mushroom} from "./mushroom";
import {collision} from "../collision";

@collision
export class Bonus extends Unit {
    sprite = new Component("img", { src: "./src/img/environment.png" });
    trackable = false;
    action: string = 'wait';
    component: string;
    charge: number = 1;

    constructor(position: any, width: number, height: number, component: string) {
        this.position = position;
        this.body = new Body(width, height);
        this.component = component;
        super();
    }

    render = (ctx: CanvasRenderingContext2D) => {
        if (this.collisions[180]) {
            if (this.charge) {
                this.charge -= 1;
                switch (this.component) {
                    case '?':
                        this.layer.addObject(new Coin({x: this.position.x, y: this.position.y + 32}))
                        break;
                    case '*':
                        this.layer.addObject(new Mushroom({x: this.position.x, y: this.position.y + 32}))
                        break;
                }
            }
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
        return this.animations[this.action].render();
    };

    animations: { [key: string]: any } = {
        'wait': (() => {
            let frames = [
                {x: 23*32, y: 0},
                {x: 24*32, y: 0},
                {x: 25*32, y: 0},
            ];

            let frame = 0;
            let time = 0;
            let render = () => {
                let position = frames[frame];
                time += 1;
                //window.game.processDate.getMilliseconds()
                if (time % 30 / window.framerate == 0) {
                    frame += 1;
                    frame = frame < frames.length ? frame : 0;
                }

                return frames[frame];
            };
            return { render };
        })(),
        'active': (() => {
            let time = 0;
            const start_y = this.position.y;
            let render = () => {
                this.position.y = start_y + Math.sin( time  / 8) * 16;
                time += 1;
                if (time >= 26) {
                    time = 0;
                    this.action = 'passive'
                    this.position.y = start_y
                }
                return {x: 26*32, y: 0};
            };
            return { render };
        })(),
        'passive': {
            render: () => {return  {x: 26*32, y: 0}}
        },
    };
}