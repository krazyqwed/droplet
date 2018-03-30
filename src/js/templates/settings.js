import hyperHTML from 'hyperhtml';

export default state => {
  const isLayerVisible = state.get('settings.visible');
  const layerClasses = `d_settings d_layer__content ${isLayerVisible ? 'd_layer__content--visible' : ''}`;
  const scaleStyle = `transform: scale(${state.get('scale')});`;

  return hyperHTML.wire(state, ':settings')`
    <div class=${layerClasses} style=${scaleStyle}>
      <div class="d_settings__main-title">Settings</div>
      <div class="d_settings__content">
        <div class="d_settings__col">
          <div class="d_settings__title">Master volume</div>
          <d-slider></d-slider>
        </div>
        <div class="d_settings__col">
          <div class="d_settings__title">BGM volume</div>
          <d-slider></d-slider>
        </div>
        <div class="d_settings__col">
          <div class="d_settings__title">Effects volume</div>
          <d-slider></d-slider>
        </div>
      </div>
      <div class="d_settings__back d_button" onclick=${state.get('settings.event.back')}>Back</div>
    </div>
  `;
};
