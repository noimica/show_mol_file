import $ = require("jquery")
const THREE = require('three-js')([
    'EffectComposer',
    'OrbitControls'
 ]);

function cylinderMesh( pointX:any, pointY:any, materialX: any, materialY: any, n:number ): any
 {
     
     // edge from X to Y
     let direction = new THREE.Vector3().subVectors( pointY, pointX );
     let direction_clone = direction.clone();
     direction.normalize();
     let arrow = new THREE.ArrowHelper( direction, pointX );
 
     // cylinder: radiusAtTop, radiusAtBottom, 
     //     height, radiusSegments, heightSegments

    let scale = 0.09;
    let radius = 0.07;
    let offset: number[][][]=[
        [[0.0, 0.0]],
        [[1.0, 0.0], [-1.0, 0.0]],
        [[0.8660254037844386467637, 0.5], [-0.8660254037844386467637, 0.5], [0, -1]],
        [[0.7071067811865475244008, 0.7071067811865475244008], [-0.7071067811865475244008, 0.7071067811865475244008], [0.7071067811865475244008, -0.7071067811865475244008], [-0.7071067811865475244008, -0.7071067811865475244008]],
        [[0.9510565162951535721164, 0.3090169943749474241023], [0, 1], [-0.9510565162951535721164, 0.3090169943749474241023], [-0.5877852522924731291687, -0.8090169943749474241023], [0.5877852522924731291687, -0.8090169943749474241023]],
        [[1.0, 0.0], [0.5, 0.8660254037844386467637], [-0.5, 0.8660254037844386467637], [-1.0, 0.0], [-0.5, -0.8660254037844386467637], [0.5, -0.8660254037844386467637]]
    ];


    const edge = new THREE.Group(); 
    for(var i=0;i<n;i++){
        let edgeGeometry = new THREE.CylinderGeometry( radius, radius, direction_clone.length()/2, 6, 4 );
        let _edge = new THREE.Mesh( edgeGeometry, 
            materialX );
        //_edge.position.set(offset[n-1][i][0],offset[n-1][i][1],0);
        _edge.position.set(offset[n-1][i][0]*scale,-direction_clone.length()/4,offset[n-1][i][1]*scale);
        edge.add(_edge); // 任意のObject3Dを追加 
    }
    for(var i=0;i<n;i++){
        let edgeGeometry = new THREE.CylinderGeometry( radius, radius, direction_clone.length()/2, 6, 4 );
        let _edge = new THREE.Mesh( edgeGeometry, 
            materialY );
        //_edge.position.set(offset[n-1][i][0],offset[n-1][i][1],0);
        _edge.position.set(offset[n-1][i][0]*scale,direction_clone.length()/4,offset[n-1][i][1]*scale);
        edge.add(_edge); // 任意のObject3Dを追加 
    }
    //edge.rotation = arrow.rotation.clone();
    edge.rotation.set(arrow.rotation.x,arrow.rotation.y,arrow.rotation.z);
    // edge.rotation.x = arrow.rotation.x;
    // edge.rotation.y = arrow.rotation.y;
    // edge.rotation.z = arrow.rotation.z;
    let pos = new THREE.Vector3().addVectors( pointX, direction_clone.multiplyScalar(0.5) );
    edge.position.set(pos.x,pos.y,pos.z);
     return edge;
 }

class TEXT{
    private _div: any;
    private _parent: any = null;
    private position: THREE.Vector3;

    constructor(parent: any){
        this._div = document.createElement('div');
        this._div.className = 'text-label';
        this._div.style.position = 'absolute';
        this._div.style.width = 100;
        this._div.style.height = 100;
        this._div.style.color = 'white';
        this._div.innerHTML = "hi there!";
        this._div.style.top = -1000;
        this._div.style.left = -1000;
        this._parent = parent;
        this.position = new THREE.Vector3();
        this.position.set(this._parent.position.x, this._parent.position.y, this._parent.position.z);
    }

    set html(html:string){
        this._div.innerHTML = html;
    }

    get div(): any{
        return this._div;
    }

    public update(camera: any){
        if(this._parent != null) {
            this.position.set(this._parent.position.x, this._parent.position.y, this._parent.position.z);
        }
          
        var coords2d = this.get2DCoords(this.position, camera);
        this._div.style.left = coords2d.x + 'px';
        this._div.style.top = coords2d.y + 'px';
    }

    public get2DCoords(position: any, camera: any): any {
        var vector = position.project(camera);
        vector.x = (vector.x + 1)/2 * window.innerWidth;
        vector.y = -(vector.y - 1)/2 * window.innerHeight;
        return vector;
    }
    
}

class MOL_BALL{
    private _atom: string;
    private _x: number;
    private _y: number;
    private _z: number;
    private _ball: any;
    private _bond: MOL_BALL[];
    private _material: any;
    private _text: TEXT;
    private color: number;
    private id: number;
    private show_id: boolean;
    private show_name: boolean;
    constructor(atom: string, id: number, x: number, y: number, z:number){
        this._atom = atom;
        switch(atom.toUpperCase()){
            case 'H':
                this.color = 0xffffff;break;
            case 'C':
                this.color = 0x808080;break;
            case 'N':
                this.color = 0x0000ff;break;
            case 'O':
                this.color = 0xff0000;break;
            case 'F':
                this.color = 0xADFF2F;break;
            case 'CL':
                this.color = 0x32CD32;break;
            case 'S':
                this.color = 0xFFFF00;break;
            case 'I':
                this.color = 0x800080;break;
            case 'P':
                this.color = 0xFFA500;break;
            case 'BR':
                this.color = 0x800000;break;
            default:
                this.color = 0xFF1493;break;
        }
        this._x = x;
        this._y = y;
        this._z = z;
        this.id = id;
        this.show_id = false;
        this.show_name = false;

        let geometry = new THREE.SphereGeometry(0.3);
        // let material = new THREE.MeshBasicMaterial({color: 0x00ff00});
        this._material = new THREE.MeshStandardMaterial({color: this.color, roughness:0.5});
        this._ball = new THREE.Mesh(geometry, this.material);
        this.ball.position.set(this.x,this.y,this.z);

        this._text = new TEXT(this.ball);
        this._text.html = "";
    }

    public get ball(): any{
        return this._ball;
    }

    public update(camera: any): void{
        this.text.update(camera);
    }

    public showID() : void{
        this.show_id=true;
        this._text.html = (this.show_name ? this._atom : "") +  this.id.toString();
    }
    public hideID() : void{
        this.show_id=false;
        this._text.html = this.show_name ? this._atom : "";
    }
    public showName(): void{
        this.show_name=true;
        this._text.html = this._atom + (this.show_id ? this.id.toString() : "");
    }
    public hideName(): void{
        this.show_name=false;
        this._text.html = (this.show_id ? this.id.toString() : "");
    }


    public get x(): number{return this._x;}
    public get y(): number{return this._y;}
    public get z(): number{return this._z;}

    public get text(): TEXT{return this._text;}

    public get material(): any{return this._material}

    public setbond(mol: MOL_BALL, bond_n: number): any{
        //this._bond.push(mol);
        let pointX = new THREE.Vector3(this.x, this.y, this.z);
        let pointY = new THREE.Vector3((mol.x), (mol.y), (mol.z));
        let geometry = cylinderMesh(
            new THREE.Vector3(this.x, this.y, this.z),
            pointY,
            this.material,
            mol.material,
            bond_n
        );
       /*
        let direction = new THREE.Vector3().subVectors( pointY, pointX );
        let direction_norm = direction.normalize();
        console.dir(direction);
        let arrow = new THREE.ArrowHelper( direction_norm, pointX , direction.length());
        */
        return geometry;
    }
}

class MOL_FILE{
    private _mols: number[][] = [
    ];
    private _bonds: number[][]=[
    ];
    private _atoms: string[] = [];


    /**
     * URL解析して、クエリ文字列を返す
     * @returns {Array} クエリ文字列
     */
    public getUrlVars(): string
    {
        var vars = [], max = 0, hash: string[], array = "";
        var url = window.location.search;
    
            //?を取り除くため、1から始める。複数のクエリ文字列に対応するため、&で区切る
        hash  = url.slice(1).split('&');    
        max = hash.length;
        for (var i = 0; i < max; i++) {
            let array = hash[i].split('=');    //keyと値に分割。
            vars.push(array[0]);    //末尾にクエリ文字列のkeyを挿入。
            vars[array[0]] = array[1];    //先ほど確保したkeyに、値を代入。
        }
    
        return decodeURIComponent(vars['mol']);
    }

    constructor(){
        let str: string = this.getUrlVars();
        //初期化
        this._mols = [];
        this._bonds = [];
        this._atoms = [];
        let lines:string[] = str.split('\n');
        if(lines.length<4) return;
        let head_data: string[] = lines[3].trim().split(/\s+/);
        let mols_length: number = parseInt(head_data[0]);
        let bonds_length: number = parseInt(head_data[1]);
        console.log(lines[3].trim());
        //console.log("length : "+mols_length.toString()+", "+bonds_length.toString());
        console.log("length : "+head_data[0]+", "+head_data[1]);
        let counter:number = 0;
        lines.slice(4,4+mols_length).forEach(line => {
            let mols_s : string[] = line.trim().split(/\s+/);
            this._mols[counter] = [parseFloat(mols_s[0]), parseFloat(mols_s[1]), parseFloat(mols_s[2])];
            this._atoms[counter] = mols_s[3].trim();
            console.log("mols : "+this._mols[counter] + ", " + this._atoms[counter]);
            counter++;
        });
        counter = 0;
        lines.slice(4+mols_length,4+mols_length+bonds_length).forEach(line => {
            let bonds_s : string[] = line.trim().split(/\s+/);
            this._bonds[counter] = [parseInt(bonds_s[0]), parseInt(bonds_s[1]), parseInt(bonds_s[2])];
            console.log("bonds : "+this._bonds[counter]);
            counter++;
        });
        this.normize();
    }

    public normize(): void{
        //平均を取る
        let norm: number[] = [0, 0, 0];
        this._mols.forEach(mol => {
            norm[0] += mol[0];
            norm[1] += mol[1];
            norm[2] += mol[2];
        });
        norm[0] /= this._mols.length;
        norm[1] /= this._mols.length;
        norm[2] /= this._mols.length;
        this._mols.forEach(mol => {
            mol[0] -= norm[0];
            mol[1] -= norm[1];
            mol[2] -= norm[2];
        });
    }

    get mols(): number[][]{
        return this._mols;
    }
    get bonds(): number[][]{
        return this._bonds;
    }
    get atoms(): string[]{
        return this._atoms;
    }
}

class APP{
    private scene: any;
    private _camera: any;
    private _balls: any[];
    private renderer: any;
    private controls: any;

    constructor($mainFrame){
        this.scene = new THREE.Scene();
        this._camera = new THREE.PerspectiveCamera(75, $mainFrame.width() / $mainFrame.height(), 0.1, 1000);
        this.renderer = new THREE.WebGLRenderer();
        this.renderer.setSize($mainFrame.width(), $mainFrame.height());
        this._camera.position.z = 8;
        this._camera.position.y = 1;
    
        // 自動生成されたcanvas要素をdivへ追加する。
        $mainFrame.append(this.renderer.domElement);

        this.init();

        // コールバック関数 render をrequestAnimationFrameに渡して、
        // 繰り返し呼び出してもらう。
        this.controls = new THREE.OrbitControls(this._camera, this.renderer.domElement);
    }

    public init(): void{
        // Asixヘルパー
        let axisHelper = new THREE.AxisHelper(10);
        this.scene.add(axisHelper);
    
        // Gridヘルパー
        let gridHelper = new THREE.GridHelper(20, 5);
        this.scene.add(gridHelper);
    
        let light1= new THREE.AmbientLight(0xFFFFFF, 1.0);
        this.scene.add(light1);
    
        let light2 = new THREE.DirectionalLight(0xFFFFFF, 1);
        this.scene.add(light2);
    
        let molfile = new MOL_FILE();

        this._balls = new Array(molfile.mols.length);
    
        for(var i=0; i<this._balls.length; i++){
            this._balls[i] = new MOL_BALL(molfile.atoms[i], i+1, molfile.mols[i][0],   molfile.mols[i][1],    molfile.mols[i][2]);
            this.scene.add(this._balls[i].ball);
            $("body").append(this._balls[i].text.div);
        }
        
        for(var i=0; i<molfile.bonds.length; i++){
            this.scene.add(this._balls[molfile.bonds[i][0]-1].setbond(this._balls[molfile.bonds[i][1]-1], molfile.bonds[i][2]));
            //scene.add(balls[bond[i][1]-1].setbond(balls[bond[i][0]-1], bond[i][2]));
        }
    }

    public update(): void{
        this._balls.forEach(ball => {
            ball.update(this._camera);
        });
        this.renderer.render(this.scene, this._camera);
        this.controls.update();
    }

    get balls(): any[]{
        return this._balls;
    }
}

$(function () {
    let $mainFrame = $("body");

    let app: APP = new APP($mainFrame);
    
    // シーン、カメラ、レンダラを生成
    
    let render = function () {
        window.requestAnimationFrame(render);
        app.update();
    };
    render();

    $(window).keypress(function (eventObject) {
    });

    $("#chk1").click(function(){
        var a = $("#chk1").prop("checked");
        if(a){
            app.balls.forEach(ball =>{
                ball.showName();
            });
        }else{
            app.balls.forEach(ball =>{
                ball.hideName();
            });
        }
    });
    $("#chk2").click(function(){
        var a = $("#chk2").prop("checked");
        if(a){
            app.balls.forEach(ball =>{
                ball.showID();
            });
        }else{
            app.balls.forEach(ball =>{
                ball.hideID();
            });
        }
    });
});