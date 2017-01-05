import Scene from './modules/Scene';
import Text from './modules/Text';
import PixiStore from './stores/PixiStore';
import SceneStore from './stores/SceneStore';

window.pixiStore = new PixiStore();
window.sceneStore = new SceneStore();

window.meter = new FPSMeter();

//Create the renderer
window.renderer = PIXI.autoDetectRenderer(1920, 1080, {
  antialias: false,
  transparent: false,
  resolution: 1
});

//Add the canvas to the HTML document
document.body.appendChild(renderer.view);

//Create a container object called the `stage`
window.stage = new PIXI.Container();

var landscapeTexture = PIXI.Texture.fromImage('static/test.jpg');

// new sprite
var background = new PIXI.Sprite(landscapeTexture);

background.anchor.x = 0;
background.anchor.y = 0;
background.position.x = 0;
background.position.y = 0;

window.stage.addChild(background);

Scene.init();
Text.init();

function update() {
  requestAnimationFrame(() => {
    if (window.sceneStore.getData('fastForward')) {
      console.log('skipped');
    }

    window.renderer.render(window.stage);

    update();
  });
}

update();
