import { IBody, Body } from "./body";
import Component from "../component.ts";
import {Unit} from "./unit/unit";
import gravity from "../gravity";
import {Fireball} from "./fireball";
import {collision} from "../collision";
import {Position} from "../entity";

@collision
@gravity
export class Mushroom extends Unit {
    sprite = new Component("img", { src: "./src/img/environment.png" });
    trackable = true;
    body: IBody;
    action: string = 'default';
    velocity = {y: 0, x: 1};
    speed: number = 32*3;
    vector = {
        x: 1,
        y: 1
    }

    constructor(public position: Position) {
        this.body = new Body(32, 32);
        super();
    }

    render = (ctx: CanvasRenderingContext2D) => {
        if (this.collisions[90] || this.collisions[270]) {
            this.vector.x = this.vector.x * -1;
            if ([ ...(this.collisions[90] || []), ...(this.collisions[270] || [])].some(element =>  element instanceof Fireball)) {
                this.layer.deleteObject(this);
            }
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
        'default': (() => {
            return { render: () => {
                this.velocity.x = this.vector.x * this.speed / window.framerate;
                return {x: 22*32 + 1, y: 32}
            }};
        })()
    };
}