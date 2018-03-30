import hyperHTML from 'hyperhtml';

const saveButton = (file, promptSaveEvent) => hyperHTML.wire()`<div class="d_button" onclick=${promptSaveEvent.bind(null, file)}>Save</div>`;
const loadButton = (file, promptLoadEvent) => hyperHTML.wire()`<div class="d_button" onclick=${promptLoadEvent.bind(null, file)}>Load</div>`;
const deleteButton = (file, promptDeleteEvent) => hyperHTML.wire()`<div class="d_save__delete d_button d_button--small d_button--warning" onclick=${promptDeleteEvent.bind(null, file)}>Delete</div>`;

const generateTile = (state, file) => {
  const isSaveVisible = state.get('save.isSave');
  const isLoadVisible = !!file.saveData;
  const isDeleteVisible = !!file.saveData;

  return hyperHTML.wire(state, `:saveFile-${file.index}`)`
    <div class="d_save__tile">
      <img class="d_save__thumbnail" src=${file.saveData.thumbnail || 'static/submenu_2.jpg'}>
      <div class="d_save__title">${file.saveData.title || '---'}</div>
      <div class="d_save__date">${file.date}</div>
      <div class="d_save__number">${'#' + ('00' + (file.index + 1)).slice(-3)}</div>
      <div class="d_save__button-wrap">
        ${isSaveVisible ? saveButton(file, state.get('save.event.promptSave')) : null}
        ${isLoadVisible ? loadButton(file, state.get('save.event.promptLoad')) : null}
      </div>
      ${isDeleteVisible ? deleteButton(file, state.get('save.event.promptDelete')) : null}
    </div>
  `;
};

export default state => {
  const isLayerVisible = state.get('save.visible');
  const layerClasses = `d_save d_layer__content ${isLayerVisible ? 'd_layer__content--visible' : ''}`;
  const scaleStyle = `transform: scale(${state.get('scale')});`;

  return hyperHTML.wire(state, ':save')`
    <div class=${layerClasses} style=${scaleStyle}>
      <div class="d_save__main-title">${state.get('save.isSave') ? 'SAVE / LOAD GAME' : 'LOAD GAME'}</div>
      <div class="d_save__content">
        ${state.get('save.files').map(file => generateTile(state, file))}
      </div>
      <div class="d_save__back d_button" onclick=${state.get('save.event.back')}>Back</div>
    </div>
  `;
};
