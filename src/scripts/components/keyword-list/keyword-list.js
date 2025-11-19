import DOMUtil from '@services/dom-util';
import Util from '@services/util';
import KeywordListitem from './keyword-listitem.js';
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

    this.dom = document.createElement('ul');
    this.dom.classList.add('h5peditor-keyword-extractor-keyword-list');
    this.dom.addEventListener('click', (event) => {
      this.removeKeyword(event);
    });
    this.dom.addEventListener('keydown', (event) => {
      if (event.target === this.dom) {
        // Handle list item
        if (event.code === 'Enter' || event.code === 'Space') {
          event.preventDefault();

          this.makeExpanded(!this.isExpanded);
        }
        return;
      }

      // Handle list item button
      if (event.code === 'ArrowLeft' || event.code === 'ArrowUp') {
        event.preventDefault();

        this.currentPosition = Math.max(0, this.currentPosition - 1);
        this.focus(this.currentPosition);
      }
      else if (event.code === 'ArrowRight' || event.code === 'ArrowDown') {
        event.preventDefault();

        this.currentPosition =
          Math.min(this.currentPosition + 1, this.keywordItems.length - 1);

        this.focus(this.currentPosition);
      }
    });

    this.dom.setAttribute('aria-label', this.params.ariaKeywordList);
    this.makeExpanded(false);

    this.currentPosition = 0;
  }

  /**
   * Get DOM.
   * @returns {HTMLElement} Content DOM.
   */
  getDOM() {
    return this.dom;
  }

  /**
   * Make expanded for aria.
   * @param {boolean} state If true, expand, else collapse.
   */
  makeExpanded(state) {
    if (typeof state !== 'boolean') {
      return;
    }

    this.isExpanded = state;
    this.dom.setAttribute('aria-expanded', state ? 'true' : 'false');

    this.keywordItems.forEach((item, index) => {
      const tabbable = state ?
        index === this.currentPosition :
        false;

      item.makeTabbable(tabbable);
    });

    if (state) {
      this.focus(this.currentPosition);
    }
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
          ariaLabel: `${keyword}. ${this.params.ariaRemoveKeyword}`
        },
        {}
      );
      this.keywordItems.push(keywordItem);

      this.dom.append(keywordItem.getDOM());
    });

    if (this.keywordItems.length > 0) {
      this.dom.setAttribute('tabindex', '0');
    }

    this.sort();
  }

  /**
   * Remove keyword.
   * @param {PointerEvent} event Event from click.
   */
  removeKeyword(event) {
    const position = this.keywordItems.findIndex((item) => {
      return item.getButtonDOM() === event.target;
    });

    if (position === -1) {
      return;
    }

    this.keywordItems[position].removeDOM();
    this.keywordItems.splice(position, 1);

    if (position <= this.currentPosition) {
      this.currentPosition--;
    }

    if (this.keywordItems.length === 0) {
      this.makeExpanded(false);
      this.dom.setAttribute('tabindex', '-1');
    }

    this.callbacks.onUpdated();

    if (event.detail === 0) { // Using keyboard
      this.focus(position);
    }
  }

  /**
   * Sort keyword items.
   */
  sort() {
    if (!this.keywordItems.length) {
      return;
    }

    // Remember what item is current item
    const currentItem = this.keywordItems[this.currentPosition];

    // Sort internally and DOM
    this.keywordItems
      .sort((a, b) => a.getLabel() > b.getLabel() ? 1 : -1)
      .forEach((item) => {
        this.dom.append(item.getDOM());
      });

    // If on first item, stay there even if new item sorted in front
    if (this.currentPosition !== 0) {
      this.currentPosition = this.keywordItems.findIndex((item) => {
        return item === currentItem;
      });
    }
    else if (this.isExpanded) {
      this.keywordItems.forEach((item, index) => {
        item.makeTabbable(index === 0);
      });
    }

    this.callbacks.onUpdated();
  }

  /**
   * Get keywords.
   * @param {object} [params] Parameters.
   * @param {boolean} [params.asString] If true, return comma separated string.
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
      this.currentPosition = 0;
      (DOMUtil.findClosestFocussable(this.dom))?.focus();
    }
    else {
      this.keywordItems.forEach((item, index) => {
        item.makeTabbable(index === position);
      });

      this.currentPosition = position;
      this.keywordItems[this.currentPosition].focus();
    }
  }
}
