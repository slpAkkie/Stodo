/**
 * --------------------------------------------------
 * Defaults
 */

const data = {
  active_tab: 0,
  editID: null,
};



/**
 * LS for test
 * {"data":{"currentTab":"active","inactiveTab":"completed","active":[{"title":"First todo","until":{"date":"10.01.2021","time":"11:00"},"subs":[],"completed":false},{"title":"Second todo","until":{"date":"11.04.2021","time":"21:00"},"subs":[{"title":"First sub for second todo","completed":false}],"completed":false}],"completed":[]}}
 */



/**
 * --------------------------------------------------
 * Tabs data
 */

let tabs = {

  get currentTab() {
    return data.active_tab ? 'completed' : 'active';
  },

  get inactiveTab() {
    return data.active_tab ? 'active' : 'completed';
  },

  getCurrentTab() { return this[ this.currentTab ] },
  getInactiveTab() { return this[ this.inactiveTab ] },

  active: [],
  completed: [],

};



/**
 * --------------------------------------------------
 * Task functions
 */

const task = {

  /**
   * Tasks container
   */
  container: '.todos-container',
  get containerEl() { return selectEl( this.container ) },

  /**
   * Open popup window to create new task
   */
  create() {
    popup.mode = 'create';
    popup.show();
  },

  /**
   * Add new task to the todo list
   */
  add() {
    popup.clearErrors();

    let popupData = popup.getData();
    let errors = false;

    if ( !popupData.title ) {
      addClass( popup.titleEl, 'input_wrong' );
      errors = true;
    }
    if ( popupData.until.date ) {
      if ( popupData.until.time && makeDate( popupData.until.date, popupData.until.time ) - Date.now() < 0 ) {
        addClass( popup.dateEl, 'input_wrong' );
        addClass( popup.timeEl, 'input_wrong' );
        errors = true;
      }
      else if ( makeDate( popupData.until.date, nextMinute() ) - Date.now() < 0 ) {
        addClass( popup.dateEl, 'input_wrong' );
        errors = true;
      }
    } else if ( popupData.until.time ) {
      addClass( popup.dateEl, 'input_wrong' );
      errors = true;
    }

    each( popupData.subs, ( el, i ) => {
      if ( !el.title ) addClass( selectEl( '.popup__sub-title' )[ i ], 'input_wrong' );
      errors = true;
    } );

    if ( errors ) return;



    if ( popup.mode === 'edit' ) task.update( popupData );
    else tabs.getCurrentTab().push( popupData );
    popup.hide();
    task.save();
    render();
  },

  /**
   * Update an exiting task
   */
  update( newData ) {
    tabs.getCurrentTab()[ data.editID ] = newData;
    if ( newData.completed ) this.move( data.editID, tabs.completed );
  },

  /**
   * Delete task
   */
  delete( id ) {
    let currentTab = tabs.getCurrentTab();

    for ( let i = id; i < currentTab.length - 1; i++ )
      currentTab[ i ] = currentTab[ i + 1 ];

    currentTab.length--;
    popup.hide();
    task.save();
    render();
  },

  /**
   * Open popup window to edit task
   */
  edit() {
    data.editID = this.dataID;
    popup.mode = 'edit';
    popup.fill( tabs.getCurrentTab()[ this.dataID ] );
    popup.show();
  },

  /**
   * Set task as completed
   */
  changeCompleteState() {
    let rootTodoEl = parent( this, '[class$=todo]' );
    if ( !rootTodoEl ) return false;

    let parentID = rootTodoEl.parentID;
    let id = rootTodoEl.dataID;

    let curTab = tabs.getCurrentTab();
    if ( parentID !== undefined ) {
      let completed = curTab[ parentID ].subs[ id ].completed = this.checked;
      if ( !completed && curTab[ parentID ].completed ) {
        curTab[ parentID ].completed = false;
        task.move( parentID, tabs.active );
      }
    }
    else {
      let completed = curTab[ id ].completed = this.checked;
      if ( completed ) task.move( id, tabs.completed );
      else task.move( id, tabs.active )
    }

    task.save();
  },

  /**
   * Save tasks and rerender
   */
  save() {
    ls.set( 'tabs', tabs );
    render();
  },

  /**
   * Filter tasks
   *
   * @param criteria
   */
  filter( criteria = [] ) { },

  /**
   * Calculate status from the until date and time
   *
   * @returns {Array}
   */
  calculateStatus( until ) {
    if ( !until.date ) return [ '', '' ];
    let date = makeDate( until.date, until.time || nextMinute() );
    let dateDiff = date - Date.now();
    if ( dateDiff < 0 ) return [ 'Просрочено', '_text-danger' ];
    else if ( ( dateDiff = countDays( dateDiff ) ) <= 1 ) return [ 'Сегодня', '_text-success' ];
    else if ( dateDiff <= 2 ) return [ 'Завтра', '_text-success' ];
    return [ `${until.date} ${until.time}`, '_text-success' ];
  },

  /**
   * Render task
   *
   * @param data
   * @param id
   * @returns {ChildNode}
   */
  render( data, id ) {
    let { title, completed, until, subs } = data;
    let [ status, statusClass ] = this.calculateStatus( until );
    let isSubs = subs.length;

    let markup = `<div class="todo">
      <div class="todo__inner row">
        <div class="col">
          <input class="todo__completed-checkbox _mt-1" type="checkbox" ${completed ? 'checked' : ''} ${!task.allSubsCompleted( subs ) ? 'disabled' : ''}>
        </div>
        <div class="todo__title-wrapper _flex sm:col lg:row _grow _justify-between _ml-4">
          <div class="todo__title">
            <span>${title}</span>
          </div>
          <div class="todo__until-status _text-semi-bold sm:_mt-1 ${statusClass}">
            <span>${status}</span>
          </div>
        </div>
      </div>
      ${isSubs ? '<div class="todo__subs"></div>' : ''}
    </div>`;

    let todo = createEl( markup );

    if ( isSubs ) {
      let subContainer = selectEl( '.todo__subs', todo );
      subs.forEach( ( sub, subID ) => {
        subContainer.append( task.renderSub( sub, id, subID ) );
      } );
    }

    todo.dataID = id;

    selectEl( '.todo__title-wrapper', todo ).addEventListener( 'click', task.edit.bind( todo ) );
    each( selectEl( '.todo__completed-checkbox', todo ), el => el.addEventListener( 'click', task.changeCompleteState ) );

    return todo;
  },

  /**
   * Render sub task
   *
   * @param data
   * @param parentID
   * @param id
   * @returns {ChildNode}
   */
  renderSub( data, parentID, id ) {
    let { title, completed } = data;

    let markup = `<div class="sub-todo">
      <div class="row _align-center">
        <div class="col">
            <input class="todo__completed-checkbox" type="checkbox" ${completed ? 'checked' : ''}>
        </div>
        <div class="col">
          <div class="todo__title _ml-4">
            <span>${title}</span>
          </div>
        </div>
      </div>
    </div>`;

    let sub = createEl( markup );
    sub.parentID = parentID;
    sub.dataID = id;

    return sub;
  },

  allSubsCompleted( subs ) {
    let subsCompleted = true;
    subs.forEach( el => subsCompleted = subsCompleted && el.completed );

    return subsCompleted;
  },

  /**
   * Move task between tabs
   */
  move( id, tab ) {
    let currentTab = tabs.getCurrentTab();

    if ( currentTab === tab ) return;

    tab.push( currentTab[ id ] );

    for ( let i = id; i < currentTab.length - 1; i++ )
      currentTab[ i ] = currentTab[ i + 1 ];

    currentTab.length--;
  },

};



/**
 * --------------------------------------------------
 * Helpers
 */

/**
 * Create element from markup
 *
 * @param markup
 * @returns {ChildNode}
 */
function createEl( markup ) {
  let template = document.createElement( 'template' );
  template.innerHTML = markup.trim();
  return template.content.firstChild;
}

/**
 * Insert element first in the parent
 *
 * @param parent
 * @param child
 */
function insertFirst( parent, child ) {
  parent.insertBefore( child, parent.firstChild )
}

/**
 * Find parent which match the selector
 *
 * @param element
 * @param selector
 */
function parent( element, selector = null ) {
  if ( !selector ) return element.parentElement;

  if ( element.matches( 'body' ) ) return null;
  if ( !element.parentElement.matches( selector ) ) return parent( element.parentElement, selector );
  else return element.parentElement;
}

/**
 * Make date from string in format dd.mm.yyyy
 *
 * @param {string} date
 * @param {string} time
 * @returns Date
 */
function makeDate( date, time = '' ) {
  return new Date( `${date.replace( /(\d+).(\d+).(\d+)/, '$3-$2-$1' )}${time ? ' ' + time : ''}` );
}

/**
 * Count how much days in seconds
 *
 * @param {number} ms
 * @returns number
 */
function countDays( ms ) {
  return ms / 1000 / 3600 / 24;
}

function nextMinute() { return new Date( Date.now() + 60000 ).toLocaleTimeString().slice( 0, -3 ) }



/**
 * --------------------------------------------------
 * General functions
 */

/**
 * Render tasks to the task container
 */
function render( tab = null ) {
  if ( !tab ) tab = tabs.getCurrentTab();
  let todosContainer = task.containerEl,
    todos = tabs.getCurrentTab();
  todosContainer.innerHTML = null;
  if ( !todos.length ) todosContainer.append( createEl( `<h3 class="_text-center">В этом списке нет задач</h3>` ) );
  else todos.forEach( ( todo, id ) => insertFirst( todosContainer, task.render( todo, id ) ) );
}

function extractFilters() { }

/**
 * Switch tab
 */
function tabSwitch() {
  if ( hasClass( this, 'active' ) ) return;

  let id = data.active_tab = +!data.active_tab;
  addClass( selectEl( `.tab[data-id="${id}"]` ), 'active' );
  removeClass( selectEl( `.tab[data-id="${+!id}"]` ), 'active' );
  render()
}



/**
 * --------------------------------------------------
 * Popup functions
 */

const popup = {

  /**
   * Can be 'create', 'edit'
   * @var {string} define in which mode popup will be opened
   */
  mode: 'create',

  /**
   * Sub container
   */
  emptySubContainerClass: 'popup__subs-container_empty',
  subContainerSelector: '#js-subs-container',
  get subContainerEl() { return selectEl( this.subContainerSelector ) },
  get subs() { return selectEl( '.popup__sub', this.subContainerEl ) },

  /**
   * Popup window
   */
  selector: '.popup',
  get el() { return selectEl( this.selector ) },

  /**
   * Popup's control buttons
   */
  controlButtonsSelector: '.popup__control-button',
  get controlButtons() { return selectEl( this.controlButtonsSelector ) },

  /**
   * Elements from popup
   */
  get titleEl() { return selectEl( '#js-popup-title' ) },
  get dateEl() { return selectEl( '#js-popup-date' ) },
  get timeEl() { return selectEl( '#js-popup-time' ) },
  get completedEl() { return selectEl( '#js-popup-completed' ) },

  /**
   * Values from popup
   */
  get title() { return this.titleEl.value },
  get date() {
    let untilDate = this.dateEl.valueAsDate;
    return untilDate ? untilDate.toLocaleDateString() : null;
  },
  get time() { return this.timeEl.value || null },
  get completed() { return this.completedEl.checked },
  get childs() { return this.getSubsData() },

  /**
   * Show popup and generate control buttons
   */
  show() {
    let editMode = this.mode === 'edit';

    let cancelButton = createEl( `<input type="button" value="Отменить" class="button popup__cancel">` );
    this.controlButtons.append( cancelButton );
    cancelButton.addEventListener( 'click', popup.hide.bind( popup ) );

    if ( editMode ) {
      let deleteButton = createEl( `<input type="button" value="Удалить" class="button button_danger popup__delete _ml-2">` );
      this.controlButtons.append( deleteButton );
      deleteButton.addEventListener( 'click', task.delete.bind( deleteButton, data.editID ) );
    }

    let saveButton = createEl( `<input type="button" value="${editMode ? 'Сохранить' : 'Создать'}" class="button button_success popup__save _ml-2">` );
    this.controlButtons.append( saveButton );
    saveButton.addEventListener( 'click', task.add.bind( selectEl( '.popup__body', popup.el ) ) );

    addClass( this.el, '_shown' );
  },

  /**
   * Remove all wrong classes from inputs
   */
  clearErrors() {
    let prevsErorrs = selectEl( '.input_wrong', popup.el );
    prevsErorrs && each( prevsErorrs, el => removeClass( el, 'input_wrong' ) )
  },

  /**
   * Hide popup
   */
  hide() {
    data.editID = null;
    popup.reset();
    removeClass( this.el, '_shown' );
  },

  /**
   * Reset input data in the popup
   */
  reset() {
    selectEl( '#js-popup-title' ).value = null;
    selectEl( '#js-popup-date' ).value = null;
    selectEl( '#js-popup-time' ).value = null;
    selectEl( '#js-popup-completed' ).checked = false;
    selectEl( '#js-subs-container' ).innerHTML = null;
    addClass( selectEl( '#js-subs-container' ), this.emptySubContainerClass );

    this.clearErrors();

    this.controlButtons.innerHTML = null;
  },

  /**
   * Fill popup fields with data
   *
   * @param data
   */
  fill( data = {} ) {
    this.titleEl.value = data.title;
    if ( data.until.date ) {
      this.dateEl.value = data.until.date.replace( /(\d+).(\d+).(\d+)/, '$3-$2-$1' ) || null;
      this.timeEl.value = data.until.time || null;
    }
    this.completedEl.checked = data.completed || false;
  },

  /**
   * Get data from popup
   *
   * @returns {Object}
   */
  getData() {
    let data = { until: {} };
    data.title = this.title;
    data.until.date = this.date;
    data.until.time = this.time;
    data.completed = this.completed;
    data.subs = this.childs;

    return data;
  },

  /**
   * Get array of subs data
   *
   * @returns {Array}
   */
  getSubsData() {
    let data = [];
    each( this.subs, el => {
      data.push( {
        title: selectEl( '.popup__sub-title', el ).value,
        completed: selectEl( '.popup__sub-checkbox', el ).checked,
      } )
    } );

    return data;
  },

  /**
   * Add new sub task to the popup
   */
  addSub( completed = false, title = '' ) {
    let markup = `
      <div class="popup__sub row _align-center">
        <input type="checkbox" class="popup__sub-checkbox" ${completed ? 'checked' : ''}>
        <input type="text" class="popup__sub-title input _grow _ml-4" value="${title}">
        <span class="popup__sub-delete-button _ml-2 _font-small _text-danger _text-semi-bold">Удалить</span>
      </div>
    `;

    let subContainer = this.subContainerEl;
    removeClass( subContainer, this.emptySubContainerClass );
    let sub = createEl( markup );
    subContainer.append( sub );

    selectEl( '.popup__sub-delete-button', sub ).addEventListener( 'click', this.removeSub );
  },

  /**
   * Remove sub task from the popup
   */
  removeSub() {
    this.parentElement.remove();

    if ( !popup.subContainerEl.innerHTML ) addClass( popup.subContainerEl, popup.emptySubContainerClass )
  }

};



/**
 * --------------------------------------------------
 * LocalStorage functions
 */

const ls = {

  /**
   * Save value in the localStorage
   *
   * @param key
   * @param value
   * @returns {*}
   */
  set( key, value ) {
    localStorage.setItem( key, JSON.stringify( { data: value } ) );
    return value;
  },

  /**
   * Get value from the localStorage
   *
   * @param key
   * @param defaultValue
   * @returns {*|null}
   */
  get( key, defaultValue = null ) {
    let gotten = localStorage.getItem( key );
    return gotten ? JSON.parse( gotten ).data : ( defaultValue || null );
  },

};



/**
 * --------------------------------------------------
 * Additions
 */

/**
 * Select elements by selector (As array if more than one)
 *
 * @param selector
 * @param parent
 * @returns {null|Element[]|Element}
 */
function selectEl( selector, parent = document ) {
  let els = parent.querySelectorAll( selector );
  switch ( els.length ) {
    case 0: return null;
    case 1: return els[ 0 ];
    default: return Array.from( els );
  }
}

/**
 * Exec callback at the element (or elements)
 *
 * @param els
 * @param callback
 */
function each( els, callback ) {
  if ( !els ) return;
  if ( !Array.isArray( els ) ) els = [ els ];

  els.forEach( ( el, i ) => { callback.call( el, el, i ) } )
}

/**
 * Check if element has class
 *
 * @param el
 * @param className
 * @returns {boolean}
 */
function hasClass( el, className ) {
  return el.classList.contains( className );
}

/**
 * Add element's class
 *
 * @param el
 * @param className
 */
function addClass( el, className ) {
  return el.classList.add( className );
}

/**
 * Remove element's class
 *
 * @param el
 * @param className
 */
function removeClass( el, className ) {
  return el.classList.remove( className );
}

/**
 * Toggle element's class
 *
 * @param el
 * @param className
 * @returns {void}
 */
function toggleClass( el, className ) {
  if ( hasClass( el, className ) )
    return removeClass( el, className );
  return addClass( el, className );
}



/**
 * --------------------------------------------------
 * EventListeners
 */

window.addEventListener( 'DOMContentLoaded', function () {

  /** Load saved tabs data or default and save it */
  let loadedTabs = ls.get( 'tabs' );
  if ( !loadedTabs ) ls.set( 'tabs', tabs );
  else {
    tabs.active = loadedTabs.active;
    tabs.completed = loadedTabs.completed;
  }

  /** First todos render */
  render();

  /** Switch tab */
  each(
    selectEl( '.tab' ),
    el => el.addEventListener( 'click', tabSwitch )
  );

  /** Close popup */
  selectEl( '#js-popup-close' ).addEventListener( 'click', popup.hide.bind( popup ) );

  /** Add sub task in popup */
  selectEl( '#js-add-sub' ).addEventListener( 'click', popup.addSub.bind( popup ) );

  /** Open form to create new task */
  selectEl( '#js-todo-add' ).addEventListener( 'click', task.create.bind( task ) )

} );
