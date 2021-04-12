// App state
window.state = {
  active_tab: 'active',
  openedTaskID: null,
  openedMode: null,
  filterQuery: '',
};



// Event listeners
window.addEventListener( 'DOMContentLoaded', function () {

  if ( tabs = storage.get( 'tabs' ) ) TaskList.load( tabs );
  else TaskList.save();

  sel( '#task-new' )[ 0 ].addEventListener( 'click', Task.create );
  sel( '#popup-close' )[ 0 ].addEventListener( 'click', Popup.hide.bind( Popup ) );

  each( sel( '.tab' ), el => el.addEventListener( 'click', switchTab ) );

  render();

} );
