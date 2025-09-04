import { Component, ElementRef, OnInit, OnDestroy, ViewChild } from '@angular/core';
import * as THREE from 'three';
// @ts-ignore
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { Subscription, interval } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import {TemperatureService} from '../../services/temperature-service';

@Component({
  selector: 'app-digitaltwin',
  standalone: false,
  templateUrl: './digitaltwin.component.html',
  styleUrls: ['./digitaltwin.component.css']
})
export class DigitaltwinComponent implements OnInit, OnDestroy {
  @ViewChild('canvas', { static: true }) canvasRef!: ElementRef<HTMLCanvasElement>;

  private renderer!: THREE.WebGLRenderer;
  private scene!: THREE.Scene;
  private camera!: THREE.PerspectiveCamera;
  private controls!: OrbitControls;
  private sun!: THREE.Mesh;
  private sunLight!: THREE.PointLight;
  private cloudGroup!: THREE.Group;
  private clock = new THREE.Clock();
  private animationId!: number;

  private temperatureSub!: Subscription;

  // HUD related
  private hudCanvas!: HTMLCanvasElement;
  private hudContext!: CanvasRenderingContext2D;
  private hudTexture!: THREE.CanvasTexture;
  private hudMaterial!: THREE.MeshBasicMaterial;
  private hudPlane!: THREE.Mesh;

  // Weather data for HUD
  private currentTemp: number = 0;
  private currentHumidity: number = 0;

  constructor(private temperatureService: TemperatureService) {}

  ngOnInit(): void {
    this.initThree();
    this.animate();

    const { lat, lon } = this.temperatureService.getDefaultLocation();

    this.temperatureSub = interval(2000).pipe(
      switchMap(() => this.temperatureService.getRealtime(lat, lon))
    ).subscribe(data => {
      const temp = data?.temperature ?? 20;
      const humidity = data?.humidity ?? 50;

      this.currentTemp = temp;
      this.currentHumidity = humidity;

      this.applyWeatherToVisuals(temp, humidity);
      this.updateHUD();
    });
  }

  ngOnDestroy(): void {
    cancelAnimationFrame(this.animationId);
    this.temperatureSub?.unsubscribe();
    this.controls?.dispose();
    this.renderer?.dispose();
    this.scene.traverse((obj: any) => {
      if (obj.geometry) obj.geometry.dispose();
      if (obj.material) {
        if (Array.isArray(obj.material)) {
          obj.material.forEach((m: THREE.Material) => m.dispose());
        } else {
          (obj.material as THREE.Material).dispose();
        }
      }
    });
  }

  private initThree(): void {
    const canvas = this.canvasRef.nativeElement;
    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    this.renderer.setPixelRatio(window.devicePixelRatio || 1);
    this.renderer.setSize(canvas.clientWidth, canvas.clientHeight, false);

    this.scene = new THREE.Scene();
    this.scene.fog = new THREE.FogExp2(0x9dbbe0, 0.02);

    this.camera = new THREE.PerspectiveCamera(50, canvas.clientWidth / canvas.clientHeight, 0.1, 1000);
    this.camera.position.set(0, 3, 8);

    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.08;
    this.controls.minDistance = 2;
    this.controls.maxDistance = 30;
    this.controls.target.set(0, 1, 0);

    const hemi = new THREE.HemisphereLight(0xffffff, 0x444455, 0.6);
    this.scene.add(hemi);

    // Sun
    const sunGeo = new THREE.SphereGeometry(0.8, 32, 32);
    const sunMat = new THREE.MeshStandardMaterial({
      emissive: new THREE.Color(0xffd76b),
      emissiveIntensity: 1.5,
      metalness: 0,
      roughness: 0.4
    });
    this.sun = new THREE.Mesh(sunGeo, sunMat);
    this.sun.position.set(0, 4, -2);
    this.scene.add(this.sun);

    this.sunLight = new THREE.PointLight(0xfff0cc, 1.2, 60, 2);
    this.sunLight.position.copy(this.sun.position);
    this.scene.add(this.sunLight);

    // Soft glow sprite around sun
    const spriteMap = this.createGradientTexture();
    const spriteMat = new THREE.SpriteMaterial({ map: spriteMap, color: 0xffffff, transparent: true, opacity: 0.9 });
    const sprite = new THREE.Sprite(spriteMat);
    sprite.scale.set(4, 4, 1);
    sprite.position.copy(this.sun.position);
    this.scene.add(sprite);

    // Ground
    const ground = new THREE.Mesh(
      new THREE.PlaneGeometry(60, 60),
      new THREE.MeshStandardMaterial({ color: 0x7fbf7f, roughness: 1, metalness: 0 })
    );
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -0.01;
    this.scene.add(ground);

    // Clouds
    this.cloudGroup = new THREE.Group();
    this.createClouds(5);
    this.cloudGroup.position.set(0, 2.5, 0);
    this.scene.add(this.cloudGroup);

    // Create HUD canvas & plane
    this.createHUD();

    window.addEventListener('resize', this.onWindowResize);
    this.onWindowResize();
  }

  private createGradientTexture(): THREE.Texture {
    const size = 128;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d')!;
    const grd = ctx.createRadialGradient(size / 2, size / 2, 10, size / 2, size / 2, size / 2);
    grd.addColorStop(0, 'rgba(255,240,180,1)');
    grd.addColorStop(0.4, 'rgba(255,200,80,0.85)');
    grd.addColorStop(1, 'rgba(255,200,80,0)');
    ctx.fillStyle = grd;
    ctx.fillRect(0, 0, size, size);
    const tex = new THREE.CanvasTexture(canvas);
    tex.needsUpdate = true;
    return tex;
  }

  private createClouds(count: number) {
    this.cloudGroup.clear();

    const cloudMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.85,
      roughness: 0.9,
      metalness: 0,
      depthWrite: false,
    });

    for (let i = 0; i < count; i++) {
      const cluster = new THREE.Group();
      const pieces = 4 + Math.floor(Math.random() * 4);
      for (let j = 0; j < pieces; j++) {
        const r = 0.6 + Math.random() * 0.9;
        const g = new THREE.Mesh(new THREE.SphereGeometry(r, 16, 12), cloudMat);
        g.position.set((Math.random() - 0.5) * 2.2, (Math.random() - 0.3) * 0.3, (Math.random() - 0.5) * 1.2);
        g.scale.setScalar(0.9 + Math.random() * 0.6);
        cluster.add(g);
      }
      cluster.position.set((Math.random() - 0.5) * 18, 0, (Math.random() - 0.5) * 10);
      cluster.userData = { speed: 0.02 + Math.random() * 0.04 };
      this.cloudGroup.add(cluster);
    }
  }

  private onWindowResize = () => {
    const canvas = this.canvasRef.nativeElement;
    const width = canvas.clientWidth || window.innerWidth;
    const height = canvas.clientHeight || window.innerHeight;
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height, false);
  };

  private applyWeatherToVisuals(temp: number, humidity: number) {
    const minTemp = -5;
    const maxTemp = 45;
    const tempNorm = Math.min(Math.max((temp - minTemp) / (maxTemp - minTemp), 0), 1);

    const humidityNorm = Math.min(Math.max(humidity / 100, 0), 1);

    const coldColor = new THREE.Color(0xfff1c7);
    const hotColor = new THREE.Color(0xff9a1c);
    const sunColor = coldColor.lerp(hotColor, tempNorm);
    (this.sun.material as THREE.MeshStandardMaterial).emissive = sunColor;
    (this.sun.material as THREE.MeshStandardMaterial).color = sunColor.clone().multiplyScalar(0.2);

    this.sunLight.intensity = 0.6 + tempNorm * 1.8;

    const cloudOpacity = 0.35 + humidityNorm * 0.6;
    this.cloudGroup.traverse((c: any) => {
      if (c.material) {
        if (Array.isArray(c.material)) {
          c.material.forEach((m: any) => (m.opacity = cloudOpacity));
        } else {
          c.material.opacity = cloudOpacity;
        }
      }
    });

    const desiredClouds = Math.floor(3 + humidityNorm * 7);
    if (this.cloudGroup.children.length !== desiredClouds) {
      this.createClouds(desiredClouds);
    }

    const minFog = 0.005;
    const maxFog = 0.035;
    (this.scene.fog as THREE.FogExp2).density = minFog + humidityNorm * (maxFog - minFog);

    const skyCold = new THREE.Color(0x90b8e8);
    const skyHot = new THREE.Color(0xffd9a8);
    const skyColor = skyCold.lerp(skyHot, tempNorm);
    (this.scene.fog as THREE.FogExp2).color = skyColor;
    this.renderer.setClearColor(skyColor, 1);
  }

  private createHUD() {
    this.hudCanvas = document.createElement('canvas');
    this.hudCanvas.width = 512;
    this.hudCanvas.height = 256;
    this.hudContext = this.hudCanvas.getContext('2d')!;
    this.hudTexture = new THREE.CanvasTexture(this.hudCanvas);
    this.hudTexture.minFilter = THREE.LinearFilter;
    this.hudTexture.magFilter = THREE.LinearFilter;

    this.hudMaterial = new THREE.MeshBasicMaterial({
      map: this.hudTexture,
      transparent: true,
      side: THREE.DoubleSide,
      depthTest: false,
      depthWrite: false
    });

    const planeGeo = new THREE.PlaneGeometry(3.2, 1.6);
    this.hudPlane = new THREE.Mesh(planeGeo, this.hudMaterial);

    this.hudPlane.position.set(0, 2.5, 4.5);
    this.scene.add(this.hudPlane);

    this.updateHUD();
  }

  private updateHUD() {
    const ctx = this.hudContext;
    const width = this.hudCanvas.width;
    const height = this.hudCanvas.height;

    ctx.clearRect(0, 0, width, height);

    // Background with rounded corners
    ctx.fillStyle = 'rgba(255, 255, 255, 0.75)';
    roundRect(ctx, 0, 0, width, height, 20);
    ctx.fill();

    ctx.fillStyle = '#003366';
    ctx.font = 'bold 38px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('🌤 Weather (Almería)', width / 2, 60);

    ctx.font = '36px system-ui, sans-serif';
    ctx.textAlign = 'left';

    ctx.fillText('🌡️ Temperature:', 40, 120);
    ctx.fillText(this.currentTemp.toFixed(1) + ' °C', 300, 120);

    ctx.fillText('💧 Humidity:', 40, 180);
    ctx.fillText(this.currentHumidity.toFixed(0) + ' %', 300, 180);

    this.hudTexture.needsUpdate = true;
  }

  private animate = (): void => {
    this.animationId = requestAnimationFrame(this.animate);
    const delta = this.clock.getDelta();
    const t = this.clock.getElapsedTime();

    const pulse = 1 + Math.sin(t * 1.6) * 0.06;
    (this.sun.material as THREE.MeshStandardMaterial).emissiveIntensity = 1.4 * pulse;
    this.sunLight.intensity = 1.2 * pulse;

    this.cloudGroup.children.forEach((cluster: any) => {
      cluster.position.x += cluster.userData.speed * delta * 10;
      if (cluster.position.x > 12) cluster.position.x = -12;
      if (cluster.position.x < -12) cluster.position.x = 12;
    });

    this.hudPlane.quaternion.copy(this.camera.quaternion);
    const cameraDir = new THREE.Vector3();
    this.camera.getWorldDirection(cameraDir);
    cameraDir.multiplyScalar(4.5);
    const cameraPos = this.camera.position.clone();
    this.hudPlane.position.copy(cameraPos).add(cameraDir);
    this.hudPlane.position.y = cameraPos.y + 2.5;

    this.controls.update();
    this.renderer.render(this.scene, this.camera);
  }
}

// Helper function for rounded rect on canvas
function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  if (w < 2 * r) r = w / 2;
  if (h < 2 * r) r = h / 2;
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}
