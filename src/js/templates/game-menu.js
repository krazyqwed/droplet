import hyperHTML from 'hyperhtml';

export default state => {
  const guiClasses = ['d_gui__content'];

  if (state.get('gui.gameMenu.visible')) {
    guiClasses.push('d_gui__content--visible');
    guiClasses.push('d_gui__content--interactive');
  }

  const scaleStyle = `transform: scale(${state.get('scale')});`;

  return hyperHTML.wire(state, ':gameMenu')`
    <div class=${guiClasses.join(' ')} style=${scaleStyle}>
      <div class="d_game-menu">
        <div class="d_game-menu__list">
          <div class="d_button" onclick=${state.get('gui.gameMenu.event.showHistory')}>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="-30 -30 572 572">
              <path fill="#fff" stroke="#000" stroke-width="20" shape-rendering="optimizeQuality" d="M298.7 48.5c-88 0-163.7 40.5-196.3 98.4C42 168 0 215 0 270c0 41.7 24.7 79 63.5 104v89.5l63.3-63.2c16.6 3.8 34.2 6 52.4 6 45 0 86.2-12.7 117.7-33.6h1c21.4 0 42.3-2.4 62-7l76 75.3V334.4c46.2-29.7 75.6-74 75.6-123.8 0-89.5-95.6-162-213.4-162zM179.2 363.2c-38 0-74.7-11.4-100.7-31.2-23-17.4-35.5-39.4-35.5-62s12.6-44.7 35.5-62c2.3-1.8 4.7-3.4 7-5l-.2 7.6c0 67 53.4 124.4 129.6 149.2-12 2.2-24 3.4-36 3.4zm42.7-127h-52V185h52v51.2zm102 0h-51V185h51v51.2zm102 0h-51V185h51v51.2z"></path>
            </svg>
          </div>

          <div class="d_button" onclick=${state.get('gui.gameMenu.event.showSave')}>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="-72 -72 612 612">
              <path fill="#fff" stroke="#000" stroke-width="20" shape-rendering="optimizeQuality" d="M357 0H51C23 0 0 23 0 51v357c0 28 23 51 51 51h357c28 0 51-23 51-51V102L357 0zM229.5 408c-43.4 0-76.5-33-76.5-76.5s33-76.5 76.5-76.5c43.4 0 76.5 33 76.5 76.5S273 408 229.5 408zM306 153H51V51h255v102z"></path>
            </svg>
          </div>

          <div class="d_button" onclick=${state.get('gui.gameMenu.event.showSettings')}>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="-30 -30 572 572">
              <path fill="#fff" stroke="#000" stroke-width="20" shape-rendering="optimizeQuality" d="M462 280.7v-49.4l-46.4-16.5c-4-15-10-29.3-17.7-42.4l21-44.6-34.8-35-44.5 21.2c-13.2-7.7-27.4-13.7-42.5-17.6L280.7 50h-49.4l-16.5 46.4c-15 4-29.3 10-42.4 17.7l-44.6-21-35 34.8 21.2 44.5c-7.7 13.2-13.7 27.4-17.6 42.5L50 231.3v49.4l46.4 16.5c4 15 10 29.3 17.7 42.4l-21 44.6 34.8 35 44.5-21.2c13.2 7.7 27.4 13.7 42.5 17.6l16.5 46.4h49.4l16.5-46.4c15-4 29.3-10 42.4-17.7l44.6 21 35-34.8-21.2-44.5c7.7-13.2 13.7-27.4 17.6-42.5l46.4-16.5zm-206 57.7c-45.5 0-82.4-37-82.4-82.4 0-45.5 37-82.4 82.4-82.4 45.5 0 82.4 37 82.4 82.4 0 45.5-37 82.4-82.4 82.4z"></path>
            </svg>
          </div>
        </div>
      </div>
    </div>
  `;
};
