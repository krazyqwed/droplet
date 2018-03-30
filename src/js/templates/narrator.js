import hyperHTML from 'hyperhtml';

export default state => {
  const isVisible = state.get('gui.narrator.visible');
  const guiClasses = `d_gui__content ${isVisible ? 'd_gui__content--visible' : ''}`;
  const scaleStyle = `transform: scale(${state.get('scale')});`;
  const narratorClasses = ['d_narrator'];

  if (state.get('gui.narrator.visible')) {
    narratorClasses.push('d_gui__content--visible');
  }

  if (!state.get('gui.narrator.next')) {
    narratorClasses.push('d_narrator--no-next');
  }

  if (!state.get('gui.narrator.background')) {
    narratorClasses.push('d_narrator--no-background');
  }

  if (state.get('gui.narrator.running')) {
    narratorClasses.push('d_narrator--running');
  }

  if (state.get('gui.narrator.position') !== 'top') {
    narratorClasses.push(`d_narrator--position-${state.get('gui.narrator.position')}`);
  }

  return hyperHTML.wire(state, ':narrator')`
    <div class=${guiClasses} style=${scaleStyle}>
      <div class=${narratorClasses.join(' ')}>
        <div class="d_narrator__inner">${{ html: state.get('gui.narrator.text') }}</div>
        <div class="d_narrator__next"></div>
      </div>
    </div>
  `;
};
