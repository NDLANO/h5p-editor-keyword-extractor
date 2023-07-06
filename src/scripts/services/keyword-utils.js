import * as KeywordExtractorEngine from 'keyword-extractor';
import ISO6391 from 'iso-639-1';

export default class KeywordUtil {
  /**
   * Get keywords from text.
   * @param {object} [params] Parameters.
   * @param {string} params.text Text to get keywords from.
   * @param {string} params.mode Keyword retrieval mode.
   * @param {string} [params.language] ISO-639-1 language code.
   * @returns {string[]} Keywords.
   */
  static getKeywords(params = {}) {
    if (
      typeof params.text !== 'string' ||
      typeof params.mode !== 'string'
    ) {
      return []; // Invalid input or mode
    }

    if (typeof params.language !== 'string') {
      delete params.language;
    }

    let keywords = [];

    if (params.mode === 'extract') {
      keywords = KeywordUtil.extractKeywords({
        text: params.text,
        ...(params.language && { language: params.language })
      });
    }
    else if (params.mode === 'comma-separated') {
      keywords = KeywordUtil.parseKeywordsComma(params.text);
    }

    return keywords;
  }

  /**
   * Extract keywords from text.
   * @param {object} [params] Parameters.
   * @param {string} [params.language] Language.
   * @param {string} params.text Text to parse for keywords.
   * @returns {string[]} Keywords.
   */
  static extractKeywords(params = {}) {
    if (typeof params.text !== 'string') {
      return [];
    }

    /*
     * KeywordExtractorEngine does require language name in lower case and does
     * not allow to retrieve the list of supported languages in advance.
     */
    if (typeof params.language === 'string') {
      params.language = params.language.toLowerCase();
    }
    else {
      params.language = 'english';
    }

    let keywords = [];
    try {
      keywords = KeywordExtractorEngine.extract(
        params.text, {
          language: params.language,
          remove_digits: true,
          return_changed_case:true,
          remove_duplicates: true
        });
    }
    catch (error) {
      keywords = KeywordExtractorEngine.extract(
        params.text, {
          language: 'english',
          remove_digits: true,
          return_changed_case:true,
          remove_duplicates: true
        });
    }

    return keywords;
  }

  /**
   * Add keywords to the list.
   * @param {string} text Comma separated list of keywords.
   * @returns {string[]} Keywords.
   */
  static parseKeywordsComma(text) {
    if (typeof text !== 'string') {
      return [];
    }

    return text.split(',').map((keyword) => keyword.trim());
  }

  /**
   * Get English language name for ISO 639-1 language code.
   * @param {string} isoCode ISO 639-1 language code.
   * @returns {string|null} English language name or null.
   */
  static getLanguageName(isoCode) {
    if (typeof isoCode !== 'string') {
      return null; // Default
    }

    // Only interested in macrolanguage
    isoCode = isoCode.split('-')[0];

    if (!ISO6391.validate(isoCode)) {
      return null; // No valid code
    }

    return ISO6391.getName(isoCode);
  }
}
