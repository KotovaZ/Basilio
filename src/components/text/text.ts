import { IBody } from "../body";
import Layer from "../../layer";
import {Position} from "../../entity";
import {connector, store} from "../../state";

export interface IText {
    position: Position;
    layer: Layer;
    render: (ctx: CanvasRenderingContext2D) => void
}

export type TextProps = {
    text: string;
    style?: {
        font?: string,
        fillStyle?: string
    }
}

export class Text implements IText{
    layer: Layer;
    position: Position;

    constructor(position: Position, private props: TextProps) {
        this.position = position;
    }

    setTextStyle = (ctx: CanvasRenderingContext2D) => {
        ctx.font = "22px verdana";
        ctx.fillStyle = "#ffffff";
        if (!this.props || !this.props.hasOwnProperty('style')) return;
        Object.keys(this.props.style).forEach(key => {
            switch (key) {
                case 'fillStyle':
                    ctx.fillStyle = this.props.style[key];
                    break;
                case 'font':
                    ctx.font = this.props.style[key];
                    break;
            }
        })
    }

    render = (ctx: CanvasRenderingContext2D) => {
        this.setTextStyle(ctx);
        ctx.fillText(this.props.text, this.position.x, this.position.y);
    }
}