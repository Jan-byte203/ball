

// Set up the scene, camera, and renderer as usual
var scene = new THREE.Scene();
var camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
var renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

var loader = new THREE.FontLoader(); // Define loader


// Load the texture
var textureLoader = new THREE.TextureLoader();
var sphereTexture = textureLoader.load('red-scifi-metal_metallic.png');

// Create a transparent spherical ball with the texture
var sphereGeometry = new THREE.SphereGeometry(1, 32, 32); // ball size moon
var sphereMaterial = new THREE.MeshBasicMaterial({map: sphereTexture, transparent: true, opacity: 0});
var sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
scene.add(sphere);

// Create multiple layers of particle systems for the whirlwind
var particleSystems = [];
for (var j = 0; j < 5; j++) {
  var particleGeometry = new THREE.BufferGeometry();
  var positions = [];
  for (var i = 0; i < 2000; i++) {
    var radius = 40 + Math.random() * 200;
    var theta = Math.random() * 2 * Math.PI;
    var phi = Math.random() * 2 * Math.PI;
    positions.push(
      radius * Math.sin(phi) * Math.cos(theta),
      radius * Math.sin(phi) * Math.sin(theta),
      radius * Math.cos(phi)
    );
  }
  particleGeometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));

  var particleMaterial = new THREE.PointsMaterial({
    color: 0xADD8E6, // dust color 2 // blue: 0x6A5ACD  // matrix green 0x00FF00 // inverse pink: 
    size: 0.5, // Make the particles smaller
    blending: THREE.AdditiveBlending,
    transparent: true
  });
  var particles = new THREE.Points(particleGeometry, particleMaterial);
  particles.rotationSpeed = 0.001 * (j + 1); // Vary the rotation speed for each layer
  scene.add(particles);
  particleSystems.push(particles);
}

// Create a separate layer of dust that glows around and wraps the ball
var glowGeometry = new THREE.BufferGeometry();
var glowPositions = [];
for (var i = 0; i < 1000; i++) {
  var radius = 350 + Math.random() * 10;
  var theta = Math.random() * 2 * Math.PI;
  var phi = Math.random() * 2 * Math.PI;
  glowPositions.push(
    radius * Math.sin(phi) * Math.cos(theta),
    radius * Math.sin(phi) * Math.sin(theta),
    radius * Math.cos(phi)
  );
}
glowGeometry.setAttribute('position', new THREE.Float32BufferAttribute(glowPositions, 3));

var glowMaterial = new THREE.PointsMaterial({
  color: 0x8B3A62, //dust color
  size: 1,
  blending: THREE.AdditiveBlending,
  transparent: true
});
var glow = new THREE.Points(glowGeometry, glowMaterial);
scene.add(glow);

// Create a line geometry for the glow particles
var lineGeometry = new THREE.BufferGeometry();
var linePositions = [];
for (var i = 0; i < glowPositions.length - 3; i += 3) {
  linePositions.push(glowPositions[i], glowPositions[i + 1], glowPositions[i + 2], glowPositions[i + 3], glowPositions[i + 4], glowPositions[i + 5]);
}
lineGeometry.setAttribute('position', new THREE.Float32BufferAttribute(linePositions, 3));
var lineMaterial = new THREE.LineBasicMaterial({ color: 0xFFC0CB, transparent: true, opacity: 0 }); // Changed color to pink (0xFFC0CB)
var line = new THREE.LineSegments(lineGeometry, lineMaterial);
scene.add(line);

// Position the camera
camera.position.z = 300;

// Animation loop
var lastLineTime = Date.now();
function animate() {
  requestAnimationFrame(animate);

  // Rotate the particles over time and update their positions
  particleSystems.forEach(function(particles) {
    particles.rotation.y += particles.rotationSpeed; // Use the rotation speed of each layer
  });

  // Rotate the glow particles
  glow.rotation.y += 0.001;

  line.rotation.y += 0.001; // Adjust this value to change the rotation speed


  // Move the sphere around in a zigzag pattern
  var time = Date.now() * 0.001;
  sphere.position.x = 100 * Math.sin(time);
  sphere.position.y = 50 * Math.sin(time * 2);

  // Gradually make the lines visible
  if (Date.now() - lastLineTime > 100) { // This condition is true approximately every 0.5 seconds
    lineMaterial.opacity = (Math.sin(Date.now() * 0.0005) + 1) / 6; // Use the sine function to adjust the opacity
    lineMaterial.needsUpdate = true;
    lastLineTime = Date.now();
  }

  renderer.render(scene, camera);
}

animate();

// Handle window resize
window.addEventListener('resize', onWindowResize, false);

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}