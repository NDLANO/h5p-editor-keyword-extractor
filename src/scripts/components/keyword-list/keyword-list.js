import DOMUtil from '@services/dom-util';
import Util from '@services/util';
import KeywordListitem from './keyword-listitem';
import './keyword-list.scss';

export default class KeywordList {
  /**
   * @class
   * @param {object} [params] Parameters.
   * @param {object} [callbacks] Callbacks.
   */
  constructor(params = {}, callbacks = {}) {
    this.params = Util.extend({}, params);

    this.callbacks = Util.extend({
      onUpdated: () => {}
    }, callbacks);

    this.keywordItems = [];

    // TODO: Use matching aria pattern
    this.dom = document.createElement('ul');
    this.dom.classList.add('h5p-keyword-container');
  }

  /**
   * Get DOM.
   * @returns {HTMLElement} Content DOM.
   */
  getDOM() {
    return this.dom;
  }

  /**
   * Add keywords.
   * @param {string[]} keywords Keywords.
   */
  addKeywords(keywords) {
    if (!Array.isArray(keywords)) {
      return; // Not an array.
    }

    keywords.forEach((keyword) => {
      if (
        typeof keyword !== 'string' ||
        this.keywordItems.find((item) => item.getLabel() === keyword)
      ) {
        return; // Invalid or duplicate
      }

      const keywordItem = new KeywordListitem(
        {
          label: keyword,
          ariaLabel: `${keyword}. ${this.params.ariaRemove}`
        },
        {
          onClicked: (event) => {
            const position = this.keywordItems.findIndex((item) => {
              return item.getLabel() === keyword;
            });

            this.keywordItems[position].removeDOM();
            this.keywordItems.splice(position, 1);

            this.callbacks.onUpdated();

            if (event.detail === 0) { // Using keyboard
              this.focus(position);
            }
          }
        }
      );
      this.keywordItems.push(keywordItem);

      this.dom.append(keywordItem.getDOM());
    });

    this.sort();
  }

  /**
   * Sort keyword items.
   */
  sort() {
    if (!this.keywordItems.length) {
      return;
    }

    // Sort internally and DOM
    this.keywordItems
      .sort((a, b) => a.getLabel() > b.getLabel() ? 1 : -1)
      .forEach((item) => {
        this.dom.append(item.getDOM());
      });

    this.callbacks.onUpdated();
  }

  /**
   * Get keywords.
   * @param {object} [params] Parameters.
   * @param {boolean} [params.asString] If true, return as comma separated string.
   * @returns {string[]|string} Keywords.
   */
  getKeywords(params = {}) {
    const keywords = this.keywordItems.map((item) => item.getLabel());

    if (params.asString) {
      return keywords.join(',');
    }

    return keywords;
  }

  /**
   * Set focus to other keyword element at position.
   * @param {number} [position] Index of item to set focus to.
   */
  focus(position = 0) {
    if (typeof position !== 'number') {
      return;
    }

    position = Math.min(position, this.keywordItems.length - 1);

    if (position === -1) {
      // No more keyword left
      (DOMUtil.findClosestFocussable(this.keywordList.getDOM()))?.focus();
    }
    else {
      this.keywordItems[position].focus();
    }
  }
}
