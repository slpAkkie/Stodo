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
 * @param {Element|Node} child The element to get the parent for
 * @param {string} selector Selector of parent to find
 * @returns {Element|Node|null}
 */
function getParent( child, selector = '*' ) {
  let parentElement = child.parentElement;
  if ( !child || !parentElement ) return null;
  if ( parentElement.matches( selector ) ) return parentElement;
  else return getParent( parentElement, selector );
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
 * Execute callback function on each
 *
 * @param {any} value Values to execute on
 * @param {Function} callback
 * @returns {void}
 */
function each( value, callback ) {
  if ( !Array.isArray( value ) ) value = [ value ];
  value.forEach( ( el, i ) => callback.call( el, el, i ) );
}

/**
 * Make date from strings
 *
 * @param {string} date
 * @param {string} time
 * @returns {Date}
 */
function date( date, time = '' ) { return new Date( `${date}T${time || '23:59'}` ) }

/**
 * Returns how much days in ms
 *
 * @param {number} ms
 * @returns {number}
 */
function msToDays(ms) { return ms / 1000 / 3600 / 24 }

/**
 * Generate string with random characters
 *
 * @param {integer} length
 * @returns {string}
 */
function strrandom(length) {
  var result = '';
  var characters = 'abcdefghijklmnopqrstuvwxyz';

  for ( var _ = 0; _ < length; _++ )
    result += characters.charAt(Math.floor(Math.random() * characters.length));

  return result;
}










/**
 * Object to work with localStorage
 */
const storage = {

  /**
   * Save value to the localStorage with key
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
    let gotten = localStorage.getItem( key );
    return gotten ? JSON.parse( gotten ).data : defaultValue
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
  let version = storage.get( 'version', '' );
  if ( version !== '0.2' ) {
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
  if ( this.matches( '.tab_active' ) ) return;

  removeClass( select( `.tab_active` )[ 0 ], 'tab_active' );
  addClass( this, 'tab_active' );

  state.activeTabID = +!state.activeTabID;

  render();
}

/**
 * Save filter and rerender tasks
 *
 * @returns {void}
 */
function filterHandler() {
  state.filter = this.value ? this.value.split( ' ' ).filter( f => ( f ) ) : '';
  render();
}

/**
 * Render tasks on active tab
 *
 * @returns {void}
 */
function render() {
  TaskList.clearContainer();

  let tasks;

  if ( state.filter.length ) tasks = TaskList.getTasksByFilter( state.filter );
  else tasks = TaskList.getCurrentTasks();

  if ( tasks.length ) each( tasks, ( task, id ) => Task.render( task, id ) );
  else append( TaskList.container, create( `<h2 class="_text-center">Задачи отсутсвуют</h2>` ) );
}
