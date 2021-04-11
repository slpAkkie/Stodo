const Popup = {

  get window() { return sel( '.popup' )[ 0 ] },
  set windowTitle( v ) { },

  get title() { },
  get date() { },
  get time() { },
  get completed() { },
  get subs() { },

  get controls() { return sel( '#js-popup-controls' )[ 0 ] },

  set title( v ) { },
  set date( v ) { },
  set time( v ) { },
  set completed( v ) { },
  set subs( v ) { },

  renderButton( button ) { this.controls.append( button ) },

  renderDeleteButton() { this.renderButton( create( `<div class="button button_danger _ml-2" id="popup-delete">Удалить</div>` ) ) },
  renderSaveButton() { this.renderButton( create( `<div class="button button_success _ml-2" id="popup-save">Сохранить</div>` ) ) },

  show() {
    if ( window.state.openedMode === 'edit' ) this.renderDeleteButton();
    this.renderSaveButton();
    addClass( this.window, 'popup_shown' );
  },
  hide() {
    window.state.openedMode = null;
    removeClass( this.window, 'popup_shown' );
  },
  fillWith( obj ) { },
  clear() { },
  resetErrors() { },
  setError( field ) { },

  checkFields() { },
  getData() { },

};
