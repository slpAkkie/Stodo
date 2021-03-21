/**
 * -------------------------
 * JSON data */

DATA = {
  active_tab: 0,
  tabs: [
    {
      title: 'Активные',
      items: [
        {
          title: 'To-do title',
          done: false,
          until: '12-05-2021',
          childs: [
            {
              title: 'To-do title',
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
          title: 'To-do title',
          done: true,
          until: '12-05-2021',
          childs: null,
        },
        {
          title: 'To-do title',
          done: false,
          until: '12-05-2021',
          childs: [
            {
              title: 'To-do title',
              done: true,
            },
          ],
        },
      ],
    },
  ],
};

/**
 * -------------------------
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
 * -------------------------
 * Tab loader */

function loadTabs() {
  DATA.tabs.forEach((obj, id) => {
    _('.tabs').insert(createTab(id, obj.title));
  });
}

/**
 * -------------------------
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
 * -------------------------
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
 * -------------------------
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
 * -------------------------
 * Init App */

loadTabs();
_(`.tabs__tab[data-tab-id="0"]`).toggleClass('tabs__tab_active');
loadTabContent(DATA.tabs[0].items);

/**
 * -------------------------
 * Tab switcher */

_('.tabs__tab').on('click', function () {
  console.log(`Пользователь открыл вкладку с id=${DATA.active_tab = this.attributes['data-tab-id'].value}`);
  _(`.tabs__tab_active`)?.toggleClass('tabs__tab_active');
  this.toggleClass('tabs__tab_active');
  loadTabContent(DATA.tabs[DATA.active_tab].items);
});