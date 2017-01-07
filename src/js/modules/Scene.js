let sampleScene = {
  description: 'Lorem ipsum dolor sit amet.',
  default_background: 'school_2',
  keyframes: [
    {
      type: 'dialog',
      condition: 'test == 0',
      dialog: [
        'Your variable is <d-text d-var="test"></d-text>',
        'Your nested variable is <d-text d-var="test_group_1.inner"></d-text>'
      ]
    },
    {
      type: 'dialog',
      condition: 'test == 1',
      dialog: [
        'Great! You\'ve set a variable!'
      ]
    },
    {
      type: 'dialog',
      dialog: [
        'Test string for <d-text d-color="#f00">formatting.</d-text>',
        'Test string to demonstrate <d-text d-speed="10">[speed]</d-text> change inside string.',
        'Test string to demonstrate entities &gt;.&lt;'
      ]
    }
  ]
};

class Scene {
  constructor() {
    this._keyframe = 0;
    this._subframe = 0;

    this._textFinished = false;
  }

  init() {
    this._input();

    D.TextStore.subscribe('writeRunning', (data) => {
      if (data === false) { 
        this._textFinished = true;
      }
    });

    this._loadKeyframe(0, 0);
    this._update();
  }

  _input() {
    window.addEventListener('keydown', (event) => {
      switch(event.which) {
        case 32: this._fastForward(); break;
      }
    }, false);
  }

  _fastForward() {
    if (D.SceneStore.getData('fastForward')) {
      D.SceneStore.setData('fastForward', false);

      if (this._subframeCount - 1 > this._subframe) {
        this._loadSubframe();
      } else {
        this._keyframe++;
        this._subframe = 0;

        this._loadKeyframe(this._keyframe, this._subframe);
      }
    } else {
      D.SceneStore.setData('fastForward', true);
    }
  }

  _loadKeyframe(keyframe, subframe) {
    this._textFinished = false;

    if (!sampleScene.keyframes[keyframe]) {
      return;
    }

    switch (sampleScene.keyframes[keyframe].type) {
      case 'dialog': this._handleTypeDialog(keyframe, subframe); break;
    }
  }

  _loadSubframe() {
    this._subframe++;
    this._loadKeyframe(this._keyframe, this._subframe);
  }

  _handleTypeDialog(keyframe, subframe) {
    this._subframeCount = sampleScene.keyframes[keyframe].dialog.length;
    D.Text.loadText(sampleScene.keyframes[keyframe].dialog[subframe]);
  }

  _update() {
    D.FPSMeter.tickStart();

    requestAnimationFrame(() => {
      if (this._textFinished) {
        D.SceneStore.setData('fastForward', true);
      }

      this._render();
      this._update();
    });
  }

  _render() {
    D.FPSMeter.tick();
  }
}

export default new Scene();
