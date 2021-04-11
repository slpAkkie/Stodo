window.state = {
  active_tab: 'active',
};



window.addEventListener( 'DOMContentLoaded', function () {

  each( sel( '.tab' ), el => el.addEventListener( 'click', switchTab ) );

} );
