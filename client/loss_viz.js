// Structured (n * m) grid of data. Point coordinates are (xgrid, ygrid)
var scene;
var renderer;
var camera;
var light;
var raycaster;
var mouse;

function onMouseMove(event) {

	// calculate mouse position in normalized device coordinates
	// (-1 to +1) for both components

	var bounds = event.target.getBoundingClientRect();
	var x = event.clientX - bounds.left;
	var y = event.clientY - bounds.top;
	$("#tooltip").text("");
	$("#tooltip").position({
		my: "left+3 bottom-3",
		of: event,
		collision: "fit"
	});
	mouse.x = (x / renderer.domElement.clientWidth) * 2 - 1;
	mouse.y =  - (y / renderer.domElement.clientHeight) * 2 + 1;
	//console.log('x = '+ mouse.x + ' y = ' + mouse.y )
	raycaster.setFromCamera(mouse, camera);

	// calculate objects intersecting the picking ray
	var intersects = raycaster.intersectObjects(scene.children);
	if (intersects.length > 0) {
		var x = intersects[0].point.x
			var y = intersects[0].point.y
			var z = intersects[0].point.z
			console.log('x = ' + x + ' y = ' + y + ' z = ' + z)
			$("#tooltip").text('x = ' + parseFloat(x).toFixed(2) + ' y = ' + parseFloat(y).toFixed(2) + ' z = ' + parseFloat(z).toFixed(2));
	}
}

function onMouseDown(event) {
	// update the picking ray with the camera and mouse position
	var bounds = event.target.getBoundingClientRect();
	var x = event.clientX - bounds.left;
	var y = event.clientY - bounds.top;
	mouse.x = (x / renderer.domElement.clientWidth) * 2 - 1;
	mouse.y =  - (y / renderer.domElement.clientHeight) * 2 + 1;

}

function updateUI(camera) {
	$("#cam_pos_x").val(parseFloat(camera.position.x).toFixed(2))
	$("#cam_pos_y").val(parseFloat(camera.position.y).toFixed(2))
	$("#cam_pos_z").val(parseFloat(camera.position.z).toFixed(2))

	$("#cam_rot_x").val(parseFloat(camera.rotation.x * 180 / 3.14).toFixed(2))
	$("#cam_rot_y").val(parseFloat(camera.rotation.y * 180 / 3.14).toFixed(2))
	$("#cam_rot_z").val(parseFloat(camera.rotation.z * 180 / 3.14).toFixed(2))
}

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

	// Get contours
	var contours = d3.contours()
		.size([X.length, X.length])
		.thresholds(d3.range(1, 10))(values)

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

	for (var i = 0; i < nverts; i++)
		values[i] = values[i] > 20 ? 20 : values[i]

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
		var newvert = new THREE.Vector3((xgrid[k] - xmid) * scalefac, (ygrid[k] - ymid) * scalefac, (values[k]) * scalefacz);
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
	/*
	var material = new THREE.MeshPhongMaterial({
	side: THREE.DoubleSide,
	color: 0xffffff,
	vertexColors: THREE.VertexColors,
	specular: 0x050505,
	shininess: 100.,
	emissive: 0x111111,
	});
	 */
	var material = new THREE.MeshPhongMaterial({
			side: THREE.DoubleSide,
			color: 0xffffff,
			vertexColors: THREE.VertexColors,
			specular: 0,
			shininess: 0.0,
			emissive: 0,
			opacity: 1,
			wireframe: false
		});
	return {
		'mesh': new THREE.Mesh(geometry, material),
		'contours': contours
	}
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
	renderer.setPixelRatio(1);
	renderer.setSize(1280, 1080);

	// Set target DIV for rendering
	var container = document.getElementById('renderer-content');
	container.appendChild(renderer.domElement);

	// Define the camera
	camera = new THREE.PerspectiveCamera(45, 1, 0.1, 40);
	camera.position.z = 5;
	camera.position.y = 4;
	updateUI(camera);
	// for picking
	raycaster = new THREE.Raycaster();
	mouse = new THREE.Vector2();

	// Add controls
	var controls = new THREE.OrbitControls(camera, renderer.domElement);
	controls.addEventListener('change', function () {
		renderer.render(scene, camera); // re-render if controls move/zoom
		updateUI(camera)
	});
	controls.enableZoom = true;

	document.addEventListener('mousemove', onMouseMove, false);
	//document.addEventListener('mousedown', onMouseDown, false);

	// Light above
	light = new THREE.PointLight(0xffffff);
	light.position.set(0, 0, 3);
	scene.add(light);

	// Light below
	var _light = new THREE.PointLight(0xffffff);
	_light.position.set(0, 0, -5);
	scene.add(_light);

	// Ambient light
	var _light = new THREE.AmbientLight(0x222222);
	scene.add(_light);

	// Make initial call to render scene
	renderer.render(scene, camera);
}

function add_mesh(mesh) {
	scene.add(mesh);
}

document.addEventListener("DOMContentLoaded", function () {
	var this1 = this;
	$("#slider1").slider({
		max: 4,
		step: 0.2,
		value: 1,
		slide: function (event, ui) {
			light.intensity = ui.value
				renderer.render(scene, camera);
		}
	});

	$("#sliderlX").slider({
		max: 4,
		min: -4,
		value: 0,
		step: 0.2,
		slide: function (event, ui) {
			light.position.x = ui.value
				renderer.render(scene, camera);
		}
	});

	$("#sliderlY").slider({
		max: 4,
		min: -4,
		value: 0,
		step: 0.2,
		slide: function (event, ui) {
			light.position.y = ui.value
				renderer.render(scene, camera);
		}
	});

	$("#sliderlZ").slider({
		max: 10,
		min: 0,
		value: 3,
		step: 0.2,
		slide: function (event, ui) {
			light.position.z = ui.value
				renderer.render(scene, camera);
		}
	});

	$('#wireframe').change(function () {
		if ($(this).prop('checked')) {
			for (model in models) {
				models[model].mesh.material.wireframe = true;
			}
		} // enable wireframe on all models
		else {
			for (model in models) {
				models[model].mesh.material.wireframe = false;
			}
		}
		renderer.render(scene, camera);
	})

	$('#resnet_short').change(function () {
		if ($(this).prop('checked')) {
			models["resnet_short"].mesh.visible = true;
		} // enable wireframe on all models
		else {
			for (model in models) {
				models["resnet_short"].mesh.visible = false;
			}
		}
		renderer.render(scene, camera);
	})

	$('#resnet_no_short').change(function () {
		if ($(this).prop('checked')) {
			models["resnet_no_short"].mesh.visible = true;
		} // enable wireframe on all models
		else {
			for (model in models) {
				models["resnet_no_short"].mesh.visible = false;
			}
		}
		renderer.render(scene, camera);
	})

	$('#All').change(function () {
		if ($(this).prop('checked')) {
			for (model in models)
				models[model].mesh.visible = true;
		} // enable wireframe on all models
		else {
			for (model in models) {
				models[model].mesh.visible = false;
			}
		}
		renderer.render(scene, camera);
	})
})