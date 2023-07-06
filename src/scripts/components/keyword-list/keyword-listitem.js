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

    callbacks = Util.extend({}, callbacks);

    this.dom = document.createElement('li');
    this.dom.classList.add(
      'h5peditor-keyword-extractor-keyword-item-wrapper'
    );

    this.keywordButton = document.createElement('button');
    this.keywordButton.classList.add(
      'h5peditor-keyword-extractor-keyword-item'
    );
    this.keywordButton.innerText = params.label;
    this.keywordButton.ariaLabel = params.ariaLabel;
    this.keywordButton.setAttribute('tabindex', '-1');

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
   * Get button DOM.
   * @returns {HTMLButtonElement} Button DOM.
   */
  getButtonDOM() {
    return this.keywordButton;
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
   * Make tabbable.
   * @param {boolean} state If true, make tabbable, else untabbable.
   */
  makeTabbable(state) {
    this.keywordButton.setAttribute('tabindex', state ? '0' : '-1');
  }

  /**
   * Remove from DOM.
   */
  removeDOM() {
    this.dom.remove();
  }
}
