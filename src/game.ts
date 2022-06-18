import Component from "./component";
import Layer from "./layer";
import CollisionChecker from "./collisionChecker";
import {connector, store} from "./state";

export default class Game {
    private referenceFrameRate: number = 60;
    public readonly paused: boolean = false;
    private layers: Array<Layer> = [];
    public readonly framerate = 0;
    public readonly processDate = new Date;
    private frameTimeout: number;

    constructor(private collisionChecker: CollisionChecker) {
        this.setWindow();
    }

    start(): void {
        this.paused = false;
        this.setProcessDate();
        this.process();
    }

    pause(): void {
        this.paused = true;
        this.clearFrame();
    }

    frame = function () {
        this.trackable = false,
            this.render = (ctx) => {
                ctx.measureText(this.framerate)
            }
        return this
    }

    setProcessDate(): void {
        this.processDate = new Date();
    }

    setWindow(): void {
        this.canvas = new Component("canvas", {
            width: 1280,
            height: 768,
        });
        this.window = this.canvas.getInstance();
        this.scene = this.window.getContext("2d");
        this.canvas.render(document.body);
    }

    getFrameRate(): number {
        this.framerate = parseInt(1000 / ((new Date() - this.processDate) ));
        store.set('framerate', this.framerate);
        window.framerate = this.framerate < this.referenceFrameRate
            ? this.framerate
            : this.referenceFrameRate;
        return window.framerate;
    }

    setCamera() {
        window.camera = {x: store.state.player.start.x - store.state.player.position.x, y: store.state.player.start.y - store.state.player.position.y + 64}
        if (window.camera.x > 0) window.camera.x = 0;
    }

    process(): void {
        this.getFrameRate();
        this.setProcessDate();
        this.clearScene();
        this.setCamera();
        this.layers.forEach(layer => {
            let objects = layer.objects;
            const trackableObjects = layer.trackableObjects;
            objects
                .filter(element => element.hasOwnProperty('getAABB'))
                .forEach((trackObject) => {
                    trackObject.clearCollisions();
                });

            trackableObjects.forEach((trackObject) => {
                objects
                    .filter(element => element.hasOwnProperty('getAABB'))
                    .forEach((element) => {
                        if (element === trackObject) return;

                        let collision = {x: 0, y: 0};
                        if (this.collisionChecker.hasCollision(trackObject.getAABB(), element.getAABB())) {
                            if (this.collisionChecker.checkTop(trackObject, element)) {
                                collision.y = 1;
                                trackObject.setCollision(0, element)
                                element.setCollision(180, trackObject)
                            }

                            if (this.collisionChecker.checkBottom(trackObject, element) && !collision.y) {
                                collision.y = -1;
                                trackObject.setCollision(180, element)
                                element.setCollision(0, trackObject)
                                /*if (element.hasOwnProperty('velocity') && element.velocity.x) {
                                    trackObject.velocity.x += element.velocity.x;
                                }*/
                            }

                            if (this.collisionChecker.checkRight(trackObject, element) && !collision.y) {
                                collision.x = 1;
                                trackObject.setCollision(90, element)
                                element.setCollision(270, trackObject)
                            }

                            if (this.collisionChecker.checkLeft(trackObject, element) && !collision.y) {
                                trackObject.setCollision(270, element)
                                element.setCollision(90, trackObject)
                            }
                        }
                    });
            });

            objects
                .filter(element => element.gravity)
                .forEach((trackObject) => {
                    if (!trackObject.collisions[180]) {
                        if (trackObject.velocity.y > -32 * 4.5) {
                            trackObject.velocity.y -= 40 / (window.framerate);
                        } else {
                            trackObject.velocity.y = -32 * 4.5;
                        }
                        trackObject.position.y += trackObject.velocity.y;
                    }
                });

            trackableObjects.forEach((trackObject) => {
                if (trackObject.collisions[180]) {
                    trackObject.velocity.y = 0;
                    trackObject.position.y = trackObject.collisions[180][0].getAABB().max.y;
                } else if (trackObject.collisions[0]) {
                    trackObject.velocity.y = 0;
                    trackObject.position.y = trackObject.collisions[0][0].getAABB().min.y - trackObject.body.height;
                }

                if (trackObject.collisions[90]) {
                    trackObject.velocity.x = 0;
                } else if (trackObject.collisions[270]) {
                    trackObject.velocity.x = 0;
                }
            })

            objects.forEach((element) => {
                if (element.velocity && element.velocity.x)
                    element.position.x += element.velocity.x;
                element.render(this.scene);
            });
        })

        if (!this.paused)
            this.frameTimeout = setTimeout(this.process.bind(this), 1000 / this.getFrameRate());

    }

    public clearFrame() {
        clearTimeout(this.frameTimeout);
    }

    public random(min, max) {
        return Math.floor(Math.random() * (max - min)) + min;
    }

    clearScene() {
        this.scene.clearRect(0, 0, this.window.width, this.window.height);
        this.scene.fillStyle = '#0a0a0a';
        //this.scene.fillStyle = '#4f98f8';
        const gradient = this.scene.createLinearGradient(300, 600, 300, 0);
        gradient.addColorStop(0, 'rgba(79, 152, 248, 1)');
        gradient.addColorStop(0.31, 'rgba(32, 111, 187, 1)');
        gradient.addColorStop(0.9, 'rgba(9, 33, 56, 1)');

        this.scene.fillStyle = gradient;
        this.scene.fillRect(0, 0, this.window.width, this.window.height);
    }
}
