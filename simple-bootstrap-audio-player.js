/*
Copyright (c) 2013-2014 James Simpson and GoldFire Studios, Inc.
Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/
var scrapedPlayers = [];
function scrapeAudio(){
  var $audioTags = $('audio');
  var $containers = $audioTags.parent();
  var $sources = $audioTags.find('source');
  for (i = 0; i < $audioTags.length; i++){
    var plr = new AudioPlayer($($sources[i]).attr('src'), $($containers[i]));
    scrapedPlayers.push(plr);
  }
}
$(function(){
  scrapeAudio();
});
var players = [];
function AudioPlayer(url, $playerContainer){
  var self = this;
  self.$playerContainer = $playerContainer;
  self.sound = self.setupHowl(url);
  self.init();
}
AudioPlayer.prototype = {
  playPause : function(){
    var self = this;
    for (i = 0; i < players.length; i++){
      if (self !== players[i]){
        if (players[i].playing === true){
          players[i].pause();
        }
      }
    }
    if (!self.playing){
      self.play();
    }
    else {
      self.pause();
    }
  },
  play : function(){
    var self = this;
    self.sound.play();
    self.playing = true;
    self.$playButton.addClass('active');
    self.$progressBar.addClass('active');
    self.tracking();
  },
  pause : function(){
    var self = this;
    self.sound.pause();
    self.playing = false;
    self.$playButton.removeClass('active');
    self.$progressBar.removeClass('active');
  },
  tracking : function(){
    var self = this;
    if (self.playing === true){
      self.$progressBar.width((self.sound.seek() * self.durationConversion) + '%');
      setTimeout(function(){self.tracking();}, 100);
    }
  },
  seek : function(seekTo, seekToPercent){
    var self = this;
    // Move position in audio file
    var seekToPosition = (seekToPercent / self.durationConversion);
    if (self.playing){
      self.sound.seek(seekToPosition);
    }
    else {
      self.sound._sounds[0]._ended = false;
      self.sound.seek(seekToPosition);
    }
  },
  getSeekCoords : function(e){
    var self = this;
    var x = (e.pageX - self.$seekBar.offset().left);
    return x;
  },
  init : function(){
    var self = this;
    self.playing = false;
    self.createPlayer();
    self.$playButton.click(function(){self.playPause();});
    self.widthConversion = 100 / self.$seekBar.width();
    function startSlide(){
      self.$seekBar.on('mousemove', sliding);
      // Move position on playbar
      var x = self.getSeekCoords(event);
      var seekTo = Math.round(x);
      self.$progressBar.width(seekTo);
    }
    function sliding(event){
      var x = self.getSeekCoords(event);
      var seekTo = Math.round(x);
      self.$progressBar.width(seekTo);
    }
    function stopSlide(){
      var seekTo = self.getSeekCoords(event);
      self.$seekBar.off('mousemove', sliding);
      self.$progressBar.width(seekTo);
      var seekToPercent = seekTo * self.widthConversion;
      self.seek(seekTo, seekToPercent);
    }
    self.$seekBar.on('mousedown', startSlide);
    self.$seekBar.on('mouseup', stopSlide);
    $(window).resize(function(){
      self.widthConversion = 100 / self.$seekBar.width();
    });
    players.push(self);
  },
  setupHowl : function(url){
    var self = this;
    if (!$.isArray(url)){
      url = [url];
    }
    var sound = new Howl({
      src: url,
      autoplay: false,
      volume: 1.0,
      onload: function(event){
        self.duration = self.sound._duration;
        self.durationConversion = 100 / self.duration;
      },
      onend: function(event){
        self.playing = false;
        self.$progressBar.removeClass('active');
        self.$playButton.removeClass('active');
        self.$progressBar.width('100%');
      }
    });
    return sound;
  },
  createPlayer : function(){
    var self = this;
    self.$playerContainer.html('\
      <div class="audio-player"> \
        <div class="row"> \
          <div class="col-xs-12"> \
            <div class="play-button-wrapper"> \
              <span id="play-pause" class="play"></span> \
            </div> \
            <div id="seek" class="progress"><div id="progress-bar" class="progress-bar progress-bar-striped" role="progressbar" aria-valuenow="0" aria-valuemin="0" aria-valuemax="100" style="width:0%"></div></div> \
          </div> \
        </div> \
      </div> \
    ');
    self.$playButton = self.$playerContainer.find('#play-pause');
    self.$seekBar = self.$playerContainer.find('#seek');
    self.$progressBar = self.$playerContainer.find('#progress-bar');
  }
};
