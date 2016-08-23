/**
 * User: 林子龙
 * Date: 16-5-24
 * Time: 下午2:15
 *针对3D模型的加载与编辑.
 */

var outlineMesh;
/**
 * 房间模型
 */
var m_room;
/**
 * 镜头
 */
var m_ob_control;

var m_tran_control;
/**
 * 选中的模型
 */
var m2_INTERSECTED
/**
 * 读取mtl和obj文件
 */
function mloadObject(p_mtlurl,p_objurl){
    var mtlLoader = new THREE.MTLLoader();
    mtlLoader.setBaseUrl( './model/' );
    mtlLoader.setPath( './model/' );
    mtlLoader.load( p_mtlurl, function( materials ) {
        materials.preload();
        var objLoader = new THREE.OBJLoader();
        objLoader.setMaterials( materials );
        objLoader.setPath( './model/' );
        objLoader.load( p_objurl, function ( object ) {

            object.traverse(function(child) {
       //         if (child instanceof THREE.Mesh) {
           //        THREE.SceneUtils.detach( child, object, m_scene );
         //       }
            });
            m_scene.add( object );
            m_room=object;
        } );
    });
}
/**
 * 返回是否选中
 */
function mIsCheck(p_id){
    return  $("#"+p_id).bootstrapSwitch('state');
}
var mixers = [];
function loadFbx(){
    var loader = new THREE.FBXLoader();
    loader.load( 'model/20160518163901/20160518163901.fbx', function( object ) {
        /*object.traverse( function( child ) {
            if ( child instanceof THREE.Mesh ) {
                // pass
            }
            if ( child instanceof THREE.SkinnedMesh ) {
                if ( child.geometry.animations !== undefined || child.geometry.morphAnimations !== undefined ) {
                    child.mixer = new THREE.AnimationMixer( child );
                    mixers.push( child.mixer );
                    var action = child.mixer.clipAction( child.geometry.animations[ 0 ] );
                    action.play();
                }
            }
        } );*/
        m_scene.add( object );
    });
}