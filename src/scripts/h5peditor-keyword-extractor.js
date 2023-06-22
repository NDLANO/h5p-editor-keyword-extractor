import * as KeywordExtractorEngine from 'keyword-extractor';

/** Class for Boilerplate H5P widget */
export default class KeywordExtractor {

  /**
   * @class
   * @param {object} parent Parent element in semantics.
   * @param {object} field Semantics field properties.
   * @param {object} params Parameters entered in editor form.
   * @param {function} setValue Callback to set parameters.
   */
  constructor(parent, field, params, setValue) {
    this.parent = parent;
    this.field = field;
    this.params = params;
    this.setValue = setValue;

    // Let parent handle ready callbacks of children
    this.passReadies = true;

    // DOM
    this.$container = H5P.jQuery('<div>', {
      class: 'h5peditor-keyword-extractor'
    });

    // Instantiate original field (or create your own and call setValue)
    this.fieldInstance = new H5PEditor.widgets[this.field.type](
      this.parent,
      this.field,
      this.params,
      this.setValue
    );
    this.fieldInstance.appendTo(this.$container);

    // Add button after field
    const self = this;
    this.fieldInstance.forEachChild((child, index) => {
      if (child.field.addButton) {
        self.createButton(child, index);
      }
    });

    this.$keywordContainer = H5P.jQuery('<div/>', {
      'class': 'h5p-keyword-container'
    });
    this.$keywordContainer.appendTo(this.$container.find('.content'));

    // Generate keywords if the previous content is not empty
    const content = this.fieldInstance.children[2].$input.val().trim();
    if (content) {
      this.addKeywords(2);
    }
    this.$errors = this.$container.find('.h5p-errors');
  }

  /**
   * Append field to wrapper. Invoked by H5P core.
   * @param {H5P.jQuery} $wrapper Wrapper.
   */
  appendTo($wrapper) {
    this.$container.appendTo($wrapper);
  }

  /**
   * Validate current values. Invoked by H5P core.
   * @returns {boolean} True, if current value is valid, else false.
   */
  validate() {
    return this.fieldInstance.validate();
  }

  /**
   * Remove self. Invoked by H5P core.
   */
  remove() {
    this.$container.remove();
  }

  /**
   * Create button for field.
   * @param {object} child Field.
   * @param {number} index Index of the field.
   * @returns {H5P.jQuery} Button.
   */
  createButton(child, index) {
    return H5P.jQuery('<button/>', {
      'class': 'h5peditor-button h5peditor-button-textual',
      type: 'button',
      text: this.t(`${child.field.addButton}`),
      click: () => {
        child.field.addButton === 'generateKeywords'
          ? this.generateKeywords(index)
          : this.addKeywords(index);
      },
      appendTo: child.$item
    });
  }

  /**
   * Translate UI texts for this library.
   * @param {string} key Translation string identifier.
   * @param {object} vars Variables to replace in translation string.
   * @returns {string} Translated string.
   */
  t(key, vars) {
    return H5PEditor.t('H5PEditor.KeywordExtractor', key, vars);
  }

  /**
   * Generate keywords from text.
   * @param {number} index Index of the field.
   * @returns {void}
   */
  generateKeywords(index) {
    const content = this.fieldInstance.children[index].$input.val().trim();
    // check if content is empty then return
    if (!content)
      return;

    const extraction_result =
      KeywordExtractorEngine.extract(content, {
        language: 'english',
        remove_digits: true,
        return_changed_case:true,
        remove_duplicates: true
      });

    // add keywords to the list
    this.addKeywordsToList(extraction_result);
  }

  /**
   * Add keywords to the list.
   * @param {number} index Index of the field.
   * @returns {void}
   */
  addKeywords(index) {
    const content = this.fieldInstance.children[index].$input.val().trim();
    if (!content)
      return;

    // Add keywords to the list
    const keywords = content.split(',').map((keyword) => keyword.trim());
    this.addKeywordsToList(keywords);
  }

  /**
   * Generate keywords elements.
   * @param {Array} keywords Keywords.
   */
  addKeywordsToList(keywords) {
    // loop through keywords and create span element from each keyword
    for (let keyword of keywords) {
      const $keyword = H5P.jQuery('<span>', {
        class: 'extracted-keyword',
        text: keyword,
        click: () => {
          $keyword.remove();
          this.keywordSyncWithField('toField');
        }
      });
      this.$keywordContainer.append($keyword);
    }
    this.keywordSyncWithField('toField');
  }

  /**
   * Sync keywords with field.
   * @param {string} direction Direction of sync.
   */
  keywordSyncWithField(direction) {
    if (direction === 'toField') {
      // get all keywords
      const keywords = this.$keywordContainer.find('.extracted-keyword');
      const keywordsArray = [];
      for (let keyword of keywords) {
        keywordsArray.push(keyword.textContent);
      }

      // set keywords to field
      this.setInputValue(
        this.fieldInstance.children[2].$input[0],
        keywordsArray.join(',')
      );
    }
  }

  /**
   * Set the given value for the given input and trigger the change event.
   * @private
   * @param {HTMLInputElement} input Input element.
   * @param {string} value New value.
   * @returns {void} Nothing.
   */
  setInputValue(input, value) {
    input.value = value;
    input.dispatchEvent(this.createNewEvent('change'));
  }

  /**
   * Create a new event, using a fallback for older browsers (IE11).
   * @param {string} type Event type.
   * @returns {Event} Event.
   */
  createNewEvent(type) {
    if (typeof Event !== 'function') {
      var event = document.createEvent('Event');
      event.initEvent(type, true, true);
      return event;
    }
    else {
      return new Event(type);
    }
  }
}
