import sampleStory from '../sample_story_new';

class Story {
  start() {
    this.loadScene(sampleStory.startingScene);
  }

  loadScene(sceneId, keyframe = false, subframe = 0) {
    let scene = this._getSceneById(sceneId);

    D.Scene.loadScene(scene, keyframe, subframe);
    D.SceneStore.setData('gameInProgress', true);
  }

  _getSceneById(sceneId) {
    return sampleStory.scenes.find(scene => scene.id === sceneId);
  }
}

export default new Story();
