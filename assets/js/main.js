/** App state */

window.state = {

  activeTabID: 0,

  filter: '',

};










/** Initialize */
window.addEventListener( 'DOMContentLoaded', function () {

  checkStorageVersion();

  // Load tabs from storage or save empty data
  ( tabs = storage.get( 'tabs' ) ) ? TaskList.load( tabs ) : TaskList.save();

  select( '#filter-query' )[ 0 ].addEventListener( 'input', TaskList.filterHandler );
  select( '#task-new' )[ 0 ].addEventListener( 'click', Task.create );
  select( '#popup-close' )[ 0 ].addEventListener( 'click', Popup.hide );
  select( '#popup-sub-add' )[ 0 ].addEventListener( 'click', Popup.addSub );
  each( select( '.tab' ), tab => tab.addEventListener( 'click', switchTab ) );



  // First render
  render();

} );
