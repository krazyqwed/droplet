export default {
  title: 'My First Novel',
  startingScene: 1,
  scenes: [
    {
      id: 1,
      title: 'Prologue',
      description: 'Lorem ipsum dolor sit amet.',
      pre: [
        {
          module: 'background',
          options: {
            event: 'load',
            image: 'school_1'
          }
        },
        {
          module: 'sound',
          options: {
            event: 'bgm',
            sound: 'bgm_1',
            volume: 0.5
          }
        },
        {
          module: 'sound',
          options: {
            sound: 'birds',
            loop: true,
            persist: true,
            volume: 0.3
          }
        }
      ],
      keyframes: [
        {
          id: 1,
          goto: { keyframe: 2 },
          actions: [
            [
              {
                module: 'dialog',
                options: {
                  text: 'Enter your nickname...',
                  noHistory: true
                }
              },
              {
                module: 'input',
                options: {
                  store: '__globals__.player.nickname'
                }
              }
            ],
            {
              module: 'dialog',
              options: {
                text: 'Oh, my nickname is <d-text d-var="__globals__.player.nickname" d-color="#0f0"></d-text>.'
              }
            },
            [
              {
                module: 'dialog',
                options: {
                  text: 'What do you want to do?'
                }
              },
              {
                module: 'choose',
                options: {
                  items: [
                    {
                      text: 'Set the variable to <d-text d-color="#0f0">1</d-text>',
                      variable: [{
                        name: 'test',
                        value: '1'
                      }],
                      goTo: {
                        keyframe: 102
                      }
                    },
                    {
                      text: 'Set the variable to <d-text d-color="#f00">-1</d-text>',
                      variable: [{
                        name: 'test',
                        value: '-1'
                      }],
                      goTo: {
                        keyframe: 103
                      }
                    },
                    {
                      text: '<d-text d-blink="4">Restart scene</d-text>',
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
                        keyframe: 101
                      }
                    }
                  ]
                }
              }
            ]
          ]
        },
        {
          id: 101,
          goto: { keyframe: 2 },
          actions: [
            {
              module: 'dialog',
              options: {
                text: 'Variable is <d-text d-var="test" d-color="#aaa"></d-text>'
              }
            }
          ]
        },
        {
          id: 102,
          goto: { keyframe: 2 },
          actions: [
            {
              module: 'dialog',
              options: {
                text: 'Variable is <d-text d-var="test" d-color="#0f0"></d-text>'
              }
            }
          ]
        },
        {
          id: 103,
          goto: { keyframe: 2 },
          actions: [
            {
              module: 'dialog',
              options: {
                text: 'Variable is <d-text d-var="test" d-color="#f00"></d-text>'
              }
            }
          ]
        },
        {
          id: 321,
          actions: [
            {
              module: 'dialog',
              options: {
                text: 'Never ever reach this keyframe'
              }
            }
          ]
        },
        {
          id: 2,
          goto: { keyframe: 3 },
          actions: [
            {
              module: 'dialog',
              options: {
                text: 'Default sync action'
              }
            },
            {
              module: 'dialog',
              options: {
                text: 'Im next!'
              }
            }
          ]
        },
        {
          id: 3,
          goto: { keyframe: 4 },
          actions: [
            [
              {
                module: 'narrator',
                options: {
                  text: 'I can be parallel',
                  position: 'top',
                  speed: 0,
                  noNext: true
                }
              },
              {
                module: 'dialog',
                options: {
                  text: 'I can be parallel too'
                }
              }
            ]
          ]
        },
        {
          id: 4,
          goto: { keyframe: 5 },
          actions: [
            {
              module: 'picture',
              options: {
                id: 1,
                position: [50, 75],
                from: [0, 0],
                duration: 30
              },
              autoContinue: true
            },
            {
              module: 'dialog',
              options: {
                text: 'Auto continue after picture'
              }
            }
          ]
        },
        {
          id: 5,
          goto: { keyframe: 6 },
          actions: [
            {
              autoContinue: true,
              actions: [
                {
                  module: 'background',
                  options: {
                    event: 'change',
                    image: 'school_2'
                  }
                }
              ]
            },
            {
              module: 'dialog',
              options: {
                text: 'Auto continue after parallel actions'
              }
            }
          ]
        },
        {
          id: 6,
          goto: { keyframe: 7 },
          actions: [
            {
              module: 'dialog',
              options: {
                text: 'Wait module'
              }
            },
            {
              module: 'picture',
              options: {
                event: 'move',
                id: 1,
                position: [-10, 0],
                duration: 100
              },
              autoContinue: true
            },
            {
              module: 'wait',
              options: {
                duration: 1000
              }
            },
            {
              module: 'picture',
              options: {
                event: 'move',
                id: 1,
                position: [-10, 0],
                duration: 100
              },
              autoContinue: true
            },
            {
              module: 'wait',
              options: {
                duration: 1000
              }
            },
            {
              module: 'picture',
              options: {
                event: 'move',
                id: 1,
                position: [-10, 0],
                duration: 100
              },
              autoContinue: true
            },
            {
              module: 'dialog',
              options: {
                text: 'Done!'
              }
            }
          ]
        },
        {
          id: 7,
          goto: { scene: 2, keyframe: 1 },
          actions: [
            {
              module: 'dialog',
              options: {
                text: 'Goto module'
              }
            }
          ]
        }
      ],
      post: [
        {
          module: 'sound',
          options: {
            event: 'stop',
            sound: 'birds'
          }
        }
      ]
    },
    {
      id: 2,
      title: 'Prologue',
      description: 'Lorem ipsum dolor sit amet.',
      pre: [
        {
          module: 'background',
          options: {
            event: 'load',
            image: 'school_3'
          }
        },
        {
          module: 'sound',
          options: {
            event: 'bgm',
            sound: 'bgm_2',
            volume: 0.5
          }
        }
      ],
      keyframes: [
        {
          id: 1,
          goto: { keyframe: 2 },
          actions: [
            {
              module: 'dialog',
              options: {
                text: 'Character shows up...'
              }
            },
            [
              {
                module: 'character',
                options: {
                  id: 1,
                  pose: 5,
                  position: [50, 'bottom'],
                  from: [-5, 0]
                }
              },
              {
                module: 'dialog',
                options: {
                  text: 'Hello!',
                  character: 1
                }
              }
            ],
            [
              {
                module: 'character',
                options: {
                  id: 1,
                  event: 'pose',
                  pose: 2
                }
              },
              {
                module: 'dialog',
                options: {
                  text: 'Nani?',
                  character: 1
                }
              }
            ]
          ]
        },
        {
          id: 2,
          goto: { scene: 1, keyframe: 1 },
          actions: [
            {
              module: 'dialog',
              options: {
                text: 'Goto module'
              }
            }
          ]
        }
      ],
      post: []
    }
  ]
};
