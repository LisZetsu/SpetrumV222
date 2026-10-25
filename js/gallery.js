// Логика галереи и лайтбокса
let currentGalleryImages = [];
let currentImageIndex = 0;

async function loadGallery() {
  const container = document.getElementById('mainGalleryGrid');
  if (!container) return;

  try {
    const snapshot = await db.collection('gallery').orderBy('createdAt', 'desc').get();
    if (snapshot.empty) {
      container.innerHTML = `<p style="color:var(--text-muted); grid-column: 1 / -1; text-align:center;">Галерея пока пуста.</p>`;
      return;
    }

    const isMaster = currentUser && (currentUser.email === OWNER_EMAIL || currentUser.role === 'deputy' || currentUser.role === 'tech_admin');
    let html = '';
    
    // Ограничиваем превью до 3 картинок
    let count = 0;
    currentGalleryImages = []; 

    snapshot.forEach(doc => {
      const data = doc.data();
      currentGalleryImages.push({ id: doc.id, url: data.url });

      if (count < 3) {
        html += `
          <div class="gallery-item" onclick="openLightbox(${count})" style="position:relative; cursor:pointer;">
            <img src="${data.url}" alt="Gallery Image">
            ${isMaster ? `<button class="btn btn-danger" style="position:absolute; top:0.5rem; right:0.5rem; padding:0.2rem 0.5rem; font-size:0.7rem;" onclick="event.stopPropagation(); deleteGalleryImage('${doc.id}')">X</button>` : ''}
          </div>
        `;
      }
      count++;
    });

    if (count > 3) {
      html += `
        <div class="gallery-item gallery-large" onclick="openLightbox(3)" style="position:relative; cursor:pointer; display:flex; align-items:center; justify-content:center; background:linear-gradient(135deg, rgba(168,85,247,0.2), rgba(10,7,20,0.9));">
          <h2 style="font-family:var(--font-title); color:#fff; font-size:2rem;">Смотреть все фото (+${count - 3}) →</h2>
        </div>
      `;
    }

    container.innerHTML = html;
  } catch(err) {
    console.log('Error loading gallery:', err);
  }
}

function openLightbox(index) {
  currentImageIndex = index;
  updateLightbox();
  document.getElementById('lightboxModal').classList.add('active');
}

function closeLightbox() {
  document.getElementById('lightboxModal').classList.remove('active');
}

function changeLightbox(direction) {
  currentImageIndex += direction;
  if (currentImageIndex < 0) currentImageIndex = currentGalleryImages.length - 1;
  if (currentImageIndex >= currentGalleryImages.length) currentImageIndex = 0;
  updateLightbox();
}

function updateLightbox() {
  const img = document.getElementById('lightboxImg');
  if (img && currentGalleryImages[currentImageIndex]) {
    img.src = currentGalleryImages[currentImageIndex].url;
  }
}

async function handleGalleryUpload(e) {
  e.preventDefault();
  const url = document.getElementById('galleryUrlInput').value.trim();
  if(!url) return;

  try {
    await db.collection('gallery').add({
      url: url,
      createdAt: new Date().toISOString()
    });
    closeModal('addGalleryModal');
    showToast('Фото добавлено в галерею!');
    loadGallery();
  } catch(err) {
    showToast('Ошибка: ' + err.message);
  }
}

async function deleteGalleryImage(id) {
  if(!confirm('Удалить это фото из галереи?')) return;
  try {
    await db.collection('gallery').doc(id).delete();
    showToast('Фото удалено');
    loadGallery();
  } catch(err) {
    showToast('Ошибка удаления: ' + err.message);
  }
}