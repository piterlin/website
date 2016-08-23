/**
 * Created with JetBrains WebStorm.
 * User: Administrator
 * Date: 16-5-19
 * Time: 上午8:51
 * To change this template use File | Settings | File Templates.
 */

var m_effect


var m_mcontrols
/*
*主显区的长宽
* */
var m_main_view_width, m_main_view_height;

var m_container, m_camera, m_scene, m_renderer;

/**
 *
 * 天空盒材数组、当前选定的材质
 */
var m_skybox = [],m_currentSkybox="jd1";
/**
 * 360度旋转度支持参数
 */
var m_isUserInteracting = false,
    m_onMouseDownMouseX = 0, m_onMouseDownMouseY = 0,
    m_lon = 90, m_onMouseDownLon = 0,
    m_lat = 0, m_onMouseDownLat = 0,
    m_phi = 0, m_theta = 0,
    m_target = new THREE.Vector3(),m_enableWindAuto=false;
/**
 * 触碰工具类
 * */
var m_raycaster,m_rayMouse,m_INTERSECTED, windObjs=[] ;

/**
 *
 * 加载的模型
 */
var m_models=[];

/**
 * 调试信息序列
 */
var m_msg_seq=0;

/**
 * 重置全景
 */
function resetParo(){
   m_isUserInteracting = false,
        m_onMouseDownMouseX = 0, m_onMouseDownMouseY = 0,
       //左右
        m_lon = 90, m_onMouseDownLon = 0,
       //上下
       m_lat = -15, m_onMouseDownLat = 0,
       //前后
       m_phi = 0, m_theta = 0,
        m_target = new THREE.Vector3(),m_enableWindAuto=false,m_camera.fov=75;
    m_camera.updateProjectionMatrix();
}
function onDocumentMouseMoveRay(event){
    m_rayMouse.x = ( (event.clientX -m_container.offset().left)/ m_container.width()  ) * 2 - 1;
    m_rayMouse.y = - (( event.clientY-m_container.offset().top) / m_container.height()) * 2 + 1;
    m_raycaster.setFromCamera( m_rayMouse, m_camera );
    var intersects = m_raycaster.intersectObjects( windObjs );
    if ( intersects.length > 0 ) {
        if(m_INTERSECTED==null){
            m_INTERSECTED=intersects[ 0 ].object;
        }
        if ( m_INTERSECTED != intersects[ 0 ].object ){
            m_INTERSECTED.scale.x=m_INTERSECTED.scale.y=m_INTERSECTED.scale.z=0.05;
        }else{
            m_INTERSECTED=intersects[ 0 ].object;
            m_INTERSECTED.scale.x=m_INTERSECTED.scale.y=m_INTERSECTED.scale.z=0.1;
        }
    }else if(m_INTERSECTED){
        m_INTERSECTED.scale.x=m_INTERSECTED.scale.y=m_INTERSECTED.scale.z=0.05;
        m_INTERSECTED=null;
    }
    m_renderer.render( m_scene, m_camera );
}

/*
 *碰撞检测开始触屏
 */
function onDocumentTouchStartRay(event) {
    if (event.touches.length == 1) {
//        event.preventDefault();
        m_onPointerDownPointerX = event.touches[ 0 ].pageX;
        m_onPointerDownPointerY = event.touches[ 0 ].pageY;
        m_rayMouse.x = ( (m_onPointerDownPointerX -m_container.offset().left)/ m_container.width()  ) * 2 - 1;
        m_rayMouse.y = - (( m_onPointerDownPointerY-m_container.offset().top) / m_container.height()) * 2 + 1;
        m_raycaster.setFromCamera( m_rayMouse, m_camera );
        var intersects = m_raycaster.intersectObjects( windObjs );
        if ( intersects.length > 0 ) {
            if(m_INTERSECTED==null){
                m_INTERSECTED=intersects[ 0 ].object;
            }
            if ( m_INTERSECTED != intersects[ 0 ].object ){
                m_INTERSECTED.scale.x=m_INTERSECTED.scale.y=m_INTERSECTED.scale.z=0.05;
            }else{
                m_INTERSECTED=intersects[ 0 ].object;
                m_INTERSECTED.scale.x=m_INTERSECTED.scale.y=m_INTERSECTED.scale.z=0.1;
            }
        }else if(m_INTERSECTED){
            m_INTERSECTED.scale.x=m_INTERSECTED.scale.y=m_INTERSECTED.scale.z=0.05;
            m_INTERSECTED=null;
        }
        m_renderer.render( m_scene, m_camera );
        clickChangeSkybox();
    }
}

function clickChangeSkybox(event){
    if(!m_INTERSECTED){
        return ;
    }
    nextSkybox();
}

function nextSkybox(){
    for(textureNum in m_skybox){
        if(m_skybox[textureNum].jd_name==m_currentSkybox){
            if(textureNum==m_skybox.length-1){
                buildSkyBox(m_skybox[0]);
                m_currentSkybox=m_skybox[0].jd_name;
            }else{
                var cNum=1+parseInt(textureNum);
                buildSkyBox(m_skybox[cNum]);
                m_currentSkybox=m_skybox[cNum].jd_name;
            }
            return ;
        }
    }
}
/**
 * 更换房间名称
 */
function changeSkybox(p_name){
    for(textureNum in m_skybox){
        if(m_skybox[textureNum].jd_name==p_name){
            buildSkyBox(m_skybox[textureNum]);
            m_currentSkybox=p_name;
            resetParo();
            return ;
        }
    }
}
/**
 * 初始化触碰工具
 */
function initRayCaster(){
    m_raycaster = new THREE.Raycaster();
    m_rayMouse = new THREE.Vector2();
    m_renderer.domElement.addEventListener('mousemove', onDocumentMouseMoveRay, false);
    m_renderer.domElement.addEventListener('touchstart', onDocumentTouchStartRay, false);
    m_renderer.domElement.addEventListener('click', clickChangeSkybox, false);
}
/**
 * 启动全景效果
 * */
function enableParorama(){
    m_renderer.domElement.addEventListener('mousemove', onDocumentMouseMoveParo, false);
    m_renderer.domElement.addEventListener('mousedown', onDocumentMouseDownParo, false);
    m_renderer.domElement.addEventListener('mouseup', onDocumentMouseUpParo, false);
    m_renderer.domElement.addEventListener('mousewheel', onDocumentMouseWheelParo, false);
    m_renderer.domElement.addEventListener('DOMMouseScroll', onDocumentMouseWheelParo, false);
    m_renderer.domElement.addEventListener('touchstart', onDocumentTouchStartParo, false);
    m_renderer.domElement.addEventListener('touchmove', onDocumentTouchMoveParo, false);
}

/**
 * 滚轮
 * */
function onDocumentMouseWheelParo(event) {
    var m_fov_x;
    if (m_camera.fov > 100 || m_camera.fov < 30) {
        m_fov_x = 0.1;
    } else {
        m_fov_x = 1;
    }
    // WebKit
    if (event.wheelDeltaY) {
        m_camera.fov -= event.wheelDeltaY * 0.05 * m_fov_x;
        // Opera / Explorer 9
    } else if (event.wheelDelta) {
        m_camera.fov -= event.wheelDelta * 0.05 * m_fov_x;
        // Firefox
    } else if (event.detail) {
        m_camera.fov += event.detail * 2.0 * m_fov_x;
    }
    if (m_camera.fov > 150 || m_camera.fov < 20) {
        return;
    }
    m_camera.updateProjectionMatrix();
}

/*
 *全景开始触屏
 */
function onDocumentTouchStartParo(event) {
    if (event.touches.length == 1) {
//       event.preventDefault();
        m_onPointerDownPointerX = event.touches[ 0 ].pageX;
        m_onPointerDownPointerY = event.touches[ 0 ].pageY;
        m_onPointerDownLon = m_lon;
        m_onPointerDownLat = m_lat;
    }
}
/*
 *全景触屏移动
 */
function onDocumentTouchMoveParo(event) {
    if (event.touches.length == 1) {
        event.preventDefault();
        m_lon = ( m_onPointerDownPointerX - event.touches[0].pageX ) * 0.1 + m_onPointerDownLon;
        m_lat = ( event.touches[0].pageY - m_onPointerDownPointerY ) * 0.1 + m_onPointerDownLat;
    }
}
/*
 *全景击鼠标
 */
function onDocumentMouseDownParo(event) {
    event.preventDefault();
    m_isUserInteracting = true;
    m_onPointerDownPointerX = event.clientX;
    m_onPointerDownPointerY = event.clientY;
    m_onPointerDownLon = m_lon;
    m_onPointerDownLat = m_lat;
}
/**
 *全景放松鼠标
 */
function onDocumentMouseUpParo(event) {
    m_isUserInteracting = false;
}

/**
 * 全景鼠标移动
 */
function onDocumentMouseMoveParo(event){
    if (m_isUserInteracting === true) {
        m_lon = ( m_onPointerDownPointerX - event.clientX ) * 0.1 + m_onPointerDownLon;
        m_lat = ( event.clientY - m_onPointerDownPointerY ) * 0.1 + m_onPointerDownLat;
    }
}

/**
 * 初始化3D
 * */
function init3D() {
    updateSize();
   // m_container = $("#3d_content");
    m_container = document.createElement( 'div' );
    document.body.appendChild( m_container );
   m_camera = new THREE.PerspectiveCamera(75, m_main_view_width / m_main_view_height, 1, 1100);
  //  m_camera = new THREE.OrthographicCamera(-10, 10, 10, -10, 1, 100);
 //   m_camera.position.set(0, 0, 5);
    m_scene = new THREE.Scene();
    m_scene.add(new THREE.AmbientLight(0x777777));
    m_renderer = new THREE.WebGLRenderer({ antialias: true });
    m_renderer.setPixelRatio(window.devicePixelRatio);
    m_renderer.setSize(m_main_view_width, m_main_view_height);
   m_container.appendChild(m_renderer.domElement);
    m_renderer.sortObjects = false;
    m_renderer.receiveShadow = true;
    m_renderer.castShadow = true;
    m_renderer.setClearColor(0xffffff);
    window.addEventListener('resize', onWindowResize, false);
}
/**
 * 窗口尺寸变化处理器
 * */
function onWindowResize() {
    updateSize();
    m_camera.aspect = window.innerWidth/ window.innerHeight;
    m_camera.updateProjectionMatrix();
   // m_renderer.setSize( window.innerWidth, window.innerHeight );
    m_effect.setSize( window.innerWidth, window.innerHeight );
}

function loadSkyTexture(urls){
    return  new THREE.CubeTextureLoader().load(urls);
}
/**
 * 构建天空合，输入url数组，输出mesh
 */
function buildSkyBox(textureCube) {
    textureCube.format = THREE.RGBFormat;
    var shader = THREE.ShaderLib[ "cube" ];
    shader.uniforms[ "tCube" ].value = textureCube;
    var material = new THREE.ShaderMaterial({
            fragmentShader:shader.fragmentShader,
            vertexShader:shader.vertexShader,
            uniforms:shader.uniforms,
            depthWrite:false,
            side:THREE.BackSide
        })
    var mesh = new THREE.Mesh(new THREE.BoxGeometry(100, 100, 100), material);
    mesh.receiveShadow = true;
    mesh.castShadow = false;
    changeSkyBtnClass(textureCube.jd_name);
    return mesh;
}

function changeSkyBtnClass(p_jd_name){
var btns=['btn_jd1','btn_jd2','btn_jd3','btn_jd4'];
for(i in btns){
    $("#"+btns[i]).removeClass();
    if(btns[i]=='btn_'+p_jd_name){
        $("#"+btns[i]).addClass('btn btn-info  btn-block');
    }else{
        $("#"+btns[i]).addClass('btn btn-default  btn-block');
    }
}
}
/**
 * 初始化显区尺寸
 */

function updateSize() {
    m_main_view_width = window.innerWidth;
    m_main_view_height = window.innerHeight;
}

/** 右则后方：-1.3, -0.5, -0.4，光线-1.3, -0.8, -0.4
 *左则后方：1.5, -0.4, -0.6，光线1.5, -0.1, -0.6
 * 构建光源
 */
function buildPointLight(pX,pY,pZ){
    var bulbLight = new THREE.PointLight(0xffffff, 1.4, 100, 10);
    var bulbGeometry = new THREE.SphereGeometry(0.001, 20, 100);
    var bulbMat = new THREE.MeshStandardMaterial({
        emissive:0xffffee,
        emissiveIntensity:1,
        color:0x000000
    });
    var m_light=new THREE.Mesh(bulbGeometry, bulbMat)
    bulbLight.add(m_light);
    bulbLight.position.set(pX, pY, pZ);
    bulbLight.castShadow = true;
    return bulbLight;
}
/**
 * 构建方法体
 * */
function buildCube(pX,pY,pZ,objs){
    var loader = new THREE.JSONLoader();
    loader.load("js/cubecolors.js", function(geometry, materials) {
        materials[ 0 ].shading = THREE.FlatShading;
        var cube = new THREE.Mesh(geometry, new THREE.MultiMaterial(materials));
        //相对左门方向：y:上下（负下，正上），z:左右（负右，正左），x：远近
        cube.position.set(pX, pY, pZ)
        cube.castShadow = true;
        cube.receiveShadow = true;
        cube.scale.x = cube.scale.y = cube.scale.z = 0.05;
        m_scene.add(cube);
        if(objs){
             objs.push(cube);
         }
    });
}

function swing(objs){
    for( obj in objs){
        objs[obj].rotation.y -= 0.02;
        objs[obj].rotation.x -= 0.02;
        objs[obj].rotation.z -= 0.02;
    }
}

function swing360(objs){
    for( obj in objs){
        objs[obj].rotation.y -= 0.01;
    }
}

/**
 *
 * 全屏
 */
function launchFullscreen(element) {
    var result=true;
    if(element.requestFullscreen) {
        element.requestFullscreen();
    } else if(element.mozRequestFullScreen) {
        element.mozRequestFullScreen();
    } else if(element.webkitRequestFullscreen) {
        element.webkitRequestFullscreen();
    } else if(element.msRequestFullscreen) {
        element.msRequestFullscreen();
    }else{

        try{
           var container = document.getElementById("3d_content");
            if (container.requestFullscreen) {
                container.requestFullscreen();
            } else if (container.msRequestFullscreen) {
                container.msRequestFullscreen();
            } else if (container.mozRequestFullScreen) {
                container.mozRequestFullScreen();
            } else if (container.webkitRequestFullscreen) {
                container.webkitRequestFullscreen();
            }
        }catch(e){
            showMsg(e);
        }
        result=false;
    }
    return result;
}
/**
 * 构建三维应用
 * @param p_mtl
 * @param p_obj
 * @param p_x
 * @param p_y
 * @param p_z
 * @param p_wing_objs
 */
function buildModel(p_mtl,p_obj,p_x,p_y,p_z,p_objs){
    var mtlLoader = new THREE.MTLLoader();
    mtlLoader.setBaseUrl( '' );
    mtlLoader.load( p_mtl, function( materials ) {
        materials.preload();
        var objLoader = new THREE.OBJLoader();
        objLoader.setMaterials( materials );
        objLoader.setPath( './' );
        objLoader.load( p_obj, function ( object ) {
            object.position.y =p_y;
            object.position.x =p_x;
            object.position.z =p_z;
            object.scale.x=0.004;
            object.scale.z=0.004;
            object.scale.y=0.004;
            object.castShadow = true;
            object.receiveShadow = true;
           // p_objs.push(object);
    //        m_scene.add( object );
            m_models.push(object);
            switchModel();
        } );
    });
}
/**
 *
 * 打印js对像信息
 */
function writeObj(obj){
    var description = "";
    for(var i in obj){
        var property=obj[i];
        description+=i+" = "+property+"\n";
    }
  return   description;
}

/**
 * 模型显视与隐藏切换
 */
function switchModel(){
    for (i in m_scene.children){
        if(m_scene.children[i]==m_models[0]){
            m_scene.remove(m_models[0]);
            return ;
        }
    }
    m_scene.add(m_models[0]);
}
/**
 *
 * 更换材质
 */
function changeMateria(p_url){
    var textureLoader = new THREE.TextureLoader();
    var displacementMap = textureLoader.load(p_url,function(p_texture){
        // material
        p_texture.needsUpdate = true;
        p_texture.castShadow = true;
        p_texture.receiveShadow = true
        var material = new THREE.MeshBasicMaterial( {
            map: p_texture
        } );
        material.castShadow = true;
        material.receiveShadow = true;
        for(i in m_models){
            for( c in m_models[i].children){
                var cv= m_models[i].children[c];
                cv.material.map=p_texture;
            }
        }
    } );
}

/**
 *
 * 左下角展示调试信息
 */
function showMsg(p_msg){
    $("#m_msg_num").html(++m_msg_seq);
    $("#m_msg_content").html(p_msg);
}

/**
 * 全景图更新
 */
function paroramaUpdate(){
    if(m_enableWindAuto==true&&m_isUserInteracting == false){
        m_lon += 0.1;
        if(m_lon>450){
            nextSkybox();
            m_lon=90;
           // resetParo();
        }
    }
    m_lat = Math.max(-85, Math.min(85, m_lat));
    m_phi = THREE.Math.degToRad(90 - m_lat);
    m_theta = THREE.Math.degToRad(m_lon);
    m_target.x = 500 * Math.sin(m_phi) * Math.cos(m_theta);
    m_target.y = 500 * Math.cos(m_phi);
    m_target.z = 500 * Math.sin(m_phi) * Math.sin(m_theta);
//    showMsg(m_lon);
    m_camera.lookAt(m_target);
}

/**
 * 开始自转
 */
function startCameraSwing(){
    m_enableWindAuto=true;
}
/**
 *停止自转
 */
function stopCameraSwing(){
    m_enableWindAuto=false;
}