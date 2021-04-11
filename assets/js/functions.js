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

function parent( child, selector = '*' ) {
  if ( !( child = child.parentElement ).matches( selector ) ) return parent( child, selector )
  else return child;
}

function create( markup ) {
  let template = document.createElement( 'template' );
  template.innerHTML = markup.trim();

  return template.content.firstChild;
}

function insertTop( where, what ) {
  where.insertBefore( what, where.firstChild );
  return what;
}

function append( where, what ) {
  where.appendChild( what );
  return what;
}

// Support

function isArray( what ) { return Array.isArray( what ) }

function each( what, callback ) {
  if ( !isArray( what ) ) what = [ what ];

  what.forEach( ( el, i ) => callback.call( el, el, i ) );
}

function contains( where, what ) {
  if ( !isArray( what ) ) what = [ what ];

  let contain = false;

  what.forEach( el => {
    where.forEach( cmp => {
      contain = contain || ( el === cmp )
    } );
  } );

  return contain;
}

// Storage

const storage = {
  save( key, value ) {
    localStorage.setItem( key, JSON.stringify( { data: value } ) );
    return value;
  },
  get( key, def = null ) {
    let gotten = localStorage.getItem( key );

    return gotten ? JSON.parse( gotten ).data : def;
  },
  clear() { localStorage.clear() },
};

// App

function switchTab() {
  removeClass( sel( `#${window.state.active_tab}` )[ 0 ], 'tab_active' );
  addClass( this, 'tab_active' );

  window.state.active_tab = this.id;

  render();
}

function render() {
  TaskList.taskContainer.innerHTML = null;
  let tasks = TaskList.getCurrent();

  if ( tasks.length ) tasks.forEach( ( task, id ) => Task.render( task, id ) );
  else append( TaskList.taskContainer, create( `<h2 class="_text-center">Задачи отсутсвуют</h2>` ) );
}
