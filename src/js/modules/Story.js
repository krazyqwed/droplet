let sampleStory = {
  title: 'My First Novel',
  startingScene: 1,
  scenes: [
    {
      id: 1,
      description: 'Lorem ipsum dolor sit amet.',
      background: 'school_1',
      bgm: 'bgm_1',
      keyframes: [
        {
          id: 1,
          actions: [
            {
              type: 'dialog',
              dialog: [
                'Ok, that\'s the first dialog!',
                'And that\'s the second...'
              ]
            },
            {
              type: 'narrator',
              dialog: 'Sed distinctio placeat ea vitae, cupiditate voluptates alias.',
              position: 'top',
              noNext: true
            }
          ]
        },
        {
          id: 2,
          actions: [
            {
              type: 'character',
              id: 1,
              pose: 2,
              position: [40, 'bottom'],
              from: [-5, 0]
            },
            {
              type: 'dialog',
              dialog: [
                'Look! An actor has appeared!',
                'She wants to say something'
              ]
            },
            {
              type: 'narrator',
              event: 'hide'
            }
          ]
        },
        {
          id: 3,
          actions: [
            {
              type: 'sound',
              event: 'sound',
              sound: 'whosh'
            },
            {
              type: 'character',
              id: 2,
              pose: 1,
              position: [60, 'bottom'],
              from: [5, 0],
              duration: 10
            },
            {
              type: 'dialog',
              dialog: 'Look! Another actor has appeared!'
            }
          ]
        },
        {
          id: 4,
          actions: [
            {
              type: 'dialog',
              dialog: 'Teehee!',
              character: 2
            }
          ]
        },
        {
          id: 5,
          actions: [
            {
              type: 'character',
              event: 'move',
              id: 1,
              position: [-10, 0],
              duration: 10
            },
            {
              type: 'character',
              event: 'pose',
              id: 1,
              pose: 1
            },
            {
              type: 'dialog',
              dialog: 'Whoa... What was that?!',
              character: 1
            }
          ]
        },
        {
          id: 6,
          actions: [
            {
              type: 'choose',
              items: [
                {
                  text: 'Set the variable to <d-text d-color="#0f0">1</d-text>',
                  variable: [{
                    name: 'test',
                    value: '1'
                  }],
                  goTo: {
                    keyframe: 8
                  }
                },
                {
                  text: 'Set the variable to <d-text d-color="#f00">-1</d-text>',
                  variable: [{
                    name: 'test',
                    value: '-1'
                  }],
                  goTo: {
                    keyframe: 9
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
                  variable: [{
                    name: 'test',
                    value: '0'
                  }],
                  goTo: {
                    keyframe: 7
                  }
                }
              ],
              options: {
                dialog: 'Select an answer...'
              }
            },
            {
              type: 'dialog',
              dialog: 'Choose your destiny!'
            }
          ]
        },
        {
          id: 7,
          condition: 'test = 0',
          actions: [
            {
              type: 'dialog',
              dialog: 'You are L-A-Z-Y!'
            }
          ]
        },
        {
          id: 8,
          condition: 'test = 1',
          actions: [
            {
              type: 'dialog',
              dialog: 'Oh, you\'ve just set a variable to <d-text d-var="test" d-color="#0f0"></d-text>'
            }
          ]
        },
        {
          id: 9,
          condition: 'test = -1',
          actions: [
            {
              type: 'dialog',
              dialog: 'Why you so negative? Your variable is <d-text d-var="test" d-color="#f00"></d-text> now<d-text d-speed="20">...</d-text>'
            }
          ]
        },
        {
          id: 10,
          actions: [
            {
              type: 'input',
              store: '__globals__.player.nickname'
            },
            {
              type: 'dialog',
              dialog: 'Enter your nickname...'
            }
          ]
        },
        {
          id: 11,
          actions: [
            {
              type: 'dialog',
              event: 'hide'
            },
            {
              type: 'character',
              event: 'move',
              id: 1,
              position: [20, 0]
            }
          ]
        },
        {
          id: 12,
          actions: [
            {
              type: 'character',
              event: 'move',
              id: 1,
              position: [-20, 0]
            }
          ]
        },
        {
          id: 13,
          actions: [
            {
              type: 'background',
              event: 'hideScene'
            },
            {
              type: 'narrator',
              dialog: [
                '<d-actor d-id="player" d-prop="nickname" d-color></d-actor> has the perfect life working as a detective in the city and drinking with his patient girlfriend, <d-actor d-id="2" d-prop="fullName" d-color></d-actor>.',
                'However, when he finds a solid book in his cellar, he begins to realise that things are not quite as they seem in the <d-actor d-id="player" d-prop="nickname" d-color></d-actor> family.',
                'A Halloween party leaves <d-actor d-id="player" d-prop="nickname" d-color></d-actor> with some startling questions about his past, and he sets off to creepy <d-actor d-id="2" d-prop="nickname" d-color></d-actor> to find some answers.'
              ],
              noBackground: true
            }
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
      bgm: 'bgm_2',
      keyframes: [
        {
          id: 1,
          actions: [
            {
              type: 'dialog',
              dialog: 'dsadsad sadsads addsa'
            }
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
