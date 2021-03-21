/**
 * --------------------------------------------------
 * JSON data */

DATA = {
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
 * Temp JSON data for popup */

PPP_TMPDT = null;

/**
 * --------------------------------------------------
 * Tab creator
 * 
 * @param {Number} id
 * @param {String} title
 * @returns 
 */

function createTab(id, title) {
  return createNode(`<div data-tab-id="${id}" class="tabs__tab"><span class="tabs__tab-title">${title}</span></div>`);
}

/**
 * --------------------------------------------------
 * Tab loader */

function loadTabs() {
  DATA.tabs.forEach((obj, id) => {
    _('.tabs').insert(createTab(id, obj.title));
  });
}

/**
 * --------------------------------------------------
 * Tab content creator
 * 
 * @param {Number} id
 * @param {Object} obj
 * @returns 
 */

function createTodo(id, obj) {
  let todo = createNode(`
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
  obj.childs && loadTabContent(obj.childs, _(todo)._('.to-do__childs'));

  return todo;
}

/**
 * --------------------------------------------------
 * Editable subs creator
 * 
 * @param {Number} id
 * @returns 
 */

function createEditableSub(id) {
  let sub = createNode(`
  <div data-sub-id="${id}" class="popup__todo-editable-child-container">
    <div class="popup__todo-editable-child">
      <input type="checkbox" class="popup__todo-editable-child-done">
      <input type="text" class="popup__todo-editable-child-title">
      <div class="ui ui-button ui-icon_delete popup__todo-editable-child-delete-button"></div>
    </div>
  </div>`);

  // Default values
  PPP_TMPDT.subs.push({title: '', done: false});

  // Handler for checkbox
  _(sub)._('.popup__todo-editable-child-done').on('click', function () {
    PPP_TMPDT.subs[id].done = !PPP_TMPDT.subs[id].done;
  });

  // Handler for title change
  _(sub)._('.popup__todo-editable-child-title').on('input', function () {
    PPP_TMPDT.subs[id].title = this.value;
  });

  // Handler for remove
  _(sub)._('.popup__todo-editable-child-delete-button').on('click', function () {
    sub.remove();

    for (let i = id; i < PPP_TMPDT.subs.length - 1; i++) {
      PPP_TMPDT.subs[i] = PPP_TMPDT.subs[i + 1];
      _(`[data-sub-id="${i + 1}"]`).setAttribute('data-sub-id', i);
    }
    PPP_TMPDT.subs.length--;
  });

  return sub;
}

/**
 * --------------------------------------------------
 * Tab content loader 
 * 
 * @param {Array} todos
 * @param {String|null} where
 */

function loadTabContent(todos, where = null) {
  where = _(where) || _('.tab-content');
  where.innerHTML = '';
  todos.forEach((obj, id) => {
    where.insert(createTodo(id, obj));
  });
}

/**
 * --------------------------------------------------
 * DOM Elements creator
 * 
 * @param {String} markup
 * @returns {Element}
 */
function createNode(markup) {
  let template = document.createElement('template');
  template.innerHTML = markup.trim();
  return template.content.firstChild;
}

/**
 * --------------------------------------------------
 * Init App */

loadTabs();
_(`.tabs__tab[data-tab-id="0"]`).toggleClass('tabs__tab_active');
loadTabContent(DATA.tabs[0].items);

/**
 * --------------------------------------------------
 * Tab selector */

function getCurrentTabItems() { return DATA.tabs[DATA.active_tab].items }

/**
 * --------------------------------------------------
 * Tab switcher */

function switchTab() {
  DATA.active_tab = this.getAttribute('data-tab-id');
  console.log(`Пользователь открыл вкладку id(${DATA.active_tab})`);
  _(`.tabs__tab_active`)?.toggleClass('tabs__tab_active');
  this.toggleClass('tabs__tab_active');
  loadTabContent(getCurrentTabItems());
}



/**
 * --------------------------------------------------
 * Handlers */

// --------------------------------------------------
_('.tabs__tab').on('click', switchTab);

// --------------------------------------------------
_('#js-add-new').on('click', () => {
  PPP_TMPDT = {
    title: '',
    done: false,
    until: null,
    subs: [],
  };

  _('.popup__wrapper').removeClass('popup__wrapper_closed');
  _('.popup__wrapper').addClass('popup__wrapper_shown');
});

// --------------------------------------------------
_('.popup__close-button').on('click', () => {
  _('.popup__wrapper').removeClass('popup__wrapper_shown');
  _('.popup__wrapper').addClass('popup__wrapper_closed');
});

// --------------------------------------------------
_('#popup__add-child').on('click', function () {
  PPP_TMPDT || (PPP_TMPDT = {
    title: '',
    done: false,
    until: null,
    subs: [],
  });
  _('.popup__childs').insert(createEditableSub(PPP_TMPDT.subs.length));
});