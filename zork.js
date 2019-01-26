const http = require('http');
const fs = require('fs');
const AdmZip = require('adm-zip');
const GlkOte = require('glkote-term');
const ZVM = require('ifvms').ZVM;

const download = function(url, dest, cb) {
  const file = fs.createWriteStream(dest);
  http
    .get(url, function(response) {
      response.pipe(file);
      file.on('finish', function() {
        file.close(cb);
      });
    })
    .on('error', function(err) {
      fs.unlinkSync(dest);
      if (cb) cb(err.message);
    });
};

const getZorkDat = function(cb) {
  download('http://www.infocom-if.org/downloads/zork1.zip', 'z.zip', err => {
    if (err) {
      cb(err);
    } else {
      const zip = new AdmZip('z.zip');
      zip.extractEntryTo('DATA/ZORK1.DAT', '.', false, true);
      fs.unlinkSync('z.zip');
      cb();
    }
  });
};

const runZork = function() {
  const vm = new ZVM();
  const Glk = GlkOte.Glk;

  const options = {
    vm: vm,
    Dialog: new GlkOte.Dialog(),
    Glk: Glk,
    GlkOte: new GlkOte()
  };

  vm.prepare(fs.readFileSync('ZORK1.DAT'), options);

  // This will call vm.init()
  Glk.init(options);
};

const launchZork = function() {
  if (!fs.existsSync('ZORK1.DAT')) {
    getZorkDat(err => {
      if (err) {
        console.error(err);
      } else {
        runZork();
      }
    });
  } else {
    runZork();
  }
};

module.exports = launchZork;
