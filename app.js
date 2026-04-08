const container = document.getElementById('canvas-container');
const scene = new THREE.Scene();
scene.background = new THREE.Color('#F4F3F0');
const camera = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight, 0.1, 1000);
camera.position.set(0, 18, 30);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(container.clientWidth, container.clientHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
container.appendChild(renderer.domElement);
const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
scene.add(ambientLight);
const directionalLight = new THREE.DirectionalLight(0xffffff, 0.7);
directionalLight.position.set(10, 20, 10);
directionalLight.castShadow = true;
scene.add(directionalLight);
const controls = new THREE.OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.enablePan = false;
controls.minDistance = 15;
controls.maxDistance = 40;
controls.maxPolarAngle = Math.PI / 2 + 0.1;
const cakeGroup = new THREE.Group();
scene.add(cakeGroup);
const plateGeo = new THREE.CylinderGeometry(7, 7.5, 0.5, 64);
const plateMat = new THREE.MeshStandardMaterial({ color: '#ffffff', roughness: 0.1 });
const plate = new THREE.Mesh(plateGeo, plateMat);
plate.position.y = -0.25;
plate.receiveShadow = true;
cakeGroup.add(plate);
const tiers = [];
let decorationMeshes = [];
const flavorColors = { vanilla: '#FDF5E6', chocolate: '#4A2511', redvelvet: '#8B0000' };
function getMaterialProps(finishType, colorHex) {
    if (finishType === 'metallic') return { color: '#D4AF37', roughness: 0.2, metalness: 0.8 };
    if (finishType === 'textured') return { color: colorHex, roughness: 0.9, metalness: 0.0 };
    return { color: colorHex, roughness: 0.4, metalness: 0.0 };
}
const baseTier = new THREE.Mesh(new THREE.CylinderGeometry(5, 5, 4, 64), new THREE.MeshStandardMaterial());
baseTier.position.y = 2;
baseTier.castShadow = true; baseTier.receiveShadow = true;
cakeGroup.add(baseTier);
tiers.push(baseTier);
const midTier = new THREE.Mesh(new THREE.CylinderGeometry(3.5, 3.5, 3.5, 64), new THREE.MeshStandardMaterial());
midTier.position.y = 5.75;
midTier.castShadow = true; midTier.receiveShadow = true;
tiers.push(midTier);
const topTier = new THREE.Mesh(new THREE.CylinderGeometry(2.5, 2.5, 3, 64), new THREE.MeshStandardMaterial());
topTier.position.y = 9;
topTier.castShadow = true; topTier.receiveShadow = true;
tiers.push(topTier);
function clearDecorations() {
    decorationMeshes.forEach(mesh => cakeGroup.remove(mesh));
    decorationMeshes = [];
}
function createCreamPiping(radius, yPos, type, colorHex) {
    let mat = new THREE.MeshStandardMaterial({ color: colorHex, roughness: 0.6 });
    let geo;
    if (type === 'pearl') {
        geo = new THREE.TorusGeometry(radius + 0.1, 0.25, 16, 64);
    } else if (type === 'rosette') {
        geo = new THREE.TorusGeometry(radius + 0.2, 0.4, 8, 32); // Bumpy texture
    }
    const mesh = new THREE.Mesh(geo, mat);
    mesh.rotation.x = Math.PI / 2;
    mesh.position.y = yPos;
    mesh.castShadow = true;
    return mesh;
}
function createToppings(type, radius, yPos) {
    const group = new THREE.Group();
    const count = type === 'berries' ? 12 : 8;
    for (let i = 0; i < count; i++) {
        const angle = (i / count) * Math.PI * 2;
        let mesh;
        if (type === 'berries') {
            const mat = new THREE.MeshStandardMaterial({ color: '#8B0000', roughness: 0.2 });
            mesh = new THREE.Mesh(new THREE.SphereGeometry(0.3, 16, 16), mat);
        } else {
            const colors = ['#FFD1DC', '#FDFD96', '#C1E1C1', '#B4A7E5'];
            const mat = new THREE.MeshStandardMaterial({ color: colors[i % 4], roughness: 0.7 });
            mesh = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.4, 0.3, 32), mat);
            mesh.rotation.x = Math.PI / 2;
            mesh.rotation.z = angle;
        }
        mesh.position.x = Math.cos(angle) * (radius - 0.6);
        mesh.position.z = Math.sin(angle) * (radius - 0.6);
        mesh.position.y = yPos + 0.2;
        mesh.castShadow = true;
        group.add(mesh);
    }
    return group;
}
const uiControls = ['flavor', 'finish', 'cream-design', 'toppings'].map(id => document.getElementById(id));
const midTierCheck = document.getElementById('tier-mid');
const topTierCheck = document.getElementById('tier-top');
const totalCostDisplay = document.getElementById('total-cost');
function updateCakeAndBill() {
    const flavor = document.getElementById('flavor').value;
    const finish = document.getElementById('finish').value;
    const cream = document.getElementById('cream-design').value;
    const topping = document.getElementById('toppings').value;
    const baseColor = flavorColors[flavor];
    const props = getMaterialProps(finish, baseColor);
    tiers.forEach(tier => {
        tier.material.color.set(props.color);
        tier.material.roughness = props.roughness;
        tier.material.metalness = props.metalness;
    });
    midTierCheck.checked ? cakeGroup.add(midTier) : cakeGroup.remove(midTier);
    topTierCheck.checked ? cakeGroup.add(topTier) : cakeGroup.remove(topTier);
    clearDecorations();
    if (cream !== 'none') {
        const creamColor = (finish === 'metallic') ? '#FFFFFF' : baseColor; 
        let mesh1 = createCreamPiping(5, 0.2, cream, creamColor);
        cakeGroup.add(mesh1);
        decorationMeshes.push(mesh1);
        if (midTierCheck.checked) {
            let mesh2 = createCreamPiping(3.5, 4, cream, creamColor);
            cakeGroup.add(mesh2);
            decorationMeshes.push(mesh2);
        }
        if (topTierCheck.checked) {
            let mesh3 = createCreamPiping(2.5, 7.5, cream, creamColor);
            cakeGroup.add(mesh3);
            decorationMeshes.push(mesh3);
        }
    }
    if (topping !== 'none') {
        let activeRadius = 5, activeHeight = 4;
        if (topTierCheck.checked) { activeRadius = 2.5; activeHeight = 10.5; }
        else if (midTierCheck.checked) { activeRadius = 3.5; activeHeight = 7.5; }
        let topGroup = createToppings(topping, activeRadius, activeHeight);
        cakeGroup.add(topGroup);
        decorationMeshes.push(topGroup);
    }
    let total = 1500; // Base Price
    uiControls.forEach(ctrl => { total += parseInt(ctrl.options[ctrl.selectedIndex].dataset.price); });
    if (midTierCheck.checked) total += parseInt(midTierCheck.value);
    if (topTierCheck.checked) total += parseInt(topTierCheck.value);
    totalCostDisplay.innerText = `₹${total}`;
}
[...uiControls, midTierCheck, topTierCheck].forEach(el => el.addEventListener('change', updateCakeAndBill));
window.addEventListener('resize', () => {
    camera.aspect = container.clientWidth / container.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(container.clientWidth, container.clientHeight);
});
function animate() {
    requestAnimationFrame(animate);
    cakeGroup.rotation.y += 0.002;
    controls.update();
    renderer.render(scene, camera);
}
const bookingForm = document.getElementById('booking-form');
const paymentModal = document.getElementById('payment-modal');
const paymentStatus = document.getElementById('payment-status');
const paymentTitle = document.getElementById('payment-title');
const spinner = document.getElementById('spinner');
const closeModalBtn = document.getElementById('close-modal');
bookingForm.addEventListener('submit', (e) => {
    e.preventDefault(); 
    paymentModal.style.display = 'flex';
    paymentTitle.innerText = 'Processing Payment';
    paymentStatus.innerText = `Connecting to secure gateway for ₹${totalCostDisplay.innerText.substring(1)}...`;
    paymentStatus.style.color = 'var(--text-light)';
    spinner.style.display = 'block';
    closeModalBtn.style.display = 'none';
    setTimeout(() => {
        spinner.style.display = 'none';
        closeModalBtn.style.display = 'inline-block';
        if (navigator.onLine) {
            paymentTitle.innerText = 'Order Confirmed!';
            paymentStatus.innerText = 'Payment successful. Your bespoke masterpiece is officially booked!';
            paymentStatus.style.color = '#2e7d32';
        } else {
            paymentTitle.innerText = 'Transaction Failed';
            paymentStatus.innerText = 'No internet connection detected. Please check your network and try again.';
            paymentStatus.style.color = '#c62828'; 
        }
    }, 2500); 
});
closeModalBtn.addEventListener('click', () => {
    paymentModal.style.display = 'none';
    if (navigator.onLine) bookingForm.reset();
});
updateCakeAndBill();
animate();