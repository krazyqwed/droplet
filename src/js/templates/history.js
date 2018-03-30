import hyperHTML from 'hyperhtml';

const generateAvatar = (state, entry) => {
  if (!entry.avatar) { return null; }

  const backgroundStyle = `background-color: ${entry.color}; background-image: url('${entry.avatar}');`;

  return hyperHTML.wire(state, `:historyEntryAvatar-${entry.index}`)`
    <div class="d_history__avatar" style=${backgroundStyle}></div>
  `;
}

const generateEntry = (state, entry) => {
  const entryClass = `d_history__entry ${entry.avatar ? 'd_history__entry--avatar' : ''}`;

  return hyperHTML.wire(state, `:historyEntry-${entry.index}`)`
    <div class=${entryClass}>
      ${generateAvatar(state, entry)}
      ${{ html: entry.text }}
    </div>
  `;
};

export default state => {
  const isLayerVisible = state.get('history.visible');
  const layerClasses = `d_history d_layer__content ${isLayerVisible ? 'd_layer__content--visible' : ''}`;
  const scaleStyle = `transform: scale(${state.get('scale')});`;

  const historyElement = hyperHTML.wire(state, ':history')`
    <div class=${layerClasses} style=${scaleStyle}>
      <div class="d_history__content">
        ${state.get('history.entries').map(entry => generateEntry(state, entry))}
      </div>
      <div class="d_history__back d_button" onclick=${state.get('history.event.back')}>Back</div>
    </div>
  `;

  const contentElement = historyElement.querySelector('.d_history__content');
  contentElement.scrollTop = contentElement.scrollHeight;

  return historyElement;
};
