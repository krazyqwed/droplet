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
            [
              {
                module: 'narrator',
                options: {
                  text: 'Sed distinctio placeat ea vitae, cupiditate voluptates alias.',
                  position: 'top',
                  speed: 0,
                  noNext: true
                }
              },
              {
                module: 'dialog',
                options: {
                  text: [
                    'Ok, that\'s the first dialog!',
                    'And that\'s the second...'
                  ]
                }
              }
            ]
          ]
        },
        {
          id: 4324,
          actions: [
            [
              {
                module: 'narrator',
                options: {
                  event: 'hide'
                }
              },
              {
                module: 'background',
                options: {
                  event: 'change',
                  image: 'school_2'
                },
                autoContinue: true
              }
            ],
            [
              {
                module: 'picture',
                options: {
                  id: 1,
                  position: [50, 75],
                  from: [0, 0],
                  duration: 10
                }
              },
              {
                module: 'dialog',
                options: {
                  text: [
                    'So, this is working with the new ActionQueue',
                    'That\'s awesome!',
                    'Wild Bastion appeared...'
                  ]
                }
              }
            ]
          ],
          goTo: {
            scene: 1
          }
        }
      ],
      post: [
        // {
        //   module: 'narrator',
        //   options: {
        //     event: 'hide'
        //   }
        // }
      ]
    }
  ]
};
