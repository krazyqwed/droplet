import mainMenuTemplate from './main-menu';
import gameMenuTemplate from './game-menu';
import saveTemplate from './save';
import alertTemplate from './alert';
import textboxTemplate from './textbox';
import narratorTemplate from './narrator';
import chooseTemplate from './choose';
import inputTemplate from './input';
import historyTemplate from './history';
import settingsTemplate from './settings';

export default (renderer, state) => {
  const wrapperStyle = `${`width: ${state.get('wrapper.width')}px; height: ${state.get('wrapper.height')}px;`}`;
  const scaleStyle = `transform: scale(${state.get('scale')});`;
  const isGuiVisible = state.get('gui.visible');
  const guiClasses = `d_gui ${isGuiVisible ? 'd_gui--visible' : ''}`;

  renderer`
    <div class="d_version">${state.get('version')}</div>

    <div class="d_dimension-helper js_dimension_helper">
      <div class="d_dimension-helper__scale js_scale_helper"></div>
    </div>

    <div class="d_effect-wrapper" style=${wrapperStyle}>
      <div class="d_blink js_blink" style=${scaleStyle}>
        <svg width="100%" height="100%" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
          <defs id="f1" x="0" y="0">
            <feGaussianBlur in="SourceGraphic", stdDeviation="15"></feGaussianBlur>
            <mask id="Mask">
              <rect x="0" y="0" width="100%" height="100%" fill="white"></rect>
              <ellipse cx="50%" cy="50%" rx="75%" ry="50%" filter="url(#f1)"></ellipse>
            </mask>
          </defs>
          <rect x="0" y="0" width="100%" height="100%" fill="black" mask="url(#Mask)"></rect>
        </svg>
      </div>
    </div>

    <div class="d_game-wrapper" style=${wrapperStyle}>
      <div class=${guiClasses}>
        ${textboxTemplate(state)}
        ${narratorTemplate(state)}
        ${chooseTemplate(state)}
        ${inputTemplate(state)}
        ${gameMenuTemplate(state)}
      </div>
      <div class="d_layer js_prevent_skip">
        ${mainMenuTemplate(state)}
        ${saveTemplate(state)}
        ${alertTemplate(state)}
        ${historyTemplate(state)}
        ${settingsTemplate(state)}
        <div class="d_layer__background"></div>
      </div>
    </div>

    <div class="d_fader d_fader--visible js_fader"></div>
  `;
};
