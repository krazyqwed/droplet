import sampleStory from '../sample_story';

class Story {
  constructor() {
    this._sceneId = 1;
  }

  start() {
    this.loadScene(sampleStory.startingScene);
  }

  loadScene(sceneId, keyframe = 0) {
    this._sceneId = sceneId;

    let scene = this._getSceneById(this._sceneId);

    D.Scene.loadScene(scene, keyframe);
    D.SceneStore.setData('gameInProgress', true);
  }

  _getSceneById(sceneId) {
    let sceneData;

    sampleStory.scenes.some((scene) => {
      if (scene.id === sceneId) {
        sceneData = scene;
        return true;
      }

      return false;
    });

    return sceneData;
  }
}

export default new Story();
