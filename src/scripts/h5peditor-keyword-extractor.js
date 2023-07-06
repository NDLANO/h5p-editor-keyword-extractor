import DOMUtil from '@services/dom-util';
import H5PUtil from '@services/h5p-util';
import KeywordUtil from '@services/keyword-utils';
import CommandButton from '@components/command-button';
import KeywordButtonListitem from '@components/keyword-button-listitem';

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

    this.keywordItems = [];

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

    // TODO: Error message if no fieldInstance or not instance of Group

    this.addButtons();

    // Set keywords field
    this.keywordItemsField = H5PUtil.findFieldInstance(
      this.field?.keywordExtractor?.keywords,
      this.fieldInstance
    );

    // TODO: Error message if no keywordsField

    // TODO: Use matching aria pattern
    this.keywordContainer = document.createElement('ul');
    this.keywordContainer.classList.add('h5p-keyword-container');

    this.fieldInstance.$content.get(0).append(this.keywordContainer);

    // Re-create previously stored keywords
    if (this.params.keywords) {
      const keywords = KeywordUtil.getKeywords({
        text: this.params.keywords,
        mode: 'comma-separated'
      });
      this.addKeywordsToList(keywords);
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
   * Add buttons.
   */
  addButtons() {
    const buttonConfig = this.field?.keywordExtractor?.buttons ?? {};
    for (const fieldName in buttonConfig) {
      const command = buttonConfig[fieldName];

      if (!['extractKeywords', 'parseKeywordsComma'].includes(command)) {
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

      const button = new CommandButton(
        {
          label: this.t(command)
        },
        {
          onClicked: () => {
            const inputText = childInstance.$input.get(0).value.trim();
            const keywords = KeywordUtil.getKeywords({
              text: inputText,
              mode: (command === 'parseKeywordsComma') ?
                'comma-separated' :
                'extract',
              language: H5PEditor.contentLanguage
            });
            this.addKeywordsToList(keywords);
          }
        }
      );
      childInstance.$item.get(0).append(button.getDOM());
    }
  }

  /**
   * Generate keywords elements.
   * @param {string[]} keywords Keywords.
   */
  addKeywordsToList(keywords = []) {
    keywords.forEach((keyword) => {
      if (this.keywordItems.find((item) => item.getLabel() === keyword)) {
        return; // Duplicate
      }

      const keywordItem = new KeywordButtonListitem(
        {
          label: keyword,
          ariaLabel: `${keyword}. ${this.t('keywordRemoveButton')}`
        },
        {
          onClicked: (event) => {
            const position = this.keywordItems.findIndex((item) => {
              return item.getLabel() === keyword;
            });

            this.keywordItems[position].removeDOM();
            this.keywordItems.splice(position, 1);

            this.updateValues();

            if (event.detail === 0) { // Using keyboard
              this.refocus(position);
            }
          }
        }
      );
      this.keywordItems.push(keywordItem);

      this.keywordContainer.append(keywordItem.getDOM());
    });

    // Sort internally and externally
    this.keywordItems
      .sort((a, b) => a.getLabel() > b.getLabel() ? 1 : -1)
      .forEach((item) => {
        this.keywordContainer.append(item.getDOM());
      });

    this.updateValues();
  }

  /**
   * Update values. Will indirectly store them.
   */
  updateValues() {
    if (!this.keywordItemsField) {
      return;
    }

    this.keywordItemsField.$input[0].value = this.keywordItems.map((item) => item.getLabel()).join(',') ?? '';
    this.keywordItemsField.$input[0].dispatchEvent(new Event('change'));
  }

  /**
   * Set focus to other keyword element at position.
   * @param {number} position Index of item to set focus to.
   */
  refocus(position) {
    if (typeof position !== 'number') {
      return;
    }

    position = Math.min(position, this.keywordItems.length - 1);

    if (position === -1) {
      // No more keyword left
      (DOMUtil.findClosestFocussable(this.keywordContainer))?.focus();
    }
    else {
      this.keywordItems[position].focus();
    }
  }
}
