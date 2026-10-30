// index.html'e gömülen Three.js parçaları. Yeni bir sınıf gerekirse buraya ekle ve `npm run vendor` çalıştır.
export {
  WebGLRenderer, Scene, PerspectiveCamera, Group, Mesh, Color, Vector3, MathUtils,
  MeshStandardMaterial, MeshBasicMaterial, CanvasTexture, SRGBColorSpace, RepeatWrapping,
  ACESFilmicToneMapping, PCFShadowMap,
  HemisphereLight, DirectionalLight, PointLight,
  PlaneGeometry, SphereGeometry, CapsuleGeometry, CylinderGeometry, TorusGeometry, ConeGeometry,
  ExtrudeGeometry, Shape,
} from 'three';
export { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
