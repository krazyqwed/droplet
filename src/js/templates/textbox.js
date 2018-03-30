import hyperHTML from 'hyperhtml';

export default state => {
  const isVisible = state.get('gui.textbox.visible');
  const guiClasses = `d_gui__content ${isVisible ? 'd_gui__content--visible' : ''}`;
  const scaleStyle = `transform: scale(${state.get('scale')});`;
  const speakerStyle = `background-color: ${state.get('gui.textbox.speakerColor')};`;
  const textboxClasses = ['d_textbox'];

  if (state.get('gui.textbox.visible')) {
    textboxClasses.push('d_gui__content--visible');
  }

  if (!state.get('gui.textbox.next')) {
    textboxClasses.push('d_textbox--no-next');
  }

  if (!state.get('gui.textbox.background')) {
    textboxClasses.push('d_textbox--no-background');
  }

  if (state.get('gui.textbox.running')) {
    textboxClasses.push('d_textbox--running');
  }

  return hyperHTML.wire(state, ':textbox')`
    <div class=${guiClasses} style=${scaleStyle}>
      <div class=${textboxClasses.join(' ')}>
        ${state.get('gui.textbox.speaker') ? hyperHTML.wire(state, ':textboxSpeaker')`<div class="d_speaker" style=${speakerStyle}>${state.get('gui.textbox.speaker')}</div>` : null}
        <div class="d_textbox__inner">${{ html: state.get('gui.textbox.text') }}</div>
        <div class="d_textbox__next"></div>
      </div>
    </div>
  `;
};
