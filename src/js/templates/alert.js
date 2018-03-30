import hyperHTML from 'hyperhtml';

export default state => {
  const isLayerVisible = state.get('alert.visible');
  const layerClasses = `d_alert d_layer__content d_layer__content--flex ${isLayerVisible ? 'd_layer__content--visible' : ''}`;
  const scaleStyle = `transform: scale(${state.get('scale')});`;

  return hyperHTML.wire(state, ':alert')`
    <div class=${layerClasses} style=${scaleStyle}>
      <div class="d_alert__content">
        <div class="d_alert__description">${state.get('alert.description')}</div>
        <div class="d_alert__answers">
          <div class="d_alert__cancel d_button" onclick=${state.get('alert.event.cancel')}>${state.get('alert.cancel')}</div>
          <div class="d_alert__confirm d_button d_button--warning" onclick=${state.get('alert.event.confirm')}>${state.get('alert.confirm')}</div>
        </div>
      </div>
    </div>
  `;
};
