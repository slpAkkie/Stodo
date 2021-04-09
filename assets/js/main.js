/**
 * --------------------------------------------------
 * Defaults
 */

const data = {
  active_tab: 0,

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

  create() { },

  delete() { },

  edit(todoEl) { },

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
        <div class="_flex sm:col lg:row _grow _justify-between _ml-4">
          <div class="todo__title">
            <span>${title}</span>
          </div>
          <div class="todo__until-status sm:_mt-1 ${statusClass}">
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

function render() {
  let todosContainer = task.containerEl,
      todos = tabs[data.currentTab];
  todosContainer.innerHTML = null;
  if (!todos.length) todosContainer.append(createEl(`<h3 class="_text-center">В этом списке нет задач</h3>`));
  else todos.forEach((todo, id) => todosContainer.insertBefore(task.render(todo, id), todosContainer.firstChild));
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

  selector: '.popup',

  get el() { return selectEl(this.selector) },

  show() { },

  hide() {
    removeClass(this.el, '_shown');
  },

  reset() { },

  fill( data = {} ) { },

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

  /** Click on todo */
  selectEl('.todos-container').addEventListener('click', task.edit);

  /** Close popup */
  selectEl('#js-popup-close').addEventListener('click', popup.hide.bind(popup));

});