const http = require('http');
const fs = require('fs');
const tmpdir = require('os').tmpdir();
const path = require('path');
const AdmZip = require('adm-zip');
const ZVM = require('ifvms').ZVM;
const readline = require('readline');
const MuteStream = require('mute-stream');

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
  const localZip = path.join(tmpdir, 'z.zip');
  download('http://www.infocom-if.org/downloads/zork1.zip', localZip, err => {
    if (err) {
      cb(err);
    } else {
      const zip = new AdmZip(localZip);
      zip.extractEntryTo('DATA/ZORK1.DAT', tmpdir, false, true);
      fs.unlinkSync(localZip);
      cb();
    }
  });
};

const runZork = function(datFile) {
  const GlkOte = require('glkote-term');

  const vm = new ZVM();
  const Glk = GlkOte.Glk;

    // Readline options
    const stdin = process.stdin;
    const stdout = new MuteStream();
    stdout.pipe(process.stdout);
    const rl = readline.createInterface({
      input: stdin,
      output: stdout,
      prompt: ''
    });
    const rl_opts = {
      rl: rl,
      stdin: stdin,
      stdout: stdout
    };
  
  const options = {
    vm: vm,
    Dialog: new GlkOte.Dialog(rl_opts),
    Glk: Glk,
    GlkOte: new GlkOte(rl_opts)
  };

  vm.prepare(fs.readFileSync(datFile), options);

  // This will call vm.init()
  Glk.init(options);
};

const launchZork = function() {
  const datFile = path.join(tmpdir, 'ZORK1.DAT');
  if (!fs.existsSync(datFile)) {
    getZorkDat(err => {
      if (err) {
        console.error(err);
      } else {
        runZork(datFile);
      }
    });
  } else {
    runZork(datFile);
  }
};

module.exports = launchZork;
