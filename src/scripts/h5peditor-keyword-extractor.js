import H5PUtil from '@services/h5p-util';
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

    const buttonConfig = this.field?.keywordExtractor?.buttons ?? {};
    for (const fieldName in buttonConfig) {
      const command = buttonConfig[fieldName];

      if (!['generateKeywords', 'addKeywords'].includes(command)) {
        return; // No valid command for button
      }

      const childInstance =
        H5PUtil.findFieldInstance(fieldName, this.fieldInstance);

      if (
        !childInstance instanceof H5PEditor.Textarea &&
        !childInstance instanceof H5PEditor.Text
      ) {
        continue;
      }

      const button = document.createElement('button');
      button.classList.add('h5peditor-button', 'h5peditor-button-textual');
      button.innerText = this.t(command);

      button.addEventListener('click', () => {
        const inputText = childInstance.$input.val().trim();

        if (command === 'generateKeywords') {
          this.generateKeywords(inputText);
        }
        else if (command === 'addKeywords') {
          this.addKeywords(inputText);
        }
      });

      childInstance.$item.append(button);
    }

    this.keywordContainer = document.createElement('div');
    this.keywordContainer.classList.add('h5p-keyword-container');

    this.$container.find('.content').append(this.keywordContainer);

    // Re-create previously stored keywords
    if (this.params.keywords) {
      this.addKeywords(this.params.keywords);
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
   * @param {string} text Text to parse for keywords.
   */
  generateKeywords(text) {
    const extraction_result =
      KeywordExtractorEngine.extract(text, {
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
   * @param {string} keywords Comma separated list of keywords.
   */
  addKeywords(keywords) {
    // Add keywords to the list
    keywords = keywords.split(',').map((keyword) => keyword.trim());
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
