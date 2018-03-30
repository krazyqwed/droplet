import hyperHTML from 'hyperhtml';

const setActiveClass = (activeItem, index) => `d_main-menu__item ${index === activeItem ? 'd_main-menu__item--active' : ''} `;

export default state => {
  const isLayerVisible = state.get('mainMenu.visible');
  const layerClasses = `d_main-menu d_layer__content ${isLayerVisible ? 'd_layer__content--visible' : ''}`;
  const scaleStyle = `transform: scale(${state.get('scale')});`;
  const activeItem = state.get('mainMenu.activeItem');

  return hyperHTML.wire(state, ':mainMenu')`
    <div class=${layerClasses} style=${scaleStyle}>
      <div class="d_main-menu__inner">
        <div
          class=${setActiveClass(activeItem, 1)}
          onclick=${state.get('mainMenu.event.new')}
          onmouseenter=${state.get('mainMenu.event.mouseenter').bind(null, 1)}>New Game</div>
        <div
          class=${setActiveClass(activeItem, 2)}
          onclick=${state.get('mainMenu.event.load')}
          onmouseenter=${state.get('mainMenu.event.mouseenter').bind(null, 2)}>Load Game</div>
        <div
          class=${setActiveClass(activeItem, 3)}
          onclick=${state.get('mainMenu.event.settings')}
          onmouseenter=${state.get('mainMenu.event.mouseenter').bind(null, 3)}>Settings</div>
        <div
          class=${setActiveClass(activeItem, 4)}
          onclick=${state.get('mainMenu.event.exit')}
          onmouseenter=${state.get('mainMenu.event.mouseenter').bind(null, 4)}>Exit</div>
      </div>
    </div>
  `;
};
