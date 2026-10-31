
(function () {
  window.buildBeautifulHouse = function (scene, THREE, x = 0, z = 0) {
    const home = new THREE.Group();
    home.position.set(x, 0, z);
    scene.add(home);

    const material = color => new THREE.MeshStandardMaterial({
      color,
      roughness: 0.75
    });

    const wood = material(0x754322);
    const cream = material(0xf0dfc2);
    const white = material(0xf5f2eb);
    const navy = material(0x182c55);
    const green = material(0x27734b);
    const gold = material(0xc99b45);
    const black = material(0x252525);
    const marble = material(0xd5d2ca);

    const glass = new THREE.MeshStandardMaterial({
      color: 0x82c9ed,
      transparent: true,
      opacity: 0.4
    });

    function furniture(name, x, y, z, w, h, d, mat) {
      const object = new THREE.Mesh(
        new THREE.BoxGeometry(w, h, d),
        mat
      );
      object.name = name;
      object.position.set(x, y, z);
      object.castShadow = true;
      object.receiveShadow = true;
      home.add(object);
      return object;
    }

    function round(name, x, y, z, radius, height, mat) {
      const object = new THREE.Mesh(
        new THREE.CylinderGeometry(radius, radius, height, 24),
        mat
      );
      object.name = name;
      object.position.set(x, y, z);
      object.castShadow = true;
      home.add(object);
      return object;
    }

    // Main tiled floor
    furniture("Interior floor", 0, -0.12, 0, 18, 0.2, 16, cream);

    // Living room rug
    furniture("Luxury rug", -4, 0.015, 3, 6, 0.04, 4, navy);

    // Large sofa
    furniture("Sofa seat", -4, 0.55, 1, 4.2, 0.7, 1.3, navy);
    furniture("Sofa back", -4, 1.15, 0.42, 4.2, 1.2, 0.35, navy);
    furniture("Sofa arm left", -6.1, 0.9, 1, 0.35, 1, 1.3, navy);
    furniture("Sofa arm right", -1.9, 0.9, 1, 0.35, 1, 1.3, navy);

    for (let i = 0; i < 3; i++) {
      furniture("Sofa cushion", -5.25 + i * 1.25,
        0.94, 1, 1.1, 0.18, 0.95, cream);
    }

    // Centre table
    furniture("Coffee table", -4, 0.7, 4, 2.5, 0.15, 1.2, wood);
    for (const a of [-1, 1]) {
      for (const b of [-1, 1]) {
        furniture("Coffee table leg",
          -4 + a, 0.32, 4 + b * 0.4,
          0.12, 0.65, 0.12, gold);
      }
    }

    // TV and entertainment unit
    furniture("TV cabinet", -4, 0.45, 7, 4, 0.7, 0.7, wood);
    furniture("Big television", -4, 1.7, 7, 3.4, 1.9, 0.15, black);
    furniture("TV display", -4, 1.7, 6.91, 3.15, 1.65, 0.025,
      material(0x102b48));

    // Decorative plant
    round("Plant pot", -7, 0.35, 6, 0.4, 0.7, wood);
    round("Plant leaves", -7, 1.15, 6, 0.65, 1.2, green);

    // Kitchen cabinets and counter
    furniture("Kitchen counter", 4, 1, 5, 5, 1, 1, white);
    furniture("Kitchen marble top", 4, 1.55, 5, 5.2, 0.12, 1.2, marble);

    for (let i = 0; i < 4; i++) {
      furniture("Kitchen cupboard", 2.1 + i * 1.25,
        0.65, 4.45, 1.05, 0.7, 0.12, wood);
    }

    // Fridge
    furniture("Refrigerator", 7, 1.4, 2, 1.2, 2.8, 1.2, white);
    furniture("Fridge handle", 6.5, 1.5, 1.38,
      0.07, 0.8, 0.07, black);

    // Cooker
    furniture("Cooker", 2, 0.7, 2, 1.3, 1.2, 1, white);
    furniture("Cooker surface", 2, 1.34, 2, 1.3, 0.08, 1, black);

    for (let i = 0; i < 4; i++) {
      round("Cooker burner",
        1.65 + (i % 2) * 0.7,
        1.4,
        1.7 + Math.floor(i / 2) * 0.55,
        0.16, 0.05, black);
    }

    // Dining area
    furniture("Dining table", 4, 0.9, 0, 3, 0.18, 1.5, wood);

    for (let i = 0; i < 4; i++) {
      const cx = 2.4 + (i % 2) * 3;
      const cz = i < 2 ? -1 : 1;
      furniture("Dining chair", cx, 0.5, cz,
        0.7, 0.9, 0.7, green);
      furniture("Chair back", cx, 1, cz - 0.25,
        0.7, 0.9, 0.15, green);
    }

    // Bedroom carpet and bed
    furniture("Bedroom carpet", 4, 0.02, -5, 5, 0.04, 4, navy);
    furniture("Bed frame", 4, 0.4, -5, 3.5, 0.6, 4, wood);
    furniture("Mattress", 4, 0.8, -5, 3.3, 0.3, 3.8, white);
    furniture("Bed blanket", 4, 1, -4.5, 3.2, 0.12, 1.7, navy);
    furniture("Pillow left", 3, 1, -6.4, 1.2, 0.2, 0.8, white);
    furniture("Pillow right", 5, 1, -6.4, 1.2, 0.2, 0.8, white);

    // Wardrobe
    furniture("Wardrobe", 7.5, 1.5, -7, 2, 3, 1.2, wood);
    furniture("Wardrobe doors", 7.5, 1.5, -6.35,
      1.8, 2.8, 0.08, cream);
    furniture("Wardrobe handle", 7.5, 1.5, -6.27,
      0.08, 0.6, 0.08, gold);

    // Bedside table and lamp
    furniture("Bedside cabinet", 1.5, 0.55, -6.5,
      1, 1, 0.9, wood);
    round("Bedside lamp", 1.5, 1.35, -6.5,
      0.2, 0.5, gold);

    // Bathroom floor
    furniture("Bathroom tiles", -5, 0.03, -5, 5, 0.08, 4, marble);

    // Bathroom sink
    furniture("Bathroom sink cabinet", -6.5, 0.7, -5,
      1.2, 0.8, 0.8, wood);
    furniture("Bathroom basin", -6.5, 1.15, -5,
      1.3, 0.18, 0.9, white);
    furniture("Bathroom mirror", -6.5, 2, -5.5,
      1.2, 1.3, 0.08, glass);

    // Toilet
    round("Toilet base", -4, 0.35, -5, 0.42, 0.6, white);
    furniture("Toilet tank", -4, 0.8, -5.4,
      0.8, 0.9, 0.4, white);

    // Shower
    furniture("Shower tray", -4, 0.12, -7,
      1.5, 0.2, 1.5, white);
    furniture("Shower glass", -4.7, 1.2, -7,
      0.06, 2.2, 1.5, glass);
    round("Shower head", -4, 2.2, -7, 0.13, 0.08, gold);

    // Windows
    furniture("Living room window", -8.9, 2, 2,
      0.08, 1.8, 2.5, glass);
    furniture("Bedroom window", 8.9, 2, -5,
      0.08, 1.8, 2.5, glass);

    // Curtains
    furniture("Left curtain", -8.8, 2, 0.8,
      0.18, 2.2, 0.5, navy);
    furniture("Right curtain", -8.8, 2, 3.2,
      0.18, 2.2, 0.5, navy);

    // Ceiling lighting
    for (const p of [[-4, 3.2, 3], [4, 3.2, 3], [4, 3.2, -5]]) {
      const light = new THREE.PointLight(0xffdfaa, 1.5, 10);
      light.position.set(p[0], p[1], p[2]);
      home.add(light);

      round("Ceiling lamp", p[0], 3, p[2], 0.25, 0.08, gold);
    }

    return home;
  };
})();
