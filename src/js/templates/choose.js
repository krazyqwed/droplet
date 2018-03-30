import hyperHTML from 'hyperhtml';

const generateOption = (state, option) => {
  const optionClasses = ['d_choose__option'];

  if (state.get('gui.choose.activeItem') === option.index) {
    optionClasses.push('d_choose__option--active');
  }

  if (state.get('gui.choose.selectedItem') === option.index) {
    optionClasses.push('d_choose__option--blink');
  }

  return hyperHTML.wire(option, `:chooseOption`)`
    <div 
      class=${optionClasses.join(' ')}
      onmouseenter=${state.get('gui.choose.event.mouseenter').bind(null, option)}
      onmouseleave=${state.get('gui.choose.event.mouseleave')}
      onclick=${state.get('gui.choose.event.select').bind(null, option)}>${{ html: option.text }}</div>
  `;
};


export default state => {
  const guiClasses = ['d_gui__content'];

  if (state.get('gui.choose.visible')) {
    guiClasses.push('d_gui__content--visible');
  }

  if (state.get('gui.choose.enabled')) {
    guiClasses.push('d_gui__content--interactive');
  }

  const scaleStyle = `transform: scale(${state.get('scale')});`;

  return hyperHTML.wire(state, ':choose')`
    <div class=${guiClasses.join(' ')} style=${scaleStyle}>
      <div class="d_choose">
        ${state.get('gui.choose.items').map(option => generateOption(state, option))}
      </div>
    </div>
  `;
};
