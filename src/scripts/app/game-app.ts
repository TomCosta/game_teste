import { TweenMax } from "gsap";
import "howler";
import {
    Dom,
    PixiAppWrapper as Wrapper,
    pixiAppWrapperEvent as WrapperEvent,
    PixiAppWrapperOptions as WrapperOpts,
} from "vendor/dacaher/pixi-app-wrapper";
import {AssetPriority, LoadAsset, PixiAssetsLoader} from "vendor/dacaher/pixi-assets-loader";
import "pixi-particles";
import "pixi-spine";

export class GameApp {
    private app: Wrapper;
    private textContainer: PIXI.Container;
    private fullScreenButton: PIXI.Container;
    private cardButton: PIXI.Container;
    private textButton: PIXI.Container;
    private fireButton: PIXI.Container;
    private containerMagic: PIXI.Container;
    private textInterval: NodeJS.Timer;
    private loader: PixiAssetsLoader;
    private particlesContainer: PIXI.particles.ParticleContainer;
    private particlesEmitter: PIXI.particles.Emitter;
    private assetsCount: { [key: number]: { total: number, progress: number } } = {};

    private textStyle = new PIXI.TextStyle({
        fontFamily: "Verdana",
        fontSize: 24,
        fill: "#000000",
        wordWrap: true,
        wordWrapWidth: 440,
    });

    private bitmapTextStyle: PIXI.extras.BitmapTextStyle = {font: "35px Desyrel", align: "center"};
    private randomStrings = [
        " Apple ",
        " Beer ",
        " Leader ",
        " Smiles ",
        " Music ",
        " Fast ",
        " Player ",
        " Zodiac ",
        " Empire ",
        " Moon ",
        " Futball ",
        " Energy ",
        " Lands "
    ];

    constructor() {
        const canvas = Dom.getElementOrCreateNew<HTMLCanvasElement>("app-canvas", "canvas", document.getElementById("app-root"));

        // if no view is specified, it appends canvas to body
        const appOptions: WrapperOpts = {
            width: 1920,
            height: 1080,
            scale: "keep-aspect-ratio",
            align: "middle",
            resolution: window.devicePixelRatio,
            roundPixels: true,
            transparent: false,
            backgroundColor: 0x008080,
            view: canvas,
            showFPS: true,
            showMediaInfo: false,
            changeOrientation: true,
        };

        this.app = new Wrapper(appOptions);
        this.app.on(WrapperEvent.RESIZE_START, this.onResizeStart.bind(this));
        this.app.on(WrapperEvent.RESIZE_END, this.onResizeEnd.bind(this));

        const assets = [
            {id: "infire", url: "assets/gfx/infire2.png", priority: AssetPriority.HIGHEST, type: "texture"},
            {id: "card", url: "assets/gfx/magic.png", priority: AssetPriority.HIGHEST, type: "texture"},
            {id: "desyrel", url: "assets/fonts/desyrel.xml", priority: AssetPriority.HIGHEST, type: "font"},
            {id: "start", url: "assets/gfx/start.png", priority: AssetPriority.HIGHEST, type: "texture"},
            {id: "startHover", url: "assets/gfx/startHover.png", priority: AssetPriority.HIGHEST, type: "texture"},
            {id: "cardHoverOut", url: "assets/gfx/cardBtnHoverOut.png", priority: AssetPriority.HIGHEST, type: "texture"},
            {id: "cardHoverIn", url: "assets/gfx/cardBtnHoverIn.png", priority: AssetPriority.HIGHEST, type: "texture"},
            {id: "textHoverOut", url: "assets/gfx/textBtnHoverOut.png", priority: AssetPriority.HIGHEST, type: "texture"},
            {id: "textHoverIn", url: "assets/gfx/textBrnHoverIn.png", priority: AssetPriority.HIGHEST, type: "texture"},
            {id: "fireHoverOut", url: "assets/gfx/fireBtnHoverOut.png", priority: AssetPriority.HIGHEST, type: "texture"},
            {id: "fireHoverIn", url: "assets/gfx/fireBtnHoverIn.png", priority: AssetPriority.HIGHEST, type: "texture"},
            {id: "rImg1", url: "assets/gfx/rImg1.png", priority: AssetPriority.HIGHEST, type: "texture"},
            {id: "rImg2", url: "assets/gfx/rImg2.png", priority: AssetPriority.HIGHEST, type: "texture"},
            {id: "rImg3", url: "assets/gfx/rImg3.png", priority: AssetPriority.HIGHEST, type: "texture"},
            {id: "rImg4", url: "assets/gfx/rImg4.png", priority: AssetPriority.HIGHEST, type: "texture"},
            {id: "rImg5", url: "assets/gfx/rImg5.png", priority: AssetPriority.HIGHEST, type: "texture"},
            {id: "rImg6", url: "assets/gfx/rImg6.png", priority: AssetPriority.HIGHEST, type: "texture"},
            {id: "rImg7", url: "assets/gfx/rImg7.png", priority: AssetPriority.HIGHEST, type: "texture"},
            {id: "rImg8", url: "assets/gfx/rImg8.png", priority: AssetPriority.HIGHEST, type: "texture"},
            {id: "flame", url: "assets/gfx/flame.json", priority: AssetPriority.LOWEST, type: "atlas"},
            // 404 Assets to test loading errors
        ];

        assets.forEach(asset => {
            if (!this.assetsCount[asset.priority]) {
                this.assetsCount[asset.priority] = {total: 1, progress: 0};
            } else {
                this.assetsCount[asset.priority].total++;
            }
        });

        this.loader = new PixiAssetsLoader();
        this.loader.on(PixiAssetsLoader.PRIORITY_GROUP_LOADED, this.onAssetsLoaded.bind(this));
        this.loader.on(PixiAssetsLoader.ASSET_ERROR, this.onAssetsError.bind(this));
        this.loader.on(PixiAssetsLoader.ALL_ASSETS_LOADED, this.onAllAssetsLoaded.bind(this));

        this.loader.addAssets(assets).load();
    }

    // Draw Fire Particles
    private drawParticles(): void {
        this.particlesContainer = new PIXI.particles.ParticleContainer();
        this.particlesContainer.position.set(this.app.initialWidth / 2, this.app.initialHeight * 1);
        this.app.stage.addChild(this.particlesContainer);

        this.particlesEmitter = new PIXI.particles.Emitter(this.particlesContainer, PIXI.loader.resources.infire.texture, {
            alpha: {
                start: 0.8,
                end: 0.1,
            },
            scale: {
                start: 1,
                end: 0.3,
            },
            color: {
                start: "ffffff",
                end: "000000",
            },
            speed: {
                start: 200,
                end: 100,
            },
            startRotation: {
                min: -150,
                max: -30,
            },
            rotationSpeed: {
                min: 0,
                max: 0,
            },
            lifetime: {
                min: 0.5,
                max: 3,
            },
            frequency: 0.01,
            emitterLifetime: -1,
            maxParticles: Infinity,
            pos: {
                x: 0,
                y: 0,
            },
            addAtBack: false,
            spawnType: "circle",
            spawnCircle: {
                x: 0,
                y: 0,
                r: 10,
            },
            emit: false,
            autoUpdate: true,
        });
        let elapsed = Date.now();
        const update = () => {
            const now = Date.now();
            this.particlesEmitter.update((now - elapsed) * 0.009);
            elapsed = now;
        };
        this.startEmittingParticles();
        this.app.ticker.add(update);
    }

    // Shuffle Cards
    private shuffleDeck(): void {
        this.containerMagic = new PIXI.Container();
        this.app.stage.addChild(this.containerMagic);
        var greenGroup = new PIXI.display.Group(0, true);
        greenGroup.on('sort', function (sprite: PIXI.Sprite) {
            sprite.zOrder = -sprite.y;
        });
        this.app.stage.addChild(new PIXI.display.Layer(greenGroup));
        var containerBack = new PIXI.Container();
        var containerFront = new PIXI.Container();
        this.app.stage.addChild(containerBack);
        this.app.stage.addChild(containerFront);
        let cardArray = [];
        let order = 144;
        for (let i = 0; i < 144; i++) {
            let magicCard = new PIXI.Sprite(PIXI.loader.resources.card.texture);
            magicCard.width = 170;
            magicCard.height = 235.5;
            magicCard.x = -400 + (i / 2);
            magicCard.y = -200 + (i / 2);
            magicCard.parentGroup = greenGroup;
            this.containerMagic.addChild(magicCard);
            cardArray.push(magicCard);
            order = order + 1;
        }
        let delayTime = 0;
        cardArray.reverse();
        let atualInd = 0;
        for (let i = 0; i < 144; i++) {
            atualInd = atualInd + 5;
            delayTime = delayTime + 1;
            TweenMax.to(cardArray[i], 1, {delay: delayTime, zIndex: atualInd, zOrder: atualInd})
            TweenMax.to(cardArray[i], 2, {x: cardArray[i].x + 600, delay: delayTime})
        }
        this.containerMagic.position.set(this.app.initialWidth / 2, this.app.initialHeight / 2);
    }

    private onAssetsLoaded(args: { priority: number, assets: LoadAsset[] }): void {
        window.console.log(`[SAMPLE APP] onAssetsLoaded ${args.assets.map(loadAsset => loadAsset.asset.id)}`);
        this.createViewsByPriority(args.priority);
    }

    public buttons(): void {
        this.fullScreenButton = new PIXI.Container();
        this.cardButton = new PIXI.Container();
        this.textButton = new PIXI.Container();
        this.fireButton = new PIXI.Container();
        this.app.stage.addChild(this.fullScreenButton);
        this.app.stage.addChild(this.cardButton);
        this.app.stage.addChild(this.textButton);
        this.app.stage.addChild(this.fireButton);

        let startBtn = new PIXI.Sprite(PIXI.loader.resources.start.texture);
        startBtn.buttonMode = true;
        startBtn.anchor.set(0.5);
        startBtn.interactive = true;
        startBtn.buttonMode = true;

        let cardBtn = new PIXI.Sprite(PIXI.loader.resources.cardHoverOut.texture);
        cardBtn.buttonMode = true;
        cardBtn.anchor.set(0.5);
        cardBtn.interactive = false;
        cardBtn.buttonMode = true;
        cardBtn.alpha = 0;

        let texttBtn = new PIXI.Sprite(PIXI.loader.resources.textHoverOut.texture);
        texttBtn.buttonMode = true;
        texttBtn.anchor.set(0.5);
        texttBtn.interactive = false;
        texttBtn.buttonMode = true;
        texttBtn.alpha = 0;

        let firetBtn = new PIXI.Sprite(PIXI.loader.resources.fireHoverOut.texture);
        firetBtn.buttonMode = true;
        firetBtn.anchor.set(0.5);
        firetBtn.interactive = false;
        firetBtn.buttonMode = true;
        firetBtn.alpha = 0;
        
        startBtn.on("pointerup", () => {
            startBtn.interactive = false;
            startBtn.visible = false;
            cardBtn.interactive = true;
            texttBtn.interactive = true;
            firetBtn.interactive = true;
            cardBtn.alpha = 1;
            texttBtn.alpha = 1;
            firetBtn.alpha = 1;
            document.documentElement.requestFullscreen();
        });


        cardBtn.on("pointerup", () => {
            cardBtn.interactive = false;
            texttBtn.interactive = true;
            firetBtn.interactive = true;
            cardBtn.alpha = 0.5;
            texttBtn.alpha = 1;
            firetBtn.alpha = 1;
            this.shuffleDeck();
            if (this.textContainer) this.textContainer.destroy();
            clearInterval(this.textInterval);
            if (this.particlesEmitter) {
                this.particlesEmitter.emit = false;
                this.particlesEmitter.cleanup();
            }
        });     

        texttBtn.on("pointerup", () => {
            cardBtn.interactive = true;
            texttBtn.interactive = false;
            firetBtn.interactive = true;
            cardBtn.alpha = 1;
            texttBtn.alpha = 0.5;
            firetBtn.alpha = 1;
            this.randomTexts();
            if (this.containerMagic) this.containerMagic.destroy();
            if (this.particlesEmitter) {
                this.particlesEmitter.emit = false;
                this.particlesEmitter.cleanup();
            }
        });

        firetBtn.on("pointerup", () => {
            cardBtn.interactive = true;
            texttBtn.interactive = true;
            firetBtn.interactive = false;
            cardBtn.alpha = 1;
            texttBtn.alpha = 1;
            firetBtn.alpha = 0.5;
            this.drawParticles();
            if (this.textContainer) this.textContainer.destroy();
            clearInterval(this.textInterval);
            console.log(this.particlesContainer);   
            if (this.containerMagic) this.containerMagic.destroy();
        });


        startBtn.on("pointerover", () => {
            startBtn.texture = PIXI.loader.resources.startHover.texture;
        });

        startBtn.on("pointerout", () => {
            startBtn.texture = PIXI.loader.resources.start.texture;
        });

        cardBtn.on("pointerover", () => {
            cardBtn.texture = PIXI.loader.resources.cardHoverIn.texture;
        });

        cardBtn.on("pointerout", () => {
            cardBtn.texture = PIXI.loader.resources.cardHoverOut.texture;
        });

        texttBtn.on("pointerover", () => {
            texttBtn.texture = PIXI.loader.resources.textHoverIn.texture;
        });

        texttBtn.on("pointerout", () => {
            texttBtn.texture = PIXI.loader.resources.textHoverOut.texture;
        });

        firetBtn.on("pointerover", () => {
            firetBtn.texture = PIXI.loader.resources.fireHoverIn.texture;
        });

        firetBtn.on("pointerout", () => {
            firetBtn.texture = PIXI.loader.resources.fireHoverOut.texture;
        });

        this.fullScreenButton.addChild(startBtn);
        this.textButton.addChild(texttBtn);
        this.cardButton.addChild(cardBtn);
        this.fireButton.addChild(firetBtn);
        this.fullScreenButton.position.set(this.app.initialWidth / 2, this.app.initialHeight / 1.2);
        this.cardButton.position.set((this.app.initialWidth / 2) - (this.textButton.width + 20), this.app.initialHeight / 8);
        this.textButton.position.set(this.app.initialWidth / 2, this.app.initialHeight / 8);
        this.fireButton.position.set((this.app.initialWidth / 2) + this.textButton.width + 20, this.app.initialHeight / 8);
    }
    
    private onAssetsError(args: LoadAsset): void {
        window.console.log(`[SAMPLE APP] onAssetsError ${args.asset.id}: ${args.error!.message}`);
    }

    private onAllAssetsLoaded(): void {
        window.console.log("[SAMPLE APP] onAllAssetsLoaded !!!!");
    }
    public randomTexts(): void {
        this.textContainer = new PIXI.Container();  
        this.app.stage.addChild(this.textContainer);
        this.textContainer.position.set(this.app.initialWidth / 2, this.app.initialHeight / 2);
        console.log(this.textStyle);

        let fontSizeRandom = 44;

        let random = (fontRandom: number) => {
            let index = Math.floor(Math.random() * 3);
            let spriteStyle = [
                PIXI.loader.resources.rImg1.texture,
                PIXI.loader.resources.rImg2.texture,
                PIXI.loader.resources.rImg3.texture,
                PIXI.loader.resources.rImg4.texture,
                PIXI.loader.resources.rImg5.texture,
                PIXI.loader.resources.rImg6.texture,
                PIXI.loader.resources.rImg7.texture,
                PIXI.loader.resources.rImg8.texture
            ]
            if (index == 1) {   
                let img = new PIXI.Sprite(spriteStyle[Math.floor(Math.random() * 7)]);
                img.anchor.set(0.5);
                return img;
            }
            else {
                let text = new PIXI.Text(this.randomStrings[Math.floor(Math.random() * (this.randomStrings.length - 1))], this.textStyle);
                text.style.fontSize = fontRandom;     
                text.anchor.set(0.5);
                return text;
            }
        };
        
        let first = random(Math.floor(Math.random() * (26 - 20 + 1) + 20));
        let second = random(Math.floor(Math.random() * (50 - 30 + 1) + 30));
        let third = random(Math.floor(Math.random() * (50 - 24 + 1) + 24));
        let thourth = random(Math.floor(Math.random() * (30 - 24 + 1) + 24));
        let fifth = random(Math.floor(Math.random() * (40 - 35 + 1) + 35));
        second.x = (third.x - (third.width/2)) - (second.width/2) - 10;
        first.x = (second.x - (second.width/2)) - (first.width/2) - 10;
        thourth.x = (third.x + (third.width / 2) + thourth.width / 2) + 10;
        fifth.x = (thourth.x + (thourth.width / 2) + fifth.width / 2) + 10;
        this.textContainer.addChild(first);
        this.textContainer.addChild(second);
        this.textContainer.addChild(third);
        this.textContainer.addChild(thourth);
        this.textContainer.addChild(fifth);
        this.textInterval = setInterval(() => {
            this.textContainer.children.forEach(child => {
                child.destroy();
            }); 
            this.textContainer.children.forEach(child => {
                child.destroy();
            }); 
            this.textContainer.children.forEach(child => {
                child.destroy();
            });
            let first = random(Math.floor(Math.random() * (26 - 20 + 1) + 20));
            let second = random(Math.floor(Math.random() * (50 - 30 + 1) + 30));
            let third = random(Math.floor(Math.random() * (50 - 24 + 1) + 24));
            let thourth = random(Math.floor(Math.random() * (30 - 24 + 1) + 24));
            let fifth = random(Math.floor(Math.random() * (40 - 35 + 1) + 35));
            second.x = (third.x - (third.width/2)) - (second.width/2) - 10;
            first.x = (second.x - (second.width/2)) - (first.width/2) - 10;
            thourth.x = (third.x + (third.width / 2) + thourth.width / 2) + 10;
            fifth.x = (thourth.x + (thourth.width / 2) + fifth.width / 2) + 10;
            this.textContainer.addChild(first);
            this.textContainer.addChild(second);
            this.textContainer.addChild(third);
            this.textContainer.addChild(thourth);
            this.textContainer.addChild(fifth);
        }, 2000)
        this.textInterval;
    }

    private onResizeStart(): void {
        window.console.log("RESIZE STARTED!");
    }

    private onResizeEnd(args: any): void {
        window.console.log("RESIZE ENDED!", args);

        if (args.stage.orientation.changed) {
            this.relocateViews();
        }
    }

    private startEmittingParticles(): void {
        if (this.particlesEmitter) {
            this.particlesEmitter.emit = true;
        }
    }

    private createViewsByPriority(priority: number): void {
        switch (priority) {
            case AssetPriority.HIGHEST:
                this.buttons();
                break;

            case AssetPriority.HIGH:
                break;

            case AssetPriority.NORMAL:
                break;

            case AssetPriority.LOW:
                break;

            case AssetPriority.LOWEST:
                break;

            default:
                break;
        }
    }

    private removeViews(): void {
        this.app.stage.removeChildren();
    }
    
    private relocateViews(): void {
        if (this.fullScreenButton) {
            this.fullScreenButton.position.set(this.app.initialWidth / 2, this.app.initialHeight / 1.2);
        }
        if (this.cardButton) {
            this.cardButton.position.set((this.app.initialWidth / 2) - (this.textButton.width + 20), this.app.initialHeight / 8);
        }
        if (this.textButton) {
            this.textButton.position.set(this.app.initialWidth / 2, this.app.initialHeight / 8);
        }
        if (this.fireButton) {
            this.fireButton.position.set((this.app.initialWidth / 2) + this.textButton.width + 20, this.app.initialHeight / 8);
        }
        if (this.containerMagic) {
            this.containerMagic.position.set(this.app.initialWidth / 2, this.app.initialHeight / 2);
        }
        if (this.particlesContainer) {
            this.particlesContainer.position.set(this.app.initialWidth / 2, this.app.initialHeight * 0.5);
        }
        if (this.textContainer) {
            this.textContainer.position.set(this.app.initialWidth / 2, this.app.initialHeight / 2);
        }
    }
}
