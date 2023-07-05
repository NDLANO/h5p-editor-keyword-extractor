import * as KeywordExtractorEngine from 'keyword-extractor';

/** Class for KeywordExtractor widget */
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

    // Instantiate original field
    this.fieldInstance = new H5PEditor.widgets[this.field.type](
      this.parent,
      this.field,
      this.params,
      this.setValue
    );
    this.fieldInstance.appendTo(this.$container);

    // TODO: Only add button after particular fields! Might become more ...

    // Add button after field
    this.fieldInstance.forEachChild((child, index) => {
      if (child.field.addButton) {

        const button = document.createElement('button');
        button.classList.add('h5peditor-button', 'h5peditor-button-textual');
        button.innerText = this.t(child.field.addButton);

        button.addEventListener('click', () => {
          if (child.field.addButton === 'generateKeywords') {
            this.generateKeywords(index);
          }
          else {
            this.addKeywords(index);
          }
        });

        child.$item.append(button);
      }
    });

    this.keywordContainer = document.createElement('div');
    this.keywordContainer.classList.add('h5p-keyword-container');

    this.$container.find('.content').append(this.keywordContainer);

    // TODO: Don't use index to select field, and store 'content'

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
    // TODO: Don't use index to select field

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
    // TODO: Don't use index to select field

    const content = this.fieldInstance.children[index].$input.val().trim();
    if (!content) {
      return;
    }

    // Add keywords to the list
    const keywords = content.split(',').map((keyword) => keyword.trim());
    this.addKeywordsToList(keywords);
  }

  /**
   * Generate keywords elements.
   * @param {string[]} keywords Keywords.
   */
  addKeywordsToList(keywords = []) {
    // TODO: Don't use DOM to store keywords
    // TODO: Don't add keywords that are already in list

    keywords.forEach((keyword) => {
      const keywordElement = document.createElement('span');
      keywordElement.classList.add('extracted-keyword');
      keywordElement.innerText = keyword;

      // TODO: Think about delegating the listener to this.keywordContainer
      keywordElement.addEventListener('click', () => {
        keywordElement.remove();
        this.keywordSyncWithField('toField');
      });

      this.keywordContainer.append(keywordElement);
    });

    this.keywordSyncWithField('toField');
  }

  /**
   * Sync keywords with field.
   * @param {string} direction Direction of sync.
   */
  keywordSyncWithField(direction) {
    if (direction === 'toField') {
      // get all keywords
      const keywords = this.keywordContainer
        .querySelectorAll('.extracted-keyword');

      // TODO: See above, don't using DOM to store values
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
   * @param {HTMLInputElement} input Input element.
   * @param {string} value New value.
   */
  setInputValue(input, value) {
    input.value = value;
    input.dispatchEvent(new Event('change'));
  }
}
