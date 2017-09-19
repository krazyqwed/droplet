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
          id: 2,
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
          id: 2,
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
          id: 3,
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
          id: 4,
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
          id: 5,
          actions: [
            {
              module: 'dialog',
              options: {
                text: 'Goto module'
              }
            },
            {
              module: 'goto',
              options: {
                scene: 2
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
          actions: [
            {
              module: 'dialog',
              options: {
                text: 'Goto module'
              }
            },
            {
              module: 'goto',
              options: {
                scene: 1
              }
            }
          ]
        }
      ],
      post: []
    }
  ]
};
