/** App state */

let state = {

  activeTabID: 0,

  filter: '',

};










/** Initialize */
window.addEventListener( 'DOMContentLoaded', function () {

  checkStorageVersion();

  select( '#filter-query' )[ 0 ].addEventListener( 'input', filterHandler );
  select( '#task-new' )[ 0 ].addEventListener( 'click', Task.createNew );
  select( '#popup-close' )[ 0 ].addEventListener( 'click', Popup.hide );
  select( '#popup-sub-add' )[ 0 ].addEventListener( 'click', Popup.addSub );
  each( select( '.tab' ), tab => tab.addEventListener( 'click', switchTab ) );

  Popup.delButton.addEventListener( 'click', Popup.deleteHandler );
  Popup.saveButton.addEventListener( 'click', Popup.saveHandler );



  // Load tabs from storage or save empty data
  TaskList.load( storage.get( 'tabs', TaskList.tabs ) );
  TaskList.save();

} );
