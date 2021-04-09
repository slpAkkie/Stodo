/**
 * --------------------------------------------------
 * Defaults
 */

const data = {
  active_tab: 0,
  editID: null,

  get currentTab() {
    return this.active_tab ? 'completed' : 'active';
  }
};



/**
 * --------------------------------------------------
 * Tabs data
 */

let tabs = {

  /** ------------------------- */
  active: [],

  /** ------------------------- */
  completed: [],

};



/**
 * --------------------------------------------------
 * Task functions
 */

const task = {

  container: '.todos-container',

  get containerEl() { return selectEl(this.container) },

  create() {
    popup.mode = 'create';
    popup.show();
  },

  delete() { },

  edit() {
    data.editID = this.dataID;
    popup.show();
  },

  setCompleted() { },

  save() { },

  filter( criteria = [] ) { },

  calculateStatus() { return ['Скоро', '_text-success'] },

  render(data, id) {
    let {title, completed, until, subs} = data;
    let [status, statusClass] = this.calculateStatus(until);
    let isSubs = subs.length;

    let markup = `<div class="todo">
      <div class="todo__inner row">
        <div class="col">
          <input class="todo__completed-checkbox _mt-1" type="checkbox" ${completed ? 'checked' : ''}>
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

    let todo = createEl(markup);

    if (isSubs) {
      let subContainer = selectEl('.todo__subs', todo);
      subs.forEach((sub, subID) => {
        subContainer.append(task.renderSub(sub, id, subID));
      });
    }

    todo.dataID = id;

    selectEl('.todo__title-wrapper', todo).addEventListener('click', task.edit.bind(todo));

    return todo;
  },

  renderSub(data, parentID, id) {
    let {title, completed} = data;

    let markup = `<div class="sub-todo row _align-center">
      <input class="todo__completed-checkbox" type="checkbox" ${completed ? 'checked' : ''}>
      <div class="todo__title _ml-4">
        <span>${title}</span>
      </div>
    </div>`;

    let sub = createEl(markup);
    sub.parentID = parentID;
    sub.dataID = id;

    return sub;
  },

  move() { },

};



/**
 * --------------------------------------------------
 * General functions
 */

function createEl(markup) {
  let template = document.createElement('template');
  template.innerHTML = markup.trim();
  return template.content.firstChild;
}

function insertFirst(parent, child) {
  parent.insertBefore(child, parent.firstChild)
}

function render() {
  let todosContainer = task.containerEl,
      todos = tabs[data.currentTab];
  todosContainer.innerHTML = null;
  if (!todos.length) todosContainer.append(createEl(`<h3 class="_text-center">В этом списке нет задач</h3>`));
  else todos.forEach((todo, id) => insertFirst(todosContainer, task.render(todo, id)));
}

function extractFilters() { }

function tabSwitch() {
    let id = data.active_tab = +!data.active_tab;
    toggleClass(selectEl(`.tab[data-id="${id}"]`), 'active');
    toggleClass(selectEl(`.tab[data-id="${+!id}"]`), 'active');
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

  subContainerSelector: '#js-subs-container',
  emptySubContainerClass: 'popup__subs-container_empty',

  get subContainerEl() { return selectEl(this.subContainerSelector) },

  get subs() { return selectEl('.popup__sub', this.subContainerEl) },

  selector: '.popup',

  get el() { return selectEl(this.selector) },

  controlButtonsSelector: '.popup__control-button',

  get controlButtons() { return selectEl(this.controlButtonsSelector) },

  show() {
    let editMode = this.mode === 'edit';

    popup.reset();

    let cancelButton = createEl(`<input type="button" value="Отменить" class="button popup__cancel">`);
    this.controlButtons.append(cancelButton);
    cancelButton.addEventListener('click', popup.hide.bind(popup));

    if (editMode) {
      let deleteButton = createEl(`<input type="button" value="Удалить" class="button button_danger popup__delete _ml-2">`);
      this.controlButtons.append(deleteButton);
      deleteButton.addEventListener('click', task.delete);
    }

    let saveButton = createEl(`<input type="button" value="${editMode ? 'Сохранить' : 'Создать'}" class="button button_success popup__save _ml-2">`);
    this.controlButtons.append(saveButton);
    saveButton.addEventListener('click', task.save);

    addClass(this.el, '_shown');
  },

  hide() {
    data.editID = null;
    removeClass(this.el, '_shown');
  },

  reset() {
    selectEl('#js-popup-title').value = null;
    selectEl('#js-popup-date').value = null;
    selectEl('#js-popup-time').value = null;
    selectEl('#js-popup-completed').checked = false;
    selectEl('#js-subs-container').innerHTML = null;
    addClass(selectEl('#js-subs-container'), this.emptySubContainerClass);

    this.controlButtons.innerHTML = null;
  },

  fill( data = {} ) { },

  getData() {
    let data = {until: {}};
    data.title = selectEl('#js-popup-title').value;
    data.until.date = selectEl('#js-popup-date').valueAsDate.toLocaleDateString();
    data.until.time = selectEl('#js-popup-time').value;
    data.completed = selectEl('#js-popup-completed').checked;
    data.subs = this.getSubsData();

    return data;
  },

  getSubsData() {
    let data = [];
    each(this.subs, el => {
      data.push({
        title: selectEl('.popup__sub-title', el).value,
        completed: selectEl('.popup__sub-checkbox', el).checked,
      })
    });

    return data;
  },

  addSub() {
    let markup = `
      <div class="popup__sub row _align-center">
        <input type="checkbox" class="popup__sub-checkbox">
        <input type="text" class="popup__sub-title input _grow _ml-4">
        <span class="popup__sub-delete-button _ml-2 _font-small _text-danger _text-semi-bold">Удалить</span>
      </div>
    `;

    let subContainer = this.subContainerEl;
    removeClass(subContainer, this.emptySubContainerClass);
    let sub = createEl(markup);
    subContainer.append(sub);

    selectEl('.popup__sub-delete-button', sub).addEventListener('click', this.removeSub);
  },

  removeSub() {
    this.parentElement.remove();

    if (!popup.subContainerEl.innerHTML) addClass(popup.subContainerEl, popup.emptySubContainerClass)
  }

};



/**
 * --------------------------------------------------
 * LocalStorage functions
 */

const ls = {

  set( key, value ) {
    localStorage.setItem(key, JSON.stringify({data: value}));
    return value;
  },

  get( key, defaultValue = null ) {
    let gotten = localStorage.getItem(key);
    return gotten ? JSON.parse(gotten).data : (defaultValue || null);
  },

};



/**
 * --------------------------------------------------
 * Additions
 */

function selectEl(selector, parent = document) {
  let els = parent.querySelectorAll(selector);
  switch (els.length) {
    case 0: return null;
    case 1: return els[0];
    default: return Array.from(els);
  }
}

function each(els, callback) {
  if (!Array.isArray(els)) els = [els];

  els.forEach( (el, i) => { callback.call(el, el) } )
}

function hasClass(el, className) {
  return el.classList.contains(className);
}

function addClass(el, className) {
  return el.classList.add(className);
}

function removeClass(el, className) {
  return el.classList.remove(className);
}

function toggleClass(el, className) {
  if (hasClass(el, className))
    return removeClass(el, className);
  return addClass(el, className);
}



/**
 * --------------------------------------------------
 * EventListeners
 */

window.addEventListener('DOMContentLoaded', function () {

  /** Load saved tabs data or default and save it */
  let loadedTabs = ls.get('tabs');
  if (!loadedTabs) ls.set('tabs', tabs);
  else tabs = loadedTabs;

  /** First todos render */
  render();

  /** Switch tab */
  each(
      selectEl('.tab'),
      el => el.addEventListener('click', tabSwitch)
  );

  /** Close popup */
  selectEl('#js-popup-close').addEventListener('click', popup.hide.bind(popup));

  /** Add sub task in popup */
  selectEl('#js-add-sub').addEventListener('click', popup.addSub.bind(popup));

  /** Open form to create new task */
  selectEl('#js-todo-add').addEventListener('click', task.create.bind(task))

});