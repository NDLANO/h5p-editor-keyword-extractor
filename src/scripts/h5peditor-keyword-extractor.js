import H5PUtil from '@services/h5p-util';
import KeywordUtil from '@services/keyword-utils';
import CommandButton from '@components/command-button';
import MessageBox from '@components/message-box/message-box';
import KeywordList from '@components/keyword-list/keyword-list';

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
    this.params = params || {};
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

    if (!this.fieldInstance instanceof H5PEditor.Group) {
      const messageBox = new MessageBox({
        text: this.t('noFieldInstance')
      });
      this.$container.get(0).append(messageBox.getDOM());

      return;
    }
    this.fieldInstance.appendTo(this.$container);

    // Set keywords field
    this.keywordItemsField = H5PUtil.findFieldInstance(
      this.field?.keywordExtractor?.keywords,
      this.fieldInstance
    );

    if (!this.keywordItemsField instanceof H5PEditor.Text) {
      const messageBox = new MessageBox({
        text: this.t('noKeywordsField')
      });
      this.fieldInstance.$content?.get(0).append(messageBox.getDOM());

      return;
    }

    this.addButtons();

    this.keywordList = new KeywordList(
      {
        ariaRemove: this.t('keywordRemoveButton')
      },
      {
        onUpdated: () => {
          this.updateValues();
        }
      }
    );
    this.fieldInstance.$content?.get(0).append(this.keywordList.getDOM());

    // Re-create previously stored keywords
    if (this.params.keywords) {
      const keywords = KeywordUtil.getKeywords({
        text: this.params.keywords,
        mode: 'comma-separated'
      });
      this.keywordList.addKeywords(keywords);
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
            this.keywordList.addKeywords(keywords);
          }
        }
      );
      childInstance.$item.get(0).append(button.getDOM());
    }
  }

  /**
   * Update values. Will indirectly store them.
   */
  updateValues() {
    if (!this.keywordItemsField) {
      return;
    }

    const keywordField = this.keywordItemsField.$input[0];
    keywordField.value = this.keywordList.getKeywords({ asString: true });
    keywordField.dispatchEvent(new Event('change'));
  }
}
