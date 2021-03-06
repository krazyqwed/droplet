export default {
  title: 'My First Novel',
  startingScene: '1',
  scenes: [
    {
      id: '1',
      title: 'Prologue',
      description: 'Lorem ipsum dolor sit amet.',
      startingKeyframe: '0',
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
          id: '0',
          goto: {
            conditions: [
              {
                expression: 'conditional_test < 0',
                keyframe: '1001'
              },
              {
                expression: 'conditional_test = 0',
                keyframe: '1002'
              },
              {
                expression: 'conditional_test > 0',
                keyframe: '1003'
              }
            ]
          },
          actions: [
            {
              module: 'choose',
              options: {
                items: [
                  {
                    text: 'Set the variable to <d-text d-color="#f00">-1</d-text>',
                    variable: [{
                      name: 'conditional_test',
                      value: '-1'
                    }]
                  },
                  {
                    text: 'Set the variable to 0',
                    variable: [{
                      name: 'conditional_test',
                      value: '0'
                    }]
                  },
                  {
                    text: 'Set the variable to <d-text d-color="#0f0">1</d-text>',
                    variable: [{
                      name: 'conditional_test',
                      value: '1'
                    }]
                  }
                ]
              }
            },
            {
              module: 'textbox',
              options: {
                text: 'The next keyframe is based on the variable\'s value (<d-text d-var="conditional_test"></d-text>) you set.'
              }
            }
          ]
        },
        {
          id: '1001',
          goto: { keyframe: '10001' },
          actions: [
            {
              module: 'textbox',
              options: {
                text: 'I\'m number 1'
              }
            }
          ]
        },
        {
          id: '1002',
          goto: { keyframe: '10001' },
          actions: [
            {
              module: 'textbox',
              options: {
                text: 'I\'m number 2'
              }
            }
          ]
        },
        {
          id: '1003',
          goto: { keyframe: '10001' },
          actions: [
            {
              module: 'textbox',
              options: {
                text: 'I\'m number 3'
              }
            }
          ]
        },
        {
          id: '10001',
          condition: 'conditional_test = 0',
          goto: { keyframe: '1' },
          actions: [
            {
              module: 'textbox',
              options: {
                text: 'And this keyframe is only visible, when the variable was set to 0...'
              }
            }
          ]
        },
        {
          id: '1',
          goto: { keyframe: '2' },
          actions: [
            [
              {
                module: 'textbox',
                options: {
                  text: 'Enter your nickname...',
                  noHistory: true,
                  noNext: true
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
              module: 'textbox',
              options: {
                text: 'Oh, my nickname is <d-text d-var="__globals__.player.nickname" d-color="#0f0"></d-text>.'
              }
            },
            [
              {
                module: 'textbox',
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
                        keyframe: '102'
                      }
                    },
                    {
                      text: 'Set the variable to <d-text d-color="#f00">-1</d-text>',
                      variable: [{
                        name: 'test',
                        value: '-1'
                      }],
                      goTo: {
                        keyframe: '103'
                      }
                    },
                    {
                      text: '<d-text d-blink="4">Restart scene</d-text>',
                      goTo: {
                        scene: '1'
                      }
                    },
                    {
                      text: 'Do nothing...',
                      variable: [{
                        name: 'test',
                        value: '0'
                      }],
                      goTo: {
                        keyframe: '101'
                      }
                    }
                  ]
                }
              }
            ]
          ]
        },
        {
          id: '101',
          goto: { keyframe: '2' },
          actions: [
            {
              module: 'textbox',
              options: {
                text: 'Variable is <d-text d-var="test" d-color="#aaa"></d-text>'
              }
            }
          ]
        },
        {
          id: '102',
          goto: { keyframe: '2' },
          actions: [
            {
              module: 'textbox',
              options: {
                text: 'Variable is <d-text d-var="test" d-color="#0f0"></d-text>'
              }
            }
          ]
        },
        {
          id: '103',
          goto: { keyframe: '2' },
          actions: [
            {
              module: 'textbox',
              options: {
                text: 'Variable is <d-text d-var="test" d-color="#f00"></d-text>'
              }
            }
          ]
        },
        {
          id: '321',
          actions: [
            {
              module: 'textbox',
              options: {
                text: 'Never ever reach this keyframe'
              }
            }
          ]
        },
        {
          id: '2',
          goto: { keyframe: '3' },
          actions: [
            {
              module: 'textbox',
              options: {
                text: 'Default sync action'
              }
            },
            {
              module: 'textbox',
              options: {
                text: 'Im next!'
              }
            }
          ]
        },
        {
          id: '3',
          goto: { keyframe: '4' },
          actions: [
            [
              {
                module: 'narrator',
                options: {
                  text: 'I can be parallel',
                  speed: 0,
                  noNext: true
                }
              },
              {
                module: 'textbox',
                options: {
                  text: 'I can be parallel too'
                }
              }
            ]
          ]
        },
        {
          id: '4',
          goto: { keyframe: '5' },
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
              module: 'textbox',
              options: {
                text: 'Auto continue after picture'
              }
            },
            {
              module: 'narrator',
              options: {
                text: 'Narrator line #1'
              }
            },
            {
              module: 'narrator',
              options: {
                text: 'Narrator line #2',
                position: 'center'
              }
            },
            {
              module: 'narrator',
              options: {
                text: 'Narrator line #3',
                noNext: true
              }
            }
          ]
        },
        {
          id: '5',
          goto: { keyframe: '6' },
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
                },
                {
                  module: 'narrator',
                  options: {
                    event: 'hide'
                  }
                }
              ]
            },
            {
              module: 'textbox',
              options: {
                text: 'Auto continue after parallel actions'
              }
            }
          ]
        },
        {
          id: '6',
          goto: { keyframe: '7' },
          actions: [
            {
              module: 'textbox',
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
                duration: 60
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
                duration: 60
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
              module: 'textbox',
              options: {
                text: 'Done!'
              }
            }
          ]
        },
        {
          id: '7',
          goto: { scene: '2' },
          actions: [
            {
              module: 'textbox',
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
      id: '2',
      title: 'Prologue',
      description: 'Lorem ipsum dolor sit amet.',
      startingKeyframe: '1',
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
          id: '1',
          goto: { keyframe: '2' },
          actions: [
            {
              module: 'textbox',
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
                module: 'textbox',
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
                  pose: 6
                }
              },
              {
                module: 'textbox',
                options: {
                  text: 'Nani?',
                  character: 1
                }
              }
            ]
          ]
        },
        {
          id: '2',
          goto: { scene: '1' },
          actions: [
            {
              module: 'textbox',
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
