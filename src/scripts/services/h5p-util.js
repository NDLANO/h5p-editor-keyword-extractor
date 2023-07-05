/** Class for h5p utility functions */
export default class H5PUtil {
  /**
   * Find field instance
   * @param {string} path Path to look for instance.
   * @param {object} parent H5P Editor widget such as Group, List, etc.
   * @returns {object|boolean} H5P Editor widget or false if nothing found.
   */
  static findFieldInstance(path, parent) {
    if (typeof path !== 'string') {
      return false;
    }

    path = path.split('/');

    if (path[0] === '..') {
      if (!parent.parent) {
        return false;
      }

      path.splice(0, 1);
      return H5PUtil.findFieldInstance(path, parent.parent);
    }

    if (!parent.children) {
      /*
       * This will fail for when parent is a List. It has no children object.
       * One could iterate using forEachChild, but would receive many instances.
       */
      return false;
    }

    const match = parent.children
      .find((child) => child.field?.name === path[0]);

    if (!match) {
      return false;
    }

    path.splice(0, 1);
    if (path.length) {
      return H5PUtil.findFieldInstance(path, match);
    }
    else {
      return match;
    }
  }
}
