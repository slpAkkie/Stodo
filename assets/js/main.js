/**
 * --------------------------------------------------
 * JSON data */

DEF_DATA = {
  title: 'Мой список задач',
  active_tab: 0,
  tabs: [
    {
      title: 'Активные',
      items: [
        {
          title: 'Первая заметка',
          done: false,
          until: '12-05-2021',
          childs: [
            {
              title: 'Заметка в первой заметке',
              done: false,
            },
          ],
        },
      ],
    },
    {
      title: 'Завершенные',
      items: [
        {
          title: 'Вторая заметка',
          done: true,
          until: '12-05-2021',
          childs: null,
        },
        {
          title: 'Третья заметка',
          done: true,
          until: '12-05-2021',
          childs: [
            {
              title: 'Заметка в третьей заметке',
              done: true,
            },
          ],
        },
      ],
    },
  ],
};

/**
 * --------------------------------------------------
 * Tab creator
 *
 * @param {Number} id
 * @param {String} title
 * @returns {Element}
 */

function createTab( id, title ) {
  return createNode( `<div data-tab-id="${id}" class="tabs__tab"><span class="tabs__tab-title">${title}</span></div>` );
}

/**
 * --------------------------------------------------
 * Tab loader */

function loadTabs() {
  DATA.tabs.forEach( ( obj, id ) => {
    _( '.tabs' ).insert( createTab( id, obj.title ) );
  } );
}

/**
 * --------------------------------------------------
 * Tab content creator
 *
 * @param {Number} id
 * @param {Object} obj
 * @returns {Element}
 */

function createTodo( id, obj ) {
  let todo = createNode( `
  <div class="to-do__wrapper">
    <div class="to-do__container">
      <div data-todo-id="${id}" class="to-do">
        <div class="to-do__checkbox"><input type="checkbox" class="to-do__checkbox-input" ${obj.done ? 'checked' : ''}></div>
        <div class="to-do__title">${obj.title}</div>
        ${obj.until ? `<div class="to-do__until-time">${obj.until}</div>` : ''}
        <div class="to-do__controls">
          <div class="ui ui-button ui-icon_edit to-do__control-item to-do__control-edit"></div>
          <div class="ui ui-button ui-icon_delete to-do__control-item to-do__control-remove"></div>
        </div>
      </div>
    </div>
    ${obj.childs ? `<div class="to-do__childs"></div>` : ''}
  </div>`);
  obj.childs && loadTabContent( obj.childs, _( todo )._( '.to-do__childs' ) );

  return todo;
}

/**
 * --------------------------------------------------
 * Editable subs creator
 *
 * @returns {Element}
 */

function createEditableSub() {
  let sub = _( createNode( `
  <div class="popup__todo-editable-child-container">
    <div class="popup__todo-editable-child">
      <input type="checkbox" class="popup__todo-editable-child-done">
      <input type="text" class="popup__todo-editable-child-title">
      <div class="ui ui-button ui-icon_delete popup__todo-editable-child-delete-button"></div>
    </div>
  </div>`) );

  // Handler for remove
  sub._( '.popup__todo-editable-child-delete-button' ).on( 'click', () => sub.remove() );

  return sub.get();
}

/**
 * --------------------------------------------------
 * Todo save */

function todoSave() {
  let PPP_TMPDT = new Object();
  PPP_TMPDT.title = _( '.popup__title' ).value;
  PPP_TMPDT.until = _( '.popup__until' ).value || null;
  PPP_TMPDT.done = _( '.popup__done' ).checked || false;
  PPP_TMPDT.childs = [];

  _( '.popup__todo-editable-child' )?.each( el => {
    let sub = {
      title: el._( '.popup__todo-editable-child-title' ).value,
      done: el._( '.popup__todo-editable-child-done' ).checked,
    };

    PPP_TMPDT.childs.push( sub );
  } );

  !PPP_TMPDT.childs.length && ( PPP_TMPDT.childs = null );

  if ( DATA.editingMode )
    DATA.tabs[ DATA.active_tab ].items[ DATA.editTodoID ] = PPP_TMPDT;
  else
    DATA.tabs[ DATA.active_tab ].items.push( PPP_TMPDT );

  popupClose();
  rerender();
}

/**
 * --------------------------------------------------
 * Todo remove */

function todoRemove() {
  // Searching an id
  let id = this.parent( '[data-todo-id]' ).getAttribute( 'data-todo-id' );
  id = parseInt( id );
  if ( isNaN( id ) ) return;

  let parentTodo = this.parent( '.to-do__childs' );

  // Shift all others elements
  if ( parentTodo ) {
    let parentID = parentTodo.prev()._( '.to-do' ).getAttribute( 'data-todo-id' );
    for ( let i = id; i < DATA.tabs[ DATA.active_tab ].items[ parentID ].childs.length - 1; i++ ) {
      DATA.tabs[ DATA.active_tab ].items[ parentID ].childs[ i ] = DATA.tabs[ DATA.active_tab ].items[ parentID ].childs[ i + 1 ];
      parentTodo.parent( '.to-do__wrapper' ).parent()._( `[data-todo-id=${i + 1}]` ).setAttribute( 'data-todo-id', i );
    }
    --DATA.tabs[ DATA.active_tab ].items[ parentID ].childs.length < 1 && ( DATA.tabs[ DATA.active_tab ].items[ parentID ].childs = null );
  } else {
    for ( let i = id; i < DATA.tabs[ DATA.active_tab ].items.length - 1; i++ ) {
      DATA.tabs[ DATA.active_tab ].items[ i ] = DATA.tabs[ DATA.active_tab ].items[ i + 1 ];
      this.parent( '.to-do__wrapper' ).parent()._( `[data-todo-id=${i + 1}]` ).setAttribute( 'data-todo-id', i );
    }
    DATA.tabs[ DATA.active_tab ].items.length--;
  }

  rerender();
}

/**
 * --------------------------------------------------
 * Tab content loader
 *
 * @param {Array} todos
 * @param {String|null} where
 */

function loadTabContent( todos = null, where = null ) {
  todos = todos || getCurrentTabItems();
  where = _( where ) || _( '.tab-content' );
  where.innerHTML = '';
  todos.forEach( ( obj, id ) => {
    where.insert( createTodo( id, obj ) );
  } );
}

/**
 * --------------------------------------------------
 * DOM Elements creator
 *
 * @param {String} markup
 * @returns {Element}
 */
function createNode( markup ) {
  let template = document.createElement( 'template' );
  template.innerHTML = markup.trim();
  return template.content.firstChild;
}

/**
 * --------------------------------------------------
 * Tab selector */

function getCurrentTabItems() { return DATA.tabs[ DATA.active_tab ].items }

/**
 * --------------------------------------------------
 * Tab switcher */

function switchTab() {
  DATA.active_tab = this.getAttribute( 'data-tab-id' );
  console.log( `Пользователь открыл вкладку id(${DATA.active_tab})` );
  _( `.tabs__tab_active` )?.toggleClass( 'tabs__tab_active' );
  this.toggleClass( 'tabs__tab_active' );
  loadTabContent();
}

/**
 * --------------------------------------------------
 * Open popup */

function popupOpen() {
  _( '.popup__wrapper' ).removeClass( 'popup__wrapper_closed' );
  _( '.popup__wrapper' ).addClass( 'popup__wrapper_shown' );
}

/**
 * --------------------------------------------------
 * Close popup */

function popupClose() {
  _( '.popup__wrapper' ).removeClass( 'popup__wrapper_shown' );
  _( '.popup__wrapper' ).addClass( 'popup__wrapper_closed' );
  clearPopup();
}

/**
 * --------------------------------------------------
 * Close popup */

function popupDelete() {
  if ( DATA.editingMode ) { }
  else { popupClose(); rerender(); }
}

/**
 * --------------------------------------------------
 * Clear popup */

function clearPopup() {
  _( '.popup__title' ).value = '';
  _( '.popup__until' ).value = '';
  _( '.popup__done' ).checked = false;
  _( '.popup__childs' ).innerHTML = '';
}

/**
 * --------------------------------------------------
 * Rerender */

function rerender() {
  loadTabContent();
  dataSave();
}

/**
 * --------------------------------------------------
 * Local storage */

LS = {
  get( key ) {
    return JSON.parse( localStorage.getItem( key ) )?.data;
  },
  set( key, value ) {
    localStorage.setItem( key, JSON.stringify( { data: value } ) );
    return value;
  },
};

/**
 * --------------------------------------------------
 * Save Data */

function dataSave() { LS.set( 'SavedData', DATA ) }



/**
 * --------------------------------------------------
 * Init App */

DATA = LS.get( 'SavedData' ) || DEF_DATA;
_( '.header-title' ).value = DATA.title;
DATA.editingMode = false;
DATA.editTodoID = null;
loadTabs();
_( `.tabs__tab[data-tab-id="0"]` ).toggleClass( 'tabs__tab_active' );
loadTabContent();



/**
 * --------------------------------------------------
 * Handlers */

// --------------------------------------------------
_( '.header-title__edit-button' ).on( 'click', () => {
  let ht = _( '.header-title' );
  ht.removeAttribute( 'disabled' )
  ht.focus();
  ht.select();
} );

_( '.header-title' ).on( 'blur', function () {
  _( '.header-title' ).setAttribute( 'disabled', true );
  if ( !this.value ) this.value = 'Мой список задач';
  DATA.title = this.value;
  dataSave();
} );

// --------------------------------------------------
_( '.tabs__tab' ).on( 'click', switchTab );

// --------------------------------------------------
_( '.to-do__control-remove' ).on( 'click', todoRemove );

// --------------------------------------------------
_( '#js-add-new' ).on( 'click', popupOpen );

// --------------------------------------------------
_( '.popup__close-button' ).on( 'click', popupClose );

// --------------------------------------------------
_( '.popup__save-button' ).on( 'click', todoSave );

// --------------------------------------------------
_( '.popup__delete-button' ).on( 'click', popupDelete );

// --------------------------------------------------
_( '#popup__add-child' ).on( 'click', function () {
  _( '.popup__childs' ).insertFirst( createEditableSub() );
} );
