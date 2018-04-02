import hyperHTML from 'hyperhtml';

const generateInput = state => hyperHTML.wire(state, `:inputElement`)`<input type="text" class="d_input">`;

const generateButton = (state, inputElement) => {
  const buttonClasses = ['d_button'];

  if (state.get('gui.input.confirmed')) {
    buttonClasses.push('d_button--success');
  }

  return hyperHTML.wire(state, `:inputButton`)`
    <div class=${buttonClasses.join(' ')} onclick=${state.get('gui.input.event.confirmInput').bind(null, inputElement)}>OK</div>
  `;
};

export default state => {
  const guiClasses = ['d_gui__content'];

  if (state.get('gui.input.visible')) {
    guiClasses.push('d_gui__content--visible');
  }

  if (state.get('gui.input.enabled')) {
    guiClasses.push('d_gui__content--interactive');
  }

  const scaleStyle = `transform: scale(${state.get('scale')});`;
  const inputElement = generateInput(state);

  if (state.get('gui.input.visible')) {
    inputElement.focus();
  }

  return hyperHTML.wire(state, ':input')`
    <div class=${guiClasses.join(' ')} style=${scaleStyle}>
      <div class="d_input-wrap">
        ${inputElement}
        ${generateButton(state, inputElement)}
      </div>
    </div>
  `;
};
