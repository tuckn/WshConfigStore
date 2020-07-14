/* globals Wsh: false */
/* globals __dirname: false */
/* globals process: false */

/* globals describe: false */
/* globals test: false */
/* globals expect: false */

// Shorthand
var path = Wsh.Path;
var os = Wsh.OS;
var fs = Wsh.FileSystem;
var fse = Wsh.FileSystemExtra;
var ConfigStore = Wsh.ConfigStore;

describe('ConfigStore', function () {
  var DEF_DIRNAME = '.wsh';
  var DEF_NAME = 'settings.json';
  // @note process.cwd() is a current directory path.
  var defaultDir = path.resolve(process.cwd(), DEF_DIRNAME);
  var defConfPath = path.join(defaultDir, DEF_NAME);

  test('DefaultValues', function () {
    fse.removeSync(defConfPath);
    expect(fs.existsSync(defConfPath)).toBe(false);

    var conf = new ConfigStore();

    expect(conf.path).toBe(defConfPath);
    expect(conf.store).toEqual({});
  });

  test('Methods', function () {
    fse.removeSync(defConfPath);
    expect(fs.existsSync(defConfPath)).toBe(false);

    var conf = new ConfigStore();

    expect(conf.store).toEqual({});

    // Sets multiple items at once
    var obj = { a: [{ b: { c: 3 } }], d: 'D' };
    expect(conf.set(obj)).toEqual(undefined);
    expect(fs.existsSync(defConfPath)).toBe(true);
    // Gets all the config
    expect(conf.store).toEqual(obj);

    // Checks if an item exists.
    expect(conf.has('d')).toBe(true);
    // Gets an item
    expect(conf.get('d')).toBe('D');

    expect(conf.has('a.0.b')).toBe(true);
    expect(conf.get(['a', 0, 'b', 'c'])).toBe(3);

    expect(conf.has('n')).toBe(false);
    expect(conf.get('n')).toBe(undefined);
    expect(conf.get('n', 'Def Val')).toBe('Def Val');
    expect(conf.has('n')).toBe(false);

    // Sets an item
    expect(conf.set('n', 'New Value')).toBe(undefined);
    expect(conf.has('n')).toBe(true);
    expect(conf.get('n')).toBe('New Value');
    expect(conf.get('n', 'Def Val')).toBe('New Value');
    // Deletes an item
    expect(conf.del('n')).toBe(true);
    expect(conf.has('n')).toBe(false);

    // Deletes all items
    expect(conf.clear()).toBe(undefined);
    expect(conf.store).toEqual({});

    // Cleans
    fse.removeSync(defaultDir);
    expect(fs.existsSync(defaultDir)).toBe(false);
  });

  test('CurrentWorkingDirectory', function () {
    fse.removeSync(defConfPath);
    expect(fs.existsSync(defConfPath)).toBe(false);

    var conf = new ConfigStore(null, { dirPath: 'cwd' });

    expect(conf.path).toBe(defConfPath);
    expect(conf.store).toEqual({});
  });

  test('Portable', function () {
    var portableDir = path.resolve(__dirname, DEF_DIRNAME);
    var portablePath = path.resolve(portableDir, DEF_NAME);
    fse.removeSync(portablePath);
    expect(fs.existsSync(portablePath)).toBe(false);

    var conf = new ConfigStore(null, { dirPath: 'portable' });

    expect(conf.path).toBe(portablePath);
    expect(conf.store).toEqual({});

    // Sets multiple items at once
    var obj = { a: [{ b: { c: 3 } }], d: 'D' };
    expect(conf.set(obj)).toEqual(undefined);
    expect(fs.existsSync(portablePath)).toBe(true);
    // Gets all the config
    expect(conf.store).toEqual(obj);

    var jsonObj = fse.readJsonSync(conf.path);
    expect(jsonObj).toEqual(conf.store);

    // Cleans
    fse.removeSync(portableDir);
    expect(fs.existsSync(portableDir)).toBe(false);
  });

  test('UserProfile_CustomName', function () {
    var customName = 'config-store-test';
    var userProfileDir = path.resolve(os.homedir(), DEF_DIRNAME);
    var userProfilePath = path.resolve(userProfileDir, customName + '.json');
    fse.removeSync(userProfilePath);
    expect(fs.existsSync(userProfilePath)).toBe(false);

    var conf = new ConfigStore(customName, { dirPath: 'userProfile' });

    expect(conf.path).toBe(userProfilePath);
    expect(conf.store).toEqual({});

    // Sets multiple items at once
    var obj = { a: [{ b: { c: 3 } }], d: 'D' };
    expect(conf.set(obj)).toEqual(undefined);
    expect(fs.existsSync(userProfilePath)).toBe(true);
    // Gets all the config
    expect(conf.store).toEqual(obj);

    var jsonObj = fse.readJsonSync(conf.path);
    expect(jsonObj).toEqual(conf.store);

    // Cleans
    fse.removeSync(userProfilePath);
    expect(fs.existsSync(userProfilePath)).toBe(false);
  });
});
