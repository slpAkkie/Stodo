// DOM

function sel( selector, parent = document ) {
  let gotten = parent.querySelectorAll( selector );

  return gotten ? Array.from( gotten ) : [];
}

function addClass( el, className ) {
  el.classList.add( className );
}
function removeClass( el, className ) {
  el.classList.remove( className );
}

// Support

function each( what, callback ) {
  if ( !Array.isArray( what ) ) what = [ what ];

  what.forEach( ( el, i ) => callback.call( el, el, i ) );
}

// App

function switchTab() {
  removeClass( sel( '.tab.tab_active' )[ 0 ], 'tab_active' );
  addClass( this, 'tab_active' );

  window.state.active_tab = this.id;
}
