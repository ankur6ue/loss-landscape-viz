// Structured (n * m) grid of data. Point coordinates are (xgrid, ygrid)
var scene;
var renderer;
var camera;

function create_mesh(X, Y, Z) {
	var n = X.length,
	m = X.length;
	// Assert that X, Y, Z have equal length
	var nverts = n * m;
	var values = new Array(n * m);
	var xgrid = new Array(n * m);
	var ygrid = new Array(n * m);

	// Convert 2D to unwrapped 1D array
	xgrid = [];
	for (row of X)
		for (e of row)
			xgrid.push(e);
	ygrid = [];
	for (row of Y)
		for (e of row)
			ygrid.push(e);
	values = [];
	for (row of Z)
		for (e of row)
			values.push(e);

	// Obtain centre of grid and scale factors
	var xmin = d3.min(xgrid);
	var xmax = d3.max(xgrid);
	var xmid = 0.5 * (xmin + xmax);
	var xrange = xmax - xmin;

	var ymin = d3.min(ygrid);
	var ymax = d3.max(ygrid);
	var ymid = 0.5 * (ymin + ymax);
	var yrange = ymax - ymin;

	var zmin = d3.min(values);
	var zmax = d3.max(values);
	// Clip z max to 50 times z min as we are not interested in high peaks
	zmax = Math.min(zmax, 10 * zmin)
		var zmid = 0.5 * (zmin + zmax);
	var zrange = zmax - zmin;

	for (i = 0; i < n; i++) {
		if (values[i] > zmax)
			values[i] = zmax
	}

	var scalefac = 1 //1.2/Math.max(xrange, yrange);
		var scalefacz = 0.1 //0.5/zrange;

		// Use d3 for color scale
		var color = d3.scaleLinear()
		.domain(d3.extent(values))
		.interpolate(function () {
			return d3.interpolateRdBu;
		});

	// Initialise threejs geometry
	var geometry = new THREE.Geometry();

	// Add grid vertices to geometry
	for (var k = 0; k < nverts; ++k) {
		var newvert = new THREE.Vector3((xgrid[k] - xmid) * scalefac, (ygrid[k] - ymid) * scalefac, (values[k] - zmid) * scalefacz);
		geometry.vertices.push(newvert);
	}

	// Add cell faces (2 traingles per cell) to geometry
	for (var j = 0; j < m - 1; j++) {
		for (var i = 0; i < n - 1; i++) {
			var n0 = j * n + i;
			var n1 = n0 + 1;
			var n2 = (j + 1) * n + i + 1;
			var n3 = n2 - 1;
			face1 = new THREE.Face3(n0, n1, n2);
			face2 = new THREE.Face3(n2, n3, n0);
			face1.vertexColors[0] = new THREE.Color(color(values[n0]));
			face1.vertexColors[1] = new THREE.Color(color(values[n1]));
			face1.vertexColors[2] = new THREE.Color(color(values[n2]));
			face2.vertexColors[0] = new THREE.Color(color(values[n2]));
			face2.vertexColors[1] = new THREE.Color(color(values[n3]));
			face2.vertexColors[2] = new THREE.Color(color(values[n0]));
			geometry.faces.push(face1);
			geometry.faces.push(face2);
		}
	}

	// Compute normals for shading
	geometry.computeFaceNormals();
	geometry.computeVertexNormals();

	// Use MeshPhongMaterial for a reflective surface
	var material = new THREE.MeshPhongMaterial({
			side: THREE.DoubleSide,
			color: 0xffffff,
			vertexColors: THREE.VertexColors,
			specular: 0x050505,
			shininess: 100.,
			emissive: 0x111111,
		});
	return new THREE.Mesh(geometry, material)
}

function init(mesh) {
	// Initialise threejs scene
	scene = new THREE.Scene();

	// Add Mesh to scene
	scene.add(mesh);

	// Create renderer
	renderer = new THREE.WebGLRenderer({
			alpha: true,
			antialias: true
		});
	renderer.setPixelRatio(window.devicePixelRatio);
	renderer.setSize(900, 900);

	// Set target DIV for rendering
	var container = document.getElementById('plot');
	container.appendChild(renderer.domElement);

	// Define the camera
	camera = new THREE.PerspectiveCamera(45, 1, 0.1, 10);
	camera.position.z = 4;

	// Add controls
	var controls = new THREE.OrbitControls(camera, renderer.domElement);
	controls.addEventListener('change', function () {
		renderer.render(scene, camera); // re-render if controls move/zoom
	});
	controls.enableZoom = true;

	// Light above
	var light = new THREE.PointLight(0xffffff);
	light.position.set(0, 0, 3);
	scene.add(light);

	// Light below
	var light = new THREE.PointLight(0xffffff);
	light.position.set(0, 0, -3);
	scene.add(light);

	// Ambient light
	var light = new THREE.AmbientLight(0x222222);
	scene.add(light);

	// Make initial call to render scene
	renderer.render(scene, camera);
}

function add_mesh(mesh) {
	scene.add(mesh);
}

document.addEventListener("DOMContentLoaded", function() {
	var this1 = this;
	$('.ModelDropDownListItem').click(function(e) {
		var name = e.currentTarget;
		var modelName = name.getAttribute("data-name")
		console.log(modelName);
		for (model in this1.models){
			this1.models[model].mesh.visible = false;
		}
		this1.models[modelName].mesh.visible = true	
		this1.activeModel = modelName;
		this1.renderer.render(this1.scene, this1.camera);
	});
	
	}.bind(this), false);