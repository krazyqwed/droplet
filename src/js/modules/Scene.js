let sampleScene = {
  description: 'Lorem ipsum dolor sit amet.',
  default_background: 'school_2',
  keyframes: [
    {
      id: 14,
      type: 'choose',
      items: [
        {
          text: 'Set the variable to <d-text d-color="#0f0">1</d-text>',
          variable: [{
            name: 'test',
            value: '1'
          }]
        },
        {
          text: 'Set the variable to <d-text d-color="#f00">-1</d-text>',
          variable: [{
            name: 'test',
            value: '-1'
          }]
        },
        {
          text: 'Do nothing...'
        }
      ],
      options: {
        dialog: 'Select an answer...'
      }
    },
    {
      id: 1,
      type: 'dialog',
      condition: 'test == 0',
      dialog: [
        'Your variable is <d-text d-var="test" d-color="#f80"></d-text>',
        'Your nested variable is <d-text d-var="test_group.inner_group.inner" d-color="#f80"></d-text>'
      ]
    },
    {
      id: 5,
      type: 'character',
      action: 'show',
      options: {
        id: 2,
        pose: 1,
        position: [40, 'bottom'],
        from: [-5, 0]
      },
      async: true
    },
    {
      id: 2,
      type: 'dialog',
      variable: [{
        name: 'test_group.inner_group.inner',
        value: '+10.5'
      }],
      dialog: [
        'Great! You\'ve set a variable! [test_group.inner_group.inner => <d-text d-var="test_group.inner_group.inner" d-color="#f80"></d-text>]'
      ]
    },
    {
      id: 4,
      type: 'character',
      action: 'pose',
      options: {
        id: 2,
        pose: 8
      },
      async: true
    },
    {
      id: 3,
      type: 'character',
      action: 'show',
      options: {
        id: 1,
        pose: 1,
        duration: 120,
        position: [60, 'bottom'],
        from: [5, 0]
      },
      fastForward: true
    },
    {
      id: 7,
      type: 'character',
      action: 'move',
      options: {
        id: 1,
        relative: true,
        position: [10, 0]
      },
      async: true
    },
    {
      id: 8,
      type: 'dialog',
      dialog: [
        'What\'s with that pose?'
      ],
      options: {
        character: 1
      }
    },
    {
      id: 6,
      type: 'dialog',
      dialog: [
        'Tee-hee'
      ],
      options: {
        character: 2
      }
    },
    {
      id: 10,
      type: 'dialog',
      dialog: [
        'Test string for <d-text d-color="#f00">formatting.</d-text>',
        'Test string to demonstrate <d-text d-speed="10">[speed]</d-text> change inside string.',
        'Test string to demonstrate entities &gt;.&lt;'
      ],
      options: {
        character: 'player'
      }
    },
    {
      id: 9,
      type: 'character',
      action: 'move',
      options: {
        id: 2,
        position: [30, 'bottom']
      },
      fastForward: true
    },
    {
      id: 12,
      type: 'character',
      action: 'move',
      options: {
        id: 2,
        relative: true,
        position: [-5, 0]
      },
      fastForward: true
    },
    {
      id: 13,
      type: 'character',
      action: 'hide',
      options: {
        id: 2,
        relative: true,
        position: [-10, 0]
      },
      fastForward: true
    },
    {
      id: 11,
      type: 'dialog',
      dialog: [
        'Thanks for watching!'
      ]
    }
  ]
};

class Scene {
  constructor() {
    this._keyframe = 0;
    this._subframe = 0;

    this._textFinished = false;
    this._characterFinished = false;
    this._interactionFinished = false;
  }

  init() {
    this._input();

    D.TextStore.subscribe('writeRunning', (data) => {
      if (data === false) {
        this._textFinished = true;
      }
    });

    D.CharacterStore.subscribe('animationRunning', (data) => {
      if (data === false) {
        this._characterFinished = true;
      }
    });

    D.InteractionStore.subscribe('interactionRunning', (data) => {
      if (data === false) {
        this._interactionFinished = true;
        this._fastForward();
      }
    });

    this._prepareScene();
    this._loadKeyframe(0, 0);
    this._update();
  }

  _input() {
    window.addEventListener('keydown', (event) => {
      switch (event.which) {
        case 32: event.preventDefault(); this._fastForward(); break;
      }
    }, false);

    window.addEventListener('mousewheel', (event) => {
      const delta = Math.max(-1, Math.min(1, (event.wheelDelta || -event.detail)));

      if (delta === -1) {
        event.preventDefault();
        this._fastForward();
      }
    }, false);

    window.addEventListener('mousedown', (event) => {
      event.preventDefault();
      this._fastForward();
    }, false);
  }

  _prepareScene() {
    let landscapeTexture = PIXI.Texture.fromImage('static/school_1.jpg');
    let background = new PIXI.Sprite(landscapeTexture);
    background.anchor.x = 0;
    background.anchor.y = 0;
    background.position.x = 0;
    background.position.y = 0;

    D.Stage.addChild(background);
  }

  _fastForward() {
    if (sampleScene.keyframes[this._keyframe]) {
      if (!sampleScene.keyframes[this._keyframe].async) {
        D.SceneStore.setData('skipAsync', Math.random());
      }

      if (D.SceneStore.getData('fastForward')) {
        D.SceneStore.setData('fastForward', false);
        this._loadNextFrame();
      } else {
        D.SceneStore.setData('fastForward', true);
      }
    }
  }

  _loadKeyframe(keyframe, subframe) {
    if (!sampleScene.keyframes[keyframe]) {
      return;
    }

    this._setFinishedSubscriptions(sampleScene.keyframes[keyframe].type);

    this._handleVariables();

    switch (sampleScene.keyframes[keyframe].type) {
      case 'dialog': this._handleTypeDialog(keyframe, subframe); break;
      case 'character': this._handleTypeCharacter(keyframe); break;
      case 'choose': this._handleTypeChoose(keyframe); break;
    }
  }

  _loadSubframe() {
    this._subframe++;
    this._loadKeyframe(this._keyframe, this._subframe);
  }

  _loadNextFrame() {
    if (this._interactionFinished) {
      if (this._subframeCount - 1 > this._subframe) {
        this._loadSubframe();
      } else {
        this._keyframe++;
        this._subframe = 0;

        this._loadKeyframe(this._keyframe, this._subframe);
      }
    }
  }

  _setFinishedSubscriptions(type) {
    this._textFinished = true;
    this._characterFinished = true;
    this._interactionFinished = true;

    switch (type) {
      case 'dialog': this._textFinished = false; break;
      case 'character': this._characterFinished = false; break;
      case 'choose': this._interactionFinished = false; this._textFinished = false; break;
    }
  }

  _handleVariables() {
    if (sampleScene.keyframes[this._keyframe].variable) {
      const variables = sampleScene.keyframes[this._keyframe].variable;

      variables.forEach((variable) => {
        D.Variable.set(variable.name, variable.value);
      });
    }
  }

  _handleTypeDialog(keyframe, subframe) {
    keyframe = sampleScene.keyframes[keyframe];
    this._subframeCount = keyframe.dialog.length;

    D.Text.showTextBox();
    D.Text.loadText(keyframe.dialog[subframe], keyframe.options);
  }

  _handleTypeCharacter(keyframe) {
    keyframe = sampleScene.keyframes[keyframe];
    this._subframeCount = 1;

    D.Character.setAction(keyframe.action, keyframe.options, keyframe.async);
  }

  _handleTypeChoose(keyframe) {
    keyframe = sampleScene.keyframes[keyframe];
    this._subframeCount = 1;

    D.Choose.showChoose(keyframe.items, keyframe.options);
  }

  _update() {
    requestAnimationFrame(() => {
      if (sampleScene.keyframes[this._keyframe]) {
        if (this._textFinished && this._characterFinished) {
          D.SceneStore.setData('fastForward', true);

          if (sampleScene.keyframes[this._keyframe].fastForward) {
            this._fastForward();
          }
        } else if (sampleScene.keyframes[this._keyframe].async) {
          this._fastForward();
        }

        this._update();
      }
    });
  }
}

export default new Scene();
