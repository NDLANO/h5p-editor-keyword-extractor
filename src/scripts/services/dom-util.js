/** Class for h5p utility functions */
export default class DOMUtil {

  /**
   * Get all focussable elements in a container.
   * @param {HTMLElement} container Container to look into.
   * @returns {HTMLElement[]} All focussable elements in container.
   */
  static getFocussableElements(container) {
    if (!container || !container instanceof HTMLElement) {
      return [];
    }

    const focusableElementsString = [
      'a[href]:not([disabled])',
      'button:not([disabled])',
      'textarea:not([disabled])',
      'input:not([disabled])',
      'select:not([disabled])',
      'video',
      'audio',
      '[tabindex]:not([tabindex="-1"])'
    ].join(', ');

    return []
      .slice
      .call(container.querySelectorAll(focusableElementsString))
      .filter((element) => {
        return (
          element.getAttribute('disabled') !== 'true' &&
          element.getAttribute('disabled') !== true &&
          window
            .getComputedStyle(element).getPropertyValue('display') !== 'none'
        );
      });
  }

  /**
   * Find closest focussable element (up in the DOM).
   * @param {HTMLElement} element Element to start looking from.
   * @returns {HTMLElement|null} Closest focussable element or null.
   */
  static findClosestFocussable(element) {
    if (!element.parentNode) {
      return null;
    }

    let done = false;
    return DOMUtil
      .getFocussableElements(element.parentNode)
      .reduce((siblings, focussableElement) => {
        if (done) {
          return siblings;
        }

        if (focussableElement === element ) {
          done = true;
          return siblings;
        }

        return [...siblings, focussableElement];
      }, [])
      .pop() ?? DOMUtil.findClosestFocussable(element.parentNode);
  }
}
