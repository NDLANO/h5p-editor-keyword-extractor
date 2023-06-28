import * as KeywordExtractorEngine from 'keyword-extractor';
class KeywordExtractor {

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
    this.keywords = [];

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
      'class': 'h5p-keyword-container',
      'aria-label': `${this.t('keywordRemoveButton')}`,
      'role': 'list'
    });
    this.$keywordContainer.appendTo(this.$container.find('.content'));

    // Generate keywords if the previous content is not empty
    const content = this.getFieldValueByName(KeywordExtractor.KEYWORDS_FIELD);
    if (content) {
      this.addKeywords(content);
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
   * @returns {H5P.jQuery} Button.
   */
  createButton(child) {
    return H5P.jQuery('<button/>', {
      'class': 'h5peditor-button h5peditor-button-textual',
      type: 'button',
      text: this.t(`${child.field.addButton}`),
      click: () => {
        child.field.addButton === 'generateKeywords'
          ? this.generateKeywords(
            this.getFieldValueByName(KeywordExtractor.CONTENT_TEXT_FIELD)
          )
          : this.addKeywords(
            this.getFieldValueByName(KeywordExtractor.CUSTOM_KEYWORD_FIELD)
          );
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
   * @param {string} value text where the keywords will extracted automatically.
   */
  generateKeywords(value) {
    // check if content is empty then return
    if (!value)
      return;

    // currently this module support limited languages
    const extraction_result =
      KeywordExtractorEngine.extract(value, {
        language: KeywordExtractor.LANG[H5PEditor.contentLanguage],
        remove_digits: true,
        return_changed_case:true,
        remove_duplicates: true
      });

    // add keywords to the list
    this.addKeywordsToList(extraction_result);
  }

  /**
   * Add keywords to the list.
   * @param {string} value keyword(s) can be comma separated.
   */
  addKeywords(value) {
    if (!value)
      return;

    // Add keywords to the list
    const keywords = value.split(',').filter((keyword) => keyword !== '');
    this.addKeywordsToList(keywords);

    // Reset the field
    this.getFieldByName(KeywordExtractor.CUSTOM_KEYWORD_FIELD).forceValue('');
  }

  /**
   * Generate keywords elements.
   * @param {Array} keywords Keywords.
   */
  addKeywordsToList(keywords) {
    // loop through keywords and create span element from each keyword
    for (let keyword of keywords) {
      if (this.keywords.includes(keyword)) {
        continue;
      }
      // maintain single source of truth
      this.keywords.push(keyword);

      // Create keyword
      const newKeyword = document.createElement('button');
      newKeyword.href = 'javascript: void(0)';
      newKeyword.classList.add('extracted-keyword');
      newKeyword.textContent = keyword.trim();
      newKeyword.ariaLabel = `${keyword.trim()} - ${this.t(
        'keywordRemoveButton'
      )}`;
      newKeyword.addEventListener('click', (event) => {
        event.target.remove();
        this.keywords = this.keywords.filter(
          (key) => key !== event.target.textContent
        );

        // Remove current keyword from the list
        this.keywordSyncWithField(this.keywords);
      });
      this.$keywordContainer.append(newKeyword);
    }

    this.keywordSyncWithField(keywords);
  }

  /**
   * Sync keywords with field.
   * @param {Array} keywords Keywords.
   */
  keywordSyncWithField(keywords) {
    // set keywords to field
    this.getFieldByName(KeywordExtractor.KEYWORDS_FIELD).forceValue(
      keywords.join(',')
    );
  }

  /**
   * Get editor field's value by name
   * @param {string} key name of the field.
   * @returns {string} value of the field.
   */
  getFieldValueByName(key) {
    let value;
    this.fieldInstance.forEachChild((child) => {
      if (child.field.name === key) {
        value = child.$input.val().trim();
      }
    });

    return value;
  }

  /**
   * Get editor field's value by name
   * @param {string} key name of the field.
   * @returns {HTMLElement} value of the field.
   */
  getFieldByName(key) {
    let field;
    this.fieldInstance.forEachChild((child) => {
      if (child.field.name === key) {
        field = child;
      }
    });

    return field;
  }
}

// Field constants - reference semantics.json of h5p-keywords
KeywordExtractor.CONTENT_TEXT_FIELD = 'contentText';
KeywordExtractor.CUSTOM_KEYWORD_FIELD = 'customKeywords';
KeywordExtractor.KEYWORDS_FIELD = 'keywords';

// Language constant for automatic keyword extraction
KeywordExtractor.LANG = {
  'en': 'english'
};

export default KeywordExtractor;