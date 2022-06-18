import {IBody, Body} from "./body";
import Component from "../component.ts";
import {Unit} from "./unit/unit";
import {Fireball} from "./fireball";
import {Coin} from "./coin";
import gravity from "../gravity";
import {collision} from "../collision";
import {Position} from "../entity";
import {enemy} from "./unit/enemy";

@collision
@gravity
@enemy(1)
export class Crow extends Unit {
    sprite = new Component("img", {src: "./src/img/enemies.png"});
    trackable = true;
    position: Position;
    body: IBody;
    action: string = 'default';
    velocity = {y: 0, x: 1};
    speed: number = 64;
    vector = {
        x: -1,
        y: 0
    }

    constructor(position: Position, width: number, height: number) {
        this.position = position;
        this.body = new Body(width, height);
        super();
    }

    render = (ctx: CanvasRenderingContext2D) => {
        if (this.collisions[0] && this.action !== 'die') {
            this.action = 'die';
            this.collisions[0][0].velocity.y += 7;
            this.layer.addObject(new Coin({x: this.position.x, y: this.position.y + 32}))
        }

        if ((this.collisions[90] || this.collisions[270]) && this.action !== 'die') {
            if ([ ...(this.collisions[90] || []), ...(this.collisions[270] || [])].some(element =>  element instanceof Fireball)) {
                this.action = 'die';
                this.layer.addObject(new Coin({x: this.position.x, y: this.position.y + 32}, 32, 32))
            }
            const collisionObject = this.collisions[90] ? this.collisions[90][0] : this.collisions[270][0];
            if (collisionObject.hasOwnProperty('enemy') && collisionObject.enemy !== this.enemy) {
                collisionObject.dispatchEvent('damage', {value: collisionObject.health})
            }
            this.vector.x = this.vector.x * -1;
        }

        this.position.y += this.velocity.y / 12;

        let frame = this.getCurrentFrame();
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

    getCurrentFrame = () => {
        return this.animations[this.action].render();
    };

    animations: { [key: string]: any } = {
        'default': (() => {
            let frames = [
                {x: 0, y: 32},
                {x: 32, y: 32},
            ];
            let frame = 0;
            let time = 0;
            return {
                render: () => {
                    time += 1;
                    if (time % 15 / window.framerate == 0) {
                        frame += 1;
                        frame = frame < frames.length ? frame : 0;
                    }
                    this.velocity.x = this.vector.x * this.speed / window.framerate;
                    return frames[frame];
                }
            };
        })(),
        'die': (() => {
            let time = 0;
            return {
                render: () => {
                    this.velocity.x = 0;
                    time += 1;
                    this.body.height = 16;
                    this.speed = 0;
                    if (time >= window.framerate) {
                        this.layer.deleteObject(this);
                    }
                    return {x: 64, y: 46}
                }
            }
        })()
    };
}