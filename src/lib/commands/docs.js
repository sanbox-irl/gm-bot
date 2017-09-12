// Node libs
const vm = require('vm');
const http = require('http');
const concat = require('concat-stream');

// Docs data
const gms1 = require('../docs/searchdat-gms1');
const validate = require('../docs/validate.js');

/**
 * Commence documentation fetching!
 * @param {Message} msg Discord message
 * @param {Array<string>} args Command arguments
 */
function run(msg, args) {
  // Default to GMS2 documentation
  let version = 'gms2';

  // User the version the user supplied
  if (args.length > 2) {
    version = args[2];
  } else if (args.length == 1) {
    // Throw on unsupplied function
    msg.author.sendMessage('You did not include a function name. Type `!help` for help with commands.');
    return;
  }

  // Correct version
  version = version.toUpperCase();

  // Switch on version
  switch (version) {
    case 'GMS1':
      // Determine if the provided function is a valid GMS1 function
      if (validate.gml.gms1(args[1])) {
        // If so, provide the helps
        helpUrlGMS1(msg, args[1]);
      } else {
        // Otherwise, provide the nopes
        msg.author.sendMessage('`' + args[1] + '` was not a recognized GMS1 function. Type `!help` for help with commands.');
      }
      break;
  case 'GMS2':
    // Determine if the provided function is a valid GMS2 function
    if (validate.gml.gms2(args[1])) {
      // If so, give 'em the goods
      helpUrlGMS2(msg, args[1]);
    } else {
      // Otherwise, kick 'em to the curb
      msg.author.sendMessage('`' + args[1] + '` was not a recognized GMS2 function. Type `!help` for help with commands.');
    }
    break;
  default:
    // What were they THINKING (invalid GMS version)
    msg.author.sendMessage('`' + version + '` was not a valid option. Type `!help` for help with commands.');
    break;
  }
}

/**
 * Provide GMS2 doc URL
 * @param {Message} msg The Discord message asking for help
 * @param {string} fn Function name to lookup
 */
function helpUrlGMS2(msg, fn) {
  // Download super saucy secret file from YYG server
  http.get("http://docs2.yoyogames.com/files/searchdat.js", (res) => {
    // Read like a normal bot
    res.setEncoding('utf8');

    // Let's check the goods
    res.pipe(concat({encoding: 'string'}, remoteSrc => {
      let found = false;

      // Execute in context to access the inner JS
      vm.runInThisContext(remoteSrc, 'remote_modules/searchdat.js');

      // Loop through newly available SearchTitles (from searchdat.js)
      for (var i = 0; i < SearchTitles.length; i++) {
        // If we find the function we're looking for
        if (SearchTitles[i] == fn) {
          // Provide it
          msg.channel.sendMessage('Here\'s the GMS2 documentation for ' + fn).catch(() => {});
          msg.channel.sendMessage(encodeURI('http://docs2.yoyogames.com/' + SearchFiles[i])).catch(() => {});

          // Indiciate we found it
          found = true;
          break;
        }
      }

      // If we haven't found jack...
      if (!found) {
        // Sorry pal
        msg.author.sendMessage('`' + fn + '` was not a recognized GMS2 function. Type `!help` for help with commands.');
      }
    }));
  });
}

/**
 * Provide GMS1 doc URL
 * @param {Message} msg The Discord message asking for help
 * @param {string} fn Function name to lookup
 */
function helpUrlGMS1(msg, fn) {
  let found = false;

  // Loop through valid titles
  for (var i = 0; i < gms1.titles.length; i++) {
    // If we match up with a function
    if (gms1.titles[i] == fn) {
      // Put together a URL and serve it on a silver platter
      msg.channel.sendMessage('Here\'s the GMS1 documentation for ' + fn).catch(() => {});
      msg.channel.sendMessage(encodeURI('http://docs.yoyogames.com/' + gms1.files[i])).catch(() => {});

      // We struck gold, ma!
      found = true;
      break;
    }
  }

  // No gold to be found
  if (!found) {
    // Tough luck
    msg.author.sendMessage('`' + fn + '` was not a recognized GMS2 function. Type `!help` for help with commands.');
  }
}

module.exports = run;