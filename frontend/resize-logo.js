const sharp = require('sharp');
sharp('public/logo.png').resize(192, 192).toFile('public/logo-192.png', () => console.log('192 done'));
sharp('public/logo.png').resize(512, 512).toFile('public/logo-512.png', () => console.log('512 done'));