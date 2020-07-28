/* globals Wsh: false */
/* globals __dirname: false */
/* globals process: false */

(function () {
  if (Wsh && Wsh.ConfigStore) return;

  /**
   * The config manager for WSH (Windows Script Host) that reads/writes configuration values in a JSON file.
   *
   * @namespace ConfigStore
   * @memberof Wsh
   * @requires {@link https://github.com/tuckn/WshModeJs|tuckn/WshModeJs}
   */
  Wsh.ConfigStore = {};

  // Shorthands
  var util = Wsh.Util;
  var path = Wsh.Path;
  var os = Wsh.OS;
  var fse = Wsh.FileSystemExtra;

  var objAssign = Object.assign;
  var insp = util.inspect;
  var obtain = util.obtainPropVal;
  var isSolidString = util.isSolidString;
  var isPlainObject = util.isPlainObject;
  var hasIn = util.hasIn;
  var unset = util.unset;
  var cloneDeep = util.cloneDeep;

  /** @constant {string} */
  var MODULE_TITLE = 'WshConfigStore/ConfigStore.js';

  /** @constant {string} */
  var DEF_NAME = 'settings.json';

  var DEF_DIRNAME = '.wsh';
  // @note process.cwd() is a current directory path.
  var _defaultDir = path.resolve(process.cwd(), DEF_DIRNAME); // cwd

  // @note __dirname is the WSH script directory path which is specified 1st argument by wscript.exe or cscript.exe.
  var _portableDir = path.resolve(__dirname, DEF_DIRNAME); // portable

  // @note os.homedir() is %USERPROFILE% Ex. C:\\Users\\<Name>
  var _userProfileDir = path.join(os.homedir(), DEF_DIRNAME); // userProfile

  // _makeSettingsPath {{{
  /**
   * @private
   * @param {string} [fileName]
   * @param {string} [dirPath] - "cwd", "portable", "userProfile", <dir path>
   * @returns {string}
   */
  var _makeSettingsPath = function (fileName, dirPath) {
    // var FN = '_makeSettingsPath';

    var confFileName = DEF_NAME;
    if (isSolidString(fileName)) confFileName = fileName;
    if (!/\.json$/i.test(confFileName)) confFileName += '.json';

    var confDir = _defaultDir;
    if (isSolidString(dirPath)) {
      if (/^cwd$/i.test(dirPath)) {
        confDir = _defaultDir;
      } else if (/^portable$/i.test(dirPath)) {
        confDir = _portableDir;
      } else if (/^userProfile$/i.test(dirPath)) {
        confDir = _userProfileDir;
      } else if (path.isAbsolute(dirPath)) {
        confDir = path.normalize(dirPath);
      } else {
        confDir = path.resolve(path.join(__dirname, dirPath));
      }
    }

    return path.resolve(path.join(confDir, confFileName));
  }; // }}}

  // _loadSettingsFile {{{
  /**
   * @private
   * @param {string} filePath
   * @param {Object} [options] - See options of {@link Wsh.FileSystemExtra.readJsonSync}
   * @returns {any}
   */
  var _loadSettingsFile = function (filePath, options) {
    var FN = '_loadSettingsFile';

    try {
      return fse.readJsonSync(filePath, options);
    } catch (e) {
      var errStr = insp(e);

      if (/no such file or directory/i.test(errStr)) {
        return {}; // Ignore no existing error
      } else if (/SyntaxError/i.test(errStr)) {
        throw new Error(insp(e) + '\n'
          + '  at ' + FN + ' (' + MODULE_TITLE + ')\n'
          + '  Check syntax of the file "' + filePath + '"');
      } else {
        throw e;
      }
    }
  }; // }}}

  // _saveSettingsFile {{{
  /**
   * @private
   * @param {string} filePath
   * @param {Object} storeObj
   * @param {Object} [options] - See options of {@link Wsh.FileSystemExtra.writeJsonSync}
   * @returns {void}
   */
  function _saveSettingsFile (filePath, storeObj, options) {
    var FN = '_saveSettingsFile';

    var indent = hasIn(options, 'indent') ? options.indent : 2;
    if (indent === null || indent === undefined) indent = 2;

    try {
      fse.ensureDirSync(path.dirname(filePath));
      return fse.writeJsonSync(filePath, storeObj,
        objAssign({}, options, { indent: indent }));
    } catch (e) {
      throw new Error(insp(e) + '\n'
        + '  at ' + FN + ' (' + MODULE_TITLE + ')\n'
        + '  filePath: "' + filePath + '"');
    }
  } // }}}

  // Wsh.ConfigStore {{{
  /**
   * Creates an object to handle the config file. You can change the JSON file path for reading and writing by specifying the arguments.
   *
   * @example
   * // Ex.1: Default
   * var conf = new Wsh.ConfigStore();
   * // Equal with `new Wsh.ConfigStore(null, { dirPath: 'cwd' });`
   *
   * conf.path; // %CD%\.wsh\settings.json
   * conf.store; // Returns: An Object in the above settings.json.
   *
   * // Ex.2: Portable
   * var conf = new Wsh.ConfigStore(null, { dirPath: 'portable' });
   *
   * conf.path; // <Wsh Script Directory>\.wsh\settings.json
   *
   * // Ex.3: UserProfile
   * var conf = new Wsh.ConfigStore('myStore', { dirPath: 'userProfile' });
   *
   * conf.path; // %USERPROFILE%\myStore.json
   *
   * // Ex.4: Specifing absolute path
   * var conf = new Wsh.ConfigStore(null, { dirPath: 'C:\\tmp' });
   *
   * conf.path; // C:\tmp\settings.json
   * @name ConfigStore
   * @class
   * @param {string} [fileName] - The JSON file name to read/write.
   * @param {object} [options] - Optional parameters.
   * @param {string} [options.dirPath] - 'cwd', 'portable', 'userProfile', <Directory Path>
   * @param {object} [options.fileOptions] - See options of {@link https://docs.tuckn.net/WshFileSystem/Wsh.FileSystemExtra.html#.writeJsonSync|Wsh.FileSystemExtra.writeJsonSync}
   * @returns {object} - Wsh.ConfigStore instance.
   */
  Wsh.ConfigStore = function (fileName, options) {
    // var FN = 'Conf';

    // Constructor
    this.path = _makeSettingsPath(
      fileName,
      obtain(options, 'dirPath', _defaultDir)
    );
    var __fileOptions = obtain(options, 'fileOptions', null);

    // store
    /**
     * Returns the object in read JSON file.
     *
     * @example
     * var conf = new Wsh.ConfigStore();
     *
     * conf.store; // { a: [{ b: { c: 3 } }], d: 'D' }
     * @name store
     * @memberof Wsh.ConfigStore
     * @returns {void}
     */
    this.store = _loadSettingsFile(this.path, __fileOptions);

    // set {{{
    /**
     * Sets an item and writes the JSON file.
     *
     * @example
     * var conf = new Wsh.ConfigStore();
     *
     * conf.path; // %CD%\.wsh\settings.json
     * conf.store; // Returns: {}
     *
     * // Set values and update the JSON file.
     *
     * conf.set({ a: [{ b: { c: 3 } }], d: 'D' });
     * conf.store;
     * // Returns: { a: [{ b: { c: 3 } }], d: 'D' }
     *
     * conf.set('n', 'New Value');
     * conf.store;
     * // Returns: { a: [{ b: { c: 3 } }], d: 'D', n: 'New Value' }
     *
     * conf.set('o.p.q', 'Deep Val');
     * conf.store;
     * // Returns:
     * // { a: [{ b: { c: 3 } }],
     * //   d: 'D',
     * //   n: 'New Value',
     * //   o: { p: { q: 'Deep Val' } } }
     * @name set
     * @memberof Wsh.ConfigStore
     * @param {(string|string[]|object)} keyOrObj - The path to store.
     * @param {any} value - The value to set.
     * @returns {void}
     */
    this.set = function (keyOrObj, value) {
      if (isPlainObject(keyOrObj)) {
        this.store = cloneDeep(keyOrObj);
      } else {
        util.set(this.store, keyOrObj, value);
      }

      _saveSettingsFile(this.path, this.store, __fileOptions);
    }; // }}}

    // has {{{
    /**
     * Checks if store has an item.
     *
     * @example
     * var conf = new Wsh.ConfigStore();
     *
     * conf.path; // %CD%\.wsh\settings.json
     * conf.store; // { a: [{ b: { c: 3 } }], d: 'D' }
     *
     * conf.has('a'); // true
     * conf.has('a.0.b'); // true
     * conf.has(['a', 0, 'b', 'c']); // true
     * conf.has('n'); // false
     * @name has
     * @memberof Wsh.ConfigStore
     * @param {(string|string[])} propPath - The path of the property to check.
     * @returns {boolean} - If existing, returns true.
     */
    this.has = function (propPath) {
      return hasIn(this.store, propPath);
    }; // }}}

    // get {{{
    /**
     * Gets an item.
     *
     * @example
     * var conf = new Wsh.ConfigStore();
     *
     * conf.path; // %CD%\.wsh\settings.json
     * conf.store; // { a: [{ b: { c: 3 } }], d: 'D' }
     *
     * conf.get(); // undefined
     * conf.get('a'); // [{ b: { c: 3 } }]
     * conf.get('a.0.b'); // { c: 3 }
     * conf.get(['a', 0, 'b', 'c']); // 3
     * conf.get('n'); // undefined
     * conf.get('n', 'Default Value'); // 'Default Value'
     * @name get
     * @memberof Wsh.ConfigStore
     * @param {(string|string[])} propPath - The path of the property to get.
     * @param {any} [defaultValue] - The default value.
     * @returns {any} - The get value.
     */
    this.get = function (propPath, defaultValue) {
      return util.get(this.store, propPath, defaultValue);
    }; // }}}

    // del {{{
    /**
     * Deletes an item. I wanted to name `delete` to this method. But on JScript, can not use .delete as Object property name.
     *
     * @example
     * var conf = new Wsh.ConfigStore();
     *
     * conf.path; // %CD%\.wsh\settings.json
     * conf.store; // { a: [{ b: { c: 3 } }], d: 'D' }
     *
     * conf.has('a'); // true
     * conf.has('d'); // true
     * conf.del('d');
     * conf.has('d'); // false
     *
     * conf.store; // { a: [{ b: { c: 3 } }] }
     * @name del
     * @memberof Wsh.ConfigStore
     * @param {(string|string[])} propPath - The path of the property to delte.
     * @returns {boolean} - Returns true if the property is deleted, else false.
     */
    this.del = function (propPath) {
      return unset(this.store, propPath);
    }; // }}}

    // clear {{{
    /**
     * Deletes all items.
     *
     * @example
     * var conf = new Wsh.ConfigStore();
     *
     * conf.path; // %CD%\.wsh\settings.json
     * conf.store; // { a: [{ b: { c: 3 } }], d: 'D' }
     *
     * conf.has('a'); // true
     * conf.has(['a', 0, 'b', 'c']); // true
     * conf.has('d'); // true
     *
     * console.clear();
     *
     * conf.store; // Returns: {}
     * @name clear
     * @memberof Wsh.ConfigStore
     * @returns {void}
     */
    this.clear = function () {
      this.store = {};
    }; // }}}
  }; // }}}
})();

// vim:set foldmethod=marker commentstring=//%s :
