"use strict";
exports.__esModule = true;
var $ = require("jquery");
var THREE = require("three");
var MOL_BALL = /** @class */ (function () {
    function MOL_BALL(atom, x, y, z) {
        this.atom = atom;
        this.x = x;
        this.y = y;
        this.z = z;
        // ここらへんは好きなオブジェクトをシーンに突っ込んじゃってください。
        var geometry = new THREE.BoxGeometry(1, 1, 1);
        // let material = new THREE.MeshBasicMaterial({color: 0x00ff00});
        var material = new THREE.MeshNormalMaterial();
        this.ball = new THREE.Mesh(geometry, material);
    }
    MOL_BALL.prototype.getBall = function () {
        return this.ball;
    };
    MOL_BALL.prototype.update = function () {
    };
    return MOL_BALL;
}());
$(function () {
    var $mainFrame = $("body");
    var mols = [
        [-0.3572, -0.2063, 0.0000],
        [0.3572, 0.2063, 0.0000],
        [-1.0693, 0.2051, 0.0000],
        [1.0693, -0.2045, 0.0000],
        [0.3572, 1.0284, 0.0000],
        [-0.3572, -1.0284, 0.0000]
    ];
    // シーン、カメラ、レンダラを生成
    var scene = new THREE.Scene();
    var camera = new THREE.PerspectiveCamera(75, $mainFrame.width() / $mainFrame.height(), 0.1, 1000);
    var renderer = new THREE.WebGLRenderer();
    renderer.setSize($mainFrame.width(), $mainFrame.height());
    camera.position.z = 5;
    camera.position.y = 1;
    // 自動生成されたcanvas要素をdivへ追加する。
    $mainFrame.append(renderer.domElement);
    // Asixヘルパー
    var axisHelper = new THREE.AxisHelper(10);
    scene.add(axisHelper);
    // Gridヘルパー
    var gridHelper = new THREE.GridHelper(20, 5);
    scene.add(gridHelper);
    var ball = new MOL_BALL('C', -0.3572, -0.2063, 0.0000);
    scene.add(ball.getBall());
    // コールバック関数 render をrequestAnimationFrameに渡して、
    // 繰り返し呼び出してもらう。
    var render = function () {
        window.requestAnimationFrame(render);
        ball.update();
        renderer.render(scene, camera);
    };
    render();
    $(window).keypress(function (eventObject) {
        if ('h' == eventObject.key) {
            camera.rotation.y += 0.01;
        }
        if ('l' == eventObject.key) {
            camera.rotation.y -= 0.01;
        }
        if ('j' == eventObject.key) {
            camera.rotation.x -= 0.01;
        }
        if ('k' == eventObject.key) {
            camera.rotation.x += 0.01;
        }
    });
});
