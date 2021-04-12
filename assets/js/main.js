/** App state */

window.state = {

  activeTabID: 0,

  filter: '',

};










/** Initialize */
window.addEventListener( 'DOMContentLoaded', function () {

  checkStoreVersion();

  // Load tabs from storage or save empty data
  ( tabs = storage.get( 'tabs' ) ) ? TaskList.load( tabs ) : TaskList.save();

  select( '#task-new' )[ 0 ].addEventListener( 'click', Popup.show );
  select( '#popup-close' )[ 0 ].addEventListener( 'click', Popup.hide );
  select( '#popup-sub-add' )[ 0 ].addEventListener( 'click', Popup.addSub );
  each( select( '.tab' ), tab => tab.addEventListener( 'click', switchTab ) );



  // First render
  render();

} );
