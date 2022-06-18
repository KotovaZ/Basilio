import { IBody, Body } from "./body";
import Component from "../component.ts";
import {Unit} from "./unit/unit";
import {Particles} from "./particles";
import Layer from "../layer";
import {collision} from "../collision";
import {Position} from "../entity";

@collision
export class Decoration extends Unit {
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
            case 'S':
                this.texture = {x: 32*11, y: 32*11};
                break;
            case 'C':
                this.texture = {x: 32*11, y: 32*17};
                break;
            case 'Z':
                this.texture = {x: 32*13, y: 32};
                break;
            case 'w':
                this.texture = {x: 96, y: 32*27};
                break;
            case 'W':
                this.texture = {x: 96, y: 32*26};
                break;
            case 'f':
                this.texture = {x: 32*5, y: 0};
                break;
        }
    }

    render = (ctx: CanvasRenderingContext2D) => {
        /*if (this.component === 'C' && this.layer) {
            for (let i=0; i < 1; i++) {
                let particlePosition = {
                    x: this.position.x + window.game.random(-30, 30) + this.body.width / 2,
                    y: this.position.y
                };
                let particleVelocity = {x: 0, y: 0};
                // const lifeTime = window.game.random(1, 50);
                // let particleSize = 4 - Math.ceil(lifeTime / 4);
                const lifeTime = 10000;
                let particleSize = 1;
                particleSize = particleSize <= 0 ? 1 : particleSize;
                this.layer.addObject(new Particles(particlePosition, particleVelocity, lifeTime, particleSize))
            }
        }*/

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