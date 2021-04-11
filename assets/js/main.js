// App state
window.state = {
  active_tab: 'active',
  openedTaskID: null,
  openedMode: null,
  filterQuery: '',
};



// Event listeners
window.addEventListener( 'DOMContentLoaded', function () {

  if ( tabs = storage.get( 'tabs' ) ) {
    TaskList.active = tabs.active;
    TaskList.completed = tabs.completed;
  } else {
    storage.save( 'tabs', { active: TaskList.active, completed: TaskList.completed } );
  }

  sel( '#add-task' )[ 0 ].addEventListener( 'click', Task.create );
  sel( '#popup-close' )[ 0 ].addEventListener( 'click', Popup.hide.bind( Popup ) );

  each( sel( '.tab' ), el => el.addEventListener( 'click', switchTab ) );

  render();

} );
