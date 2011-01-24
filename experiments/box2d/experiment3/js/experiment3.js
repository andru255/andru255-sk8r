var world;
window.onload = function() {
  var canvas = document.getElementById("canvas");
  world = new World({canvas: canvas});
  var pencil = new Pencil(world);
};

function play() {
  window.setInterval(world.update.bind(world), 1000 / 30);
//  world.dropBalls();
}
