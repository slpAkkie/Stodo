/**
 * --------------------------------------------------
 * JSON data */

DEF_DATA = {
  active_tab: 0,
  tabs: [
    {
      title: 'Активные',
      items: [
        {
          title: 'Сделать сайт со списком дел',
          done: false,
          until: '12-05-2021',
          childs: [
            {
              title: 'Придумать дизайн',
              done: true,
            },
          ],
        },
      ],
    },
    {
      title: 'Завершенные',
      items: [
        {
          title: 'Сверстать базовый шаблон',
          done: true,
          until: '12-05-2021',
          childs: null,
        },
        {
          title: 'Написать несколько функций',
          done: true,
          until: '12-05-2021',
          childs: [
            {
              title: 'Написать функции вставки задач из памяти',
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
          <div class="ui ui-button ui-icon_edit to-do__control-item"></div>
          <div class="ui ui-button ui-icon_delete to-do__control-item"></div>
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

function saveTodo() {
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

  DATA.tabs[ DATA.active_tab ].items.push( PPP_TMPDT );
  loadTabContent( DATA.tabs[ DATA.active_tab ].items );

  popupClose();
  dataSave();
}

/**
 * --------------------------------------------------
 * Tab content loader
 *
 * @param {Array} todos
 * @param {String|null} where
 */

function loadTabContent( todos, where = null ) {
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
  loadTabContent( getCurrentTabItems() );
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
loadTabs();
_( `.tabs__tab[data-tab-id="0"]` ).toggleClass( 'tabs__tab_active' );
loadTabContent( DATA.tabs[ 0 ].items );



/**
 * --------------------------------------------------
 * Handlers */

// --------------------------------------------------
_( '.tabs__tab' ).on( 'click', switchTab );

// --------------------------------------------------
_( '#js-add-new' ).on( 'click', popupOpen );

// --------------------------------------------------
_( '.popup__close-button' ).on( 'click', popupClose );

// --------------------------------------------------
_( '.popup__save-button' ).on( 'click', saveTodo );

// --------------------------------------------------
_( '#popup__add-child' ).on( 'click', function () {
  _( '.popup__childs' ).insert( createEditableSub() );
} );
