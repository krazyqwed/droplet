let sampleStory = {
  title: 'My First Novel',
  startingScene: 1,
  scenes: [
    {
      id: 1,
      description: 'Lorem ipsum dolor sit amet.',
      background: 'school_1',
      bgm: false,
      keyframes: [
        {
          id: 1,
          type: 'input',
          store: '__globals__.player.nickname',
          options: {
            dialog: 'Enter your nickname...'
          }
        },
        {
          id: 2,
          type: 'dialog',
          options: {
            action: 'close'
          }
        },
        {
          id: 3,
          type: 'narrator',
          dialog: [
            '<d-actor d-id="player" d-prop="fullName" d-color></d-actor> has the perfect life working as a detective in the city and drinking with his patient girlfriend, <d-actor d-id="2" d-prop="fullName" d-color></d-actor>.',
            'However, when he finds a solid book in his cellar, he begins to realise that things are not quite as they seem in the <d-actor d-id="player" d-prop="nickname" d-color></d-actor> family.',
            'A Halloween party leaves <d-actor d-id="player" d-prop="nickname" d-color></d-actor> with some startling questions about his past, and he sets off to creepy <d-actor d-id="2" d-prop="nickname" d-color></d-actor> to find some answers.'
          ],
          options: {
            noBackground: true
          }
        },
        {
          id: 2,
          type: 'narrator',
          options: {
            action: 'close'
          },
          async: true
        },
        {
          id: 4,
          type: 'narrator',
          dialog: [
            '<d-text d-italic>At first the people of <d-actor d-id="1" d-prop="nickname" d-color></d-actor> are admirable and clever.</d-text>'
          ],
          options: {
            position: 'top',
            noNext: true
          },
          async: true
        },
        {
          id: 5,
          type: 'dialog',
          dialog: [
            'Alright, <d-actor d-id="player" d-prop="nickname" d-color></d-actor>!',
            'Let\'s load the next scene!'
          ],
          goTo: {
            scene: 2
          }
        }
      ]
    },
    {
      id: 2,
      description: 'Lorem ipsum dolor sit amet.',
      background: 'school_2',
      bgm: false,
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
              }],
              goTo: {
                keyframe: 15
              }
            },
            {
              text: 'Set the variable to <d-text d-color="#f00">-1</d-text>',
              variable: [{
                name: 'test',
                value: '-1'
              }],
              goTo: {
                keyframe: 16
              }
            },
            {
              text: '<d-text d-blink="4">Back to previous scene</d-text>',
              goTo: {
                scene: 1
              }
            },
            {
              text: 'Do nothing...',
              goTo: {
                keyframe: 17
              }
            }
          ],
          options: {
            dialog: 'Select an answer...'
          }
        },
        {
          id: 15,
          type: 'dialog',
          condition: 'test = 1',
          dialog: [
            'Oh, you\'ve just set a variable to <d-text d-var="test" d-color="#0f0"></d-text>'
          ]
        },
        {
          id: 16,
          type: 'dialog',
          condition: 'test = -1',
          dialog: [
            'Why you so negative? Your variable is <d-text d-var="test" d-color="#f00"></d-text> now<d-text d-speed="20">...</d-text>'
          ]
        },
        {
          id: 17,
          type: 'dialog',
          condition: 'test = 0',
          dialog: [
            'You are L-A-Z-Y!'
          ]
        },
        {
          id: 1,
          type: 'dialog',
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
          ],
          goTo: {
            scene: 1
          }
        }
      ]
    }
  ]
};

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
