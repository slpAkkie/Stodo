/**
 * Select an element from page
 *
 * @param {string} selector Selector of the element to get
 * @param {Element|Node} parent The parent element to search in. Default: document
 * @returns {Element[]}
 */
function select( selector, parent = document ) {
  let gotten = parent.querySelectorAll( selector );
  return gotten ? Array.from( gotten ) : []
}

/**
 * Set a class to the element
 *
 * @param {Element|Node} el Element to set the class
 * @param {string} className Class to set
 * @returns {Element|Node}
 */
function addClass( el, className ) {
  el.classList.add( className );
  return el
}

/**
 * Remove a class from the element
 *
 * @param {Element|Node} el Element to remove the class
 * @param {string} className Class to remove
 * @returns {Element|Node}
 */
function removeClass( el, className ) {
  el.classList.remove( className );
  return el
}

/**
 * Get the element parent
 *
 * @param {Element|Node} child The element to get th eparent for
 * @param {string} selector Selector of parent to find
 * @returns {Element|Node|null}
 */
function parent( child, selector = '*' ) {
  if ( !child || !( parentElement = child.parentElement ) ) return null
  if ( parentElement.matches( selector ) ) return parentElement
  else return parent( parentElement, selector )
}

/**
 * Create an element from it's markup
 *
 * @param {string} markup
 * @returns {ChildNode}
 */
function create( markup ) {
  let template = document.createElement( 'template' );
  template.innerHTML = markup.trim();
  return template.content.firstChild
}

/**
 * Insert element to the top of container
 *
 * @param {Element|Node} node The element to insert in
 * @param {Element|Node} child The element to be inserted
 * @returns {Element|Node} Inserted element
 */
function insertTop( node, child ) {
  node.insertBefore( child, node.firstChild );
  return child
}

/**
 * Insert element to the container
 *
 * @param {Element|Node} node The element to insert in
 * @param {Element|Node} child The element to be inserted
 * @returns {Element|Node} Inserted element
 */
function append( node, child ) {
  node.appendChild( child );
  return child
}










/**
 * Check if value is array
 *
 * @param {any} value
 * @returns {boolean}
 */
function isArray( value ) { return Array.isArray( value ) }

/**
 * Execute callback function on each
 *
 * @param {any} value Values to execute on
 * @param {Function} callback
 * @returns {void}
 */
function each( value, callback ) {
  if ( !isArray( value ) ) value = [ value ];
  value.forEach( ( el, i ) => callback.call( el, el, i ) );
}

/**
 * Check if values present in the array
 *
 * @param {Array} source Array to check
 * @param {any} values Values to be checked
 * @returns {boolean}
 */
function contains( source, values ) {
  if ( !isArray( values ) ) values = [ values ];

  let contain = false;

  source.forEach( sourceEl => values.forEach( value => { contain = contain || ( sourceEl === value ) } ) );

  return contain
}

/**
 * Make date from strings
 *
 * @param {string} date
 * @param {string} time
 * @returns {Date}
 */
function date( date, time = false ) { return new Date( `${date}${time ? `T${time}` : 'T23:59'}` ) }

/**
 * Returns how much days in ms
 *
 * @param {number} ms
 * @returns {number}
 */
function msToDays( ms ) { return ms / 1000 / 3600 / 24 }










/**
 * Object to work with localStorage
 */
const storage = {

  /**
   * Save value to the lcoalStorage with key
   *
   * @param {string} key
   * @param {any} value
   * @returns {any}
   */
  save( key, value ) {
    localStorage.setItem( key, JSON.stringify( { data: value } ) );
    return value
  },

  /**
   * Get value from localStorage by the key
   *
   * @param {string} key
   * @param {any} defaultValue
   * @returns {any}
   */
  get( key, defaultValue = null ) {
    return ( gotten = localStorage.getItem( key ) )
      ? JSON.parse( gotten ).data
      : defaultValue
  },

  /**
   * Clear localStorage saved values
   *
   * @returns {void}
   */
  clear() { localStorage.clear() },

};

/**
 * Check version of saved tasks
 * Earlier versions are not compatible
 *
 * @returns {void}
 */
function checkStorageVersion() {
  if ( ( version = storage.get( 'version', '' ) ) !== '0.2' ) {
    storage.clear();
    storage.save( 'version', '0.2' );
  }
}










/**
 * Switch tab to clicked on
 *
 * @returns {void}
 */
function switchTab() {
  removeClass( select( `.tab_active` )[ 0 ], 'tab_active' );
  addClass( this, 'tab_active' );

  window.state.activeTabID = +this.getAttribute( 'data-id' );

  render();
}

/**
 * Render tasks on active tab
 *
 * @returns {void}
 */
function render() {
  TaskList.clearContainer();

  let tasks,
    filter = window.state.filter;

  if ( filter.length ) tasks = TaskList.getTasksByFilter( filter );
  else tasks = TaskList.getCurrentTasks();

  if ( tasks.length ) each( tasks, ( task, id ) => Task.render( task, id ) );
  else append( TaskList.container, create( `<h2 class="_text-center">Задачи отсутсвуют</h2>` ) );
}
