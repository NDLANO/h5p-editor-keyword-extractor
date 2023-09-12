import * as KeywordExtractorEngine from 'keyword-extractor';

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

    if (
      !KeywordExtractorEngine.supported_language_codes.includes(params.language)
    ) {
      delete params.language; // Enforcing default which is 'en'
    }

    return KeywordExtractorEngine.extract(
      params.text,
      {
        language: params.language,
        remove_digits: true,
        return_changed_case:true,
        remove_duplicates: true
      }
    );
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
}
