import './style.css'
import javascriptLogo from './javascript.svg'
import viteLogo from '/vite.svg'
import { setupCounter } from './counter.js'
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

import { BismarckButtonBar }  from './buttons';
import { BismarckBuildingPanel }  from './panel';
import { BismarckStockpilePanel }  from './ui_stockpile';
import { BismarckEndTurnButton }  from './ui_endturn';
import { BismarckGameState }  from './gamestate';
import jsonBuildings from './buildings.json' assert { type: 'json' };
import jsonResources from './resources.json' assert { type: 'json' };

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );

const renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight );
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.BasicShadowMap;
document.body.appendChild( renderer.domElement );

const gameState = new BismarckGameState();
const buttonBar = new BismarckButtonBar();
const buildingPanel = new BismarckBuildingPanel();
const stockpilePanel = new BismarckStockpilePanel(gameState);
const endTurnButton = new BismarckEndTurnButton(gameState);

for (var key in jsonBuildings)
{
  var building = jsonBuildings[key];
  buttonBar.AddButton(key, building);
}

let newCube = null;
let currentSelectedBuildingId = null;

function ChangeSelectionMode(event)
{
  if (newCube != null) 
  {
    scene.remove(newCube);
    newCube = null;
  }

  if (event.id != null)
  {
    newCube = new THREE.Mesh( newBuildingGeometry, buildingNewMaterial );
    newCube.castShadow = true;
    newCube.receiveShadow = true;
    scene.add( newCube );

    buildingPanel.Show(jsonBuildings[event.id]);
    currentSelectedBuildingId = event.id;
  }
  else
  {
    buildingPanel.Hide();
    currentSelectedBuildingId = null;
  }
}

renderer.domElement.onclick = function ()
{
  if (currentSelectedBuildingId != null)
  {
    gameState.AddBuilding(currentSelectedBuildingId);
  }

  if (newCube != null)
  {
    newCube = null;
    buttonBar.ButtonSelection(null);
  }
}



buttonBar.addEventListener("onSelectionChange", ChangeSelectionMode);

const controls = new OrbitControls( camera, renderer.domElement );
camera.position.set( 0, 0, 0 );
controls.update();

const directionalLight = new THREE.DirectionalLight( 0xffffff, 0.2 );
directionalLight.castShadow = true;
directionalLight.rotation.x = Math.PI / 4;
directionalLight.rotation.y = Math.PI / 4;
directionalLight.rotation.z = Math.PI / 4;
scene.add( directionalLight );

const spotlight = new THREE.SpotLight(0xffffff);
spotlight.position.y = 1.5;
spotlight.position.z = 0;
spotlight.castShadow = true;
scene.add( spotlight );

const light = new THREE.AmbientLight( 0x444444 ); // soft white light
scene.add( light );

camera.position.y = 5;


const buildingNormalMaterial = new THREE.MeshStandardMaterial ( { color: 0xffffff } );
const buildingFocusedMaterial = new THREE.MeshStandardMaterial ( { color: 0xff0000 } );
const buildingNewMaterial = new THREE.MeshStandardMaterial ( { color: 0x0099ff } );
const groundMaterial = new THREE.MeshStandardMaterial ( { color: 0x999999 } );
const buildingGeometry = new THREE.BoxGeometry( 0.2, 0.2, 0.2 );
const newBuildingGeometry = new THREE.BoxGeometry( 0.2, 0.4, 0.2 );
const groundGeometry = new THREE.PlaneGeometry(50, 50, 1, 1);

var focusable = [];




for (let x = -3; x < 3; x++)
{
  for (let y = -3; y < 3; y++)
  {
    let cube = new THREE.Mesh( buildingGeometry, buildingNormalMaterial );
    cube.castShadow = true;
    cube.receiveShadow = true;
    cube.position.set(x + Math.random() * 0.8 - 0.4, 0.1, y + Math.random() * 0.8 - 0.4);
    scene.add( cube );
    focusable.push(cube);
  }
}

let ground = new THREE.Mesh( groundGeometry, groundMaterial );
ground.rotation.set(-Math.PI / 2,0,0);
ground.receiveShadow = true;
ground.castShadow = false;
scene.add( ground );

const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();
let currentFocusedObject = null;

function animate() {
  raycaster.setFromCamera( pointer, camera );

  const intersects = raycaster.intersectObjects( focusable );

  if (intersects.length > 0)
  {
    if (currentFocusedObject != intersects[0].object)
    {
      if (currentFocusedObject != null)
      {
        currentFocusedObject.material = buildingNormalMaterial;
      }
      currentFocusedObject = intersects[0].object;
      currentFocusedObject.material = buildingFocusedMaterial;
    }
  }
  else
  {
    if (currentFocusedObject != null)
    {
      currentFocusedObject.material = buildingNormalMaterial;
      currentFocusedObject = null;
    }
  }



  const groundIntersect = raycaster.intersectObjects( [ground] );
  if (groundIntersect.length > 0)
  {
    spotlight.position.x = groundIntersect[0].point.x;
    spotlight.position.z = groundIntersect[0].point.z;
    if (newCube != null)
    {
      newCube.position.x = groundIntersect[0].point.x;
      newCube.position.z = groundIntersect[0].point.z;
      newCube.position.y = 0.2;
    }
  }

	requestAnimationFrame( animate );
  controls.update();
	renderer.render( scene, camera );
}
animate();




function onPointerMove( event ) {

	// calculate pointer position in normalized device coordinates
	// (-1 to +1) for both components

	pointer.x = ( event.clientX / window.innerWidth ) * 2 - 1;
	pointer.y = - ( event.clientY / window.innerHeight ) * 2 + 1;

}
window.addEventListener( 'pointermove', onPointerMove );