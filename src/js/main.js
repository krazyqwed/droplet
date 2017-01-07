import Scene from './modules/Scene';
import Text from './modules/Text';
import Variable from './modules/Variable';
import PixiStore from './stores/PixiStore';
import SceneStore from './stores/SceneStore';
import TextStore from './stores/TextStore';

window.D = {
  Renderer: null,
  Stage: null,

  PixiStore: new PixiStore(),
  SceneStore: new SceneStore(),
  TextStore: new TextStore(),

  Scene: Scene,
  Text: Text,
  Variable: Variable,

  FPSMeter: new FPSMeter()
};

//Create the renderer
D.Renderer = PIXI.autoDetectRenderer(1920, 1080, {
  antialias: false,
  transparent: false,
  resolution: 1
});

//Add the canvas to the HTML document
document.body.appendChild(D.Renderer.view);

//Create a container object called the `stage`
D.Stage = new PIXI.Container();

var landscapeTexture = PIXI.Texture.fromImage('static/test.jpg');

// new sprite
var background = new PIXI.Sprite(landscapeTexture);

background.anchor.x = 0;
background.anchor.y = 0;
background.position.x = 0;
background.position.y = 0;

D.Stage.addChild(background);

D.Scene.init();
D.Text.init();

function update() {
  requestAnimationFrame(() => {
    if (D.SceneStore.getData('fastForward')) {
      console.log('skipped');
    }

    D.Renderer.render(D.Stage);

    update();
  });
}

update();
