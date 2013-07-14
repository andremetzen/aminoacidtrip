var context = new webkitAudioContext();
var analyser = context.createAnalyser();
var source; 

var Instrument = function(dir, options){
  var instrument_dir = dir;
  options = options || {};
  var focus = options.focus;
  var notes = {
    'F':{name: 'a2', file: instrument_dir+'/A2.wav', alt: ['T', 'D']},
    'L':{name: 'b2', file: instrument_dir+'/B2.wav', alt: ['A', 'E']},
    'I':{name: 'c2', file: instrument_dir+'/C2.wav', alt: ['Y', 'C']},
    'M':{name: 'd2', file: instrument_dir+'/D2.wav', alt: ['H', 'W']},
    'V':{name: 'e2', file: instrument_dir+'/E2.wav', alt: ['Q', 'R']},
    'S':{name: 'f2', file: instrument_dir+'/F2.wav', alt: ['N', 'G']},
    'P':{name: 'g2', file: instrument_dir+'/G2.wav', alt: ['K', 'a']},

    'T':{name: 'a3', file: instrument_dir+'/A3.wav', alt: ['D', 'F']},
    'A':{name: 'b3', file: instrument_dir+'/B3.wav', alt: ['E', 'L']},
    'Y':{name: 'c3', file: instrument_dir+'/C3.wav', alt: ['C', 'I']},
    'H':{name: 'd3', file: instrument_dir+'/D3.wav', alt: ['W', 'M']},
    'Q':{name: 'e3', file: instrument_dir+'/E3.wav', alt: ['R', 'V']},
    'N':{name: 'f3', file: instrument_dir+'/F3.wav', alt: ['G', 'S']},
    'K':{name: 'g3', file: instrument_dir+'/G3.wav', alt: ['a', 'P']},

    'D':{name: 'a4', file: instrument_dir+'/A4.wav', alt: ['F', 'T']},
    'E':{name: 'b4', file: instrument_dir+'/B4.wav', alt: ['L', 'A']},
    'C':{name: 'c4', file: instrument_dir+'/C4.wav', alt: ['I', 'Y']},
    'W':{name: 'd4', file: instrument_dir+'/D4.wav', alt: ['M', 'H']},
    'R':{name: 'e4', file: instrument_dir+'/E4.wav', alt: ['V', 'Q']},
    'G':{name: 'f4', file: instrument_dir+'/F4.wav', alt: ['S', 'N']},
    'a':{name: 'g4', file: instrument_dir+'/G4.wav', alt: ['P', 'K']}
  };

  var rithms = [
    [500, 500, 500, 500],
    [750, 250, 750, 250],
    [250, 750, 250, 750],
    [500, 250, 750, 500]
  ];

  var lastPlayed = null,
    stoped = false,
    coundRepeat = 0,
    sounds = [],
    currentRithm = [],
    index = 0;


  var findRightNote = function(n) {
    var oldN = n;
    if(lastPlayed == n && lastPlayed != null){
      coundRepeat++;
      n = notes[n].alt[(coundRepeat % notes[n].alt.length)];
    }
    else
      coundRepeat = 0;
    
    lastPlayed = oldN;

    return n;
  };

  var nextTime = function() {
    var t;
    if(currentRithm.length == 0)
    {
      var sum = 0;
      for(var i = 0; i < 4; i++)
      {
        sum += sounds[i].charCodeAt(0);
      }
      
      currentRithm = rithms[sum % rithms.length].slice();
    }
    return currentRithm.pop();
  };

  this.push = function(element){
    sounds.push(element);
  }

  this.run = function(s) {
    if(s == undefined)
      s = sounds.shift();
    var self = this;
    this.play(s);
    
    setTimeout(function(){
      if(!self.stoped)
      {
        self.run(sounds.shift());
      }
    }, nextTime());
  };

  this.play = function (n){
    n = findRightNote(n);
    var a = new Audio();
    a.src = notes[n].file;
    source = context.createMediaElementSource(a);
    source.connect(analyser);
    analyser.connect(context.destination);
    a.play();
    a.addEventListener('ended', function(){ this.remove(); });

    if(focus)
      focus(index);
    index++;
  };

  this.stop = function () {
    stoped = true;
    sounds = [];
  };
};

var instruments = [
  {name: 'Pad', dir: 'instrumentos/8bitpad-2s'}, //0
  {name: 'Glitch', dir:'instrumentos/8bitbass-3oct-1s'}, //1
  {name: 'Blip blop', dir: 'instrumentos/8bit-3oct-2s'}, //2 
  {name: 'Warp', dir: 'instrumentos/8bitter-1s'}, //3
  {name: 'Baixo', dir: 'instrumentos/baixo'}, //4
  {name: 'Pad', dir: 'instrumentos/pad'}, //5
  {name: 'Corda', dir: 'instrumentos/corda'}, //6
  {name: 'Mallet', dir: 'instrumentos/mallet'} //7
];

var runningInstruments = [];

function focusCallback(index) {
  var seq = $('.protein-sequence').text();
  var seqFocus = seq.slice(0, index)+'<span>'+seq.slice(index, index+1)+'</span>'+seq.slice(index+1, seq.length);
  $('.protein-sequence').html(seqFocus);
  $('.holder.focus').removeClass('focus');
  $('.holder').eq(index).addClass('focus');
}

function start(){
  var notes = selectedProtein.seq.slice('');

  var arrange = [
    new Instrument(instruments[4].dir, {focus: focusCallback}),
    new Instrument(instruments[6].dir),
    new Instrument(instruments[7].dir)
  ];

  for(var i in arrange){
    var instrument = arrange[i];
    for(x in notes)
    {
      instrument.push(notes[x]);
    }

    instrument.run();
    runningInstruments.push(instrument);
  }
}

function stop() {
  for(x in runningInstruments)
  {
    runningInstruments[x].stop();
    delete runningInstruments[x];
  }
}

var selectedProtein = null;

$(function(){
  var proteinSelect = $('#available-proteins').empty();

  for(x in proteins){
    proteinSelect.append('<option value="'+x+'">'+proteins[x].name+'</option>');
  }

  proteinSelect.change(function(){
    changeProtein(proteins[$(this).val()]);
    stop();
  });

  changeProtein(proteins[0]);
});

var changeProtein = function(protein){
  selectedProtein = protein;
  $('.protein-name').empty().append(protein.name);
  $('.protein-sequence').empty().append(protein.seq);
  $('.description').empty().append('<p>'+protein.info.split('\n').join('</p><p>')+'</p>');
  $('.links').empty();
  for(var x in protein.links){
    $('.links').append('<li><a href="'+protein.links[x]+'">'+protein.links[x]+'</a></li>');
  }

  proteinView.render(protein);
};

var ProteinView = function(){

  var aminoacidos = {
  'F': 0,
  'L': 1,
  'I': 2,
  'M': 3,
  'V': 4,
  'S': 5,
  'P': 6,
  'T': 7,
  'A': 8,
  'Y': 9,
  'H': 10,
  'Q': 11,
  'N': 12,
  'K': 13,
  'D': 14,
  'E': 15,
  'C': 16,
  'W': 17,
  'R': 18,
  'G': 19
  };

  function convertAminoToColor(a) {
    return aminoacidos[a] * 13.4;
  }

  this.render = function (protein) {
    $('.preview').empty();
    $('.preview').append('<div class="colors" id="colors-' + protein.name + '"/>');
    
    var $pixar;
    var proteinArray = protein.seq.split('');
    
    for (var i = 0; i < proteinArray.length - 2; i+=3) {
      var colorPixelR = convertAminoToColor(proteinArray[i]).toFixed();
      var colorPixelG = convertAminoToColor(proteinArray[i+1]).toFixed();
      var colorPixelB = convertAminoToColor(proteinArray[i+2]).toFixed();
      var colorRGB = 'rgb(' + colorPixelR + ', ' + colorPixelG + ', ' + colorPixelB + ')';
      var colorRGBA = 'rgba(' + colorPixelR + ', ' + colorPixelG + ', ' + colorPixelB + ', 1)';
      
      var $holder = $('<div class="holder">');
      $pixar = $('<div class="pixar" />').css({
        'background-color': colorRGB,
        //'box-shadow': '0 0 5px'+colorRGBA,
        //'-webkit-box-shadow': '0 0 5px '+colorRGBA
      });
      $holder.append($pixar);

      $holder.appendTo('#colors-' +protein.name);
    }

  }

};

var proteinView = new ProteinView();
