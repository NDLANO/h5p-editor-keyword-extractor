import Util from '@services/util';
import './keyword-listitem.scss';

export default class KeywordListitem {
  /**
   * @class
   * @param {object} [params] Parameters.
   * @param {string} params.label Button label.
   * @param {object} [callbacks] Callbacks.
   * @param {function} [callbacks.onClicked] Callback when button clicked.
   */
  constructor(params = {}, callbacks = {}) {
    this.params = Util.extend(params, {});

    callbacks = Util.extend({
      onClicked: () => {}
    }, callbacks);

    this.dom = document.createElement('li');
    this.dom.classList.add('extracted-keyword-wrapper');

    this.keywordButton = document.createElement('button');
    this.keywordButton.classList.add('extracted-keyword');
    this.keywordButton.innerText = params.label;
    this.keywordButton.ariaLabel = params.ariaLabel;
    this.keywordButton.addEventListener('click', (event) => {
      callbacks.onClicked(event);
    });

    this.dom.append(this.keywordButton);
  }

  /**
   * Get DOM.
   * @returns {HTMLElement} Content DOM.
   */
  getDOM() {
    return this.dom;
  }

  /**
   * Get list item's label.
   * @returns {string} Label.
   */
  getLabel() {
    return this.params.label;
  }

  /**
   * Focus.
   */
  focus() {
    this.keywordButton.focus();
  }

  /**
   * Remove from DOM.
   */
  removeDOM() {
    this.dom.remove();
  }
}
