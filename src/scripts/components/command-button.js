import Util from '@services/util';

export default class CommandButton {
  /**
   * @class
   * @param {object} [params] Parameters.
   * @param {string} params.label Button label.
   * @param {object} [callbacks] Callbacks.
   * @param {function} [callbacks.onClicked] Callback when button clicked.
   */
  constructor(params = {}, callbacks = {}) {
    params = Util.extend({}, params);
    callbacks = Util.extend({
      onClicked: () => {}
    }, callbacks);

    this.dom = document.createElement('button');
    this.dom.classList.add('h5peditor-button', 'h5peditor-button-textual');
    this.dom.innerText = params.label;
    this.dom.addEventListener('click', () => {
      callbacks.onClicked();
    });
  }

  /**
   * Get DOM.
   * @returns {HTMLElement} Content DOM.
   */
  getDOM() {
    return this.dom;
  }
}
