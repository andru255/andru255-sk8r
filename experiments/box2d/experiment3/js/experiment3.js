var world;
window.onload = function() {
  var canvas = document.getElementById("canvas");
  console.log(document.getElementById("debug").value);
  world = new World({canvas: canvas});
  var pencil = new Pencil(world);
};

function play() {
  world.setDebug(document.getElementById("debug").value);
  window.setInterval(world.update.bind(world), 1000 / 30);
//  world.dropBalls();
}
