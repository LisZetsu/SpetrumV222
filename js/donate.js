// Логика донат-бара
// Логика донат-бара
async function loadDonateSettings() {
  try {
    const doc = await db.collection('settings').doc('global').get();
    if (doc.exists) {
      const data = doc.data();
      
      // Безопасное получение чисел (даже если Firebase отдал их в формате int64)
      const goal = Number(data.donateGoal) || 50000;
      const current = Number(data.donateCurrent) || 0;
      const date = data.donateDate || '31.12.2026';
      
      const percent = Math.min((current / goal) * 100, 100);
      
      const circle = document.getElementById('donateCircle');
      if (circle) {
        circle.style.background = `conic-gradient(var(--accent-emerald) ${percent}%, rgba(255,255,255,0.1) ${percent}%)`;
        circle.innerHTML = `<div class="donate-inner">${Math.round(percent)}%</div>`;
      }
      
      if(document.getElementById('donateTextCurrent')) document.getElementById('donateTextCurrent').innerText = current.toLocaleString('ru-RU') + ' ₽';
      if(document.getElementById('donateTextGoal')) document.getElementById('donateTextGoal').innerText = goal.toLocaleString('ru-RU') + ' ₽';
      if(document.getElementById('donateTextDate')) document.getElementById('donateTextDate').innerText = date;
    }
  } catch(err) {
    console.log('Error loading donate settings:', err);
  }
}

// Загрузка благодарностей
async function loadDonations() {
  const container = document.getElementById('donateListContainer');
  if (!container) return;

  try {
    const snapshot = await db.collection('donations').orderBy('createdAt', 'desc').get();
    if (snapshot.empty) {
      container.innerHTML = `<p style="color:var(--text-muted);">Пока никто не донатил. Будьте первым!</p>`;
      return;
    }

    const isMaster = currentUser && (currentUser.email === OWNER_EMAIL || currentUser.role === 'deputy' || currentUser.role === 'tech_admin');
    let html = '';

    snapshot.forEach(doc => {
      const d = doc.data();
      html += `
        <div style="background:rgba(6,4,13,0.7); border-left:4px solid var(--accent-emerald); padding:1rem; border-radius:0 16px 16px 0; margin-bottom:0.8rem; display:flex; justify-content:space-between; align-items:center;">
          <div>
            <b style="color:var(--accent-emerald); font-size:1.1rem;">${d.nick}</b> <span style="color:var(--text-main); font-weight:800;">(${d.amount} ₽)</span>
            <p style="color:var(--text-muted); font-size:0.9rem; margin-top:0.2rem;">${d.message}</p>
          </div>
          ${isMaster ? `<button class="btn btn-danger" style="padding:0.2rem 0.5rem; font-size:0.7rem;" onclick="deleteDonation('${doc.id}')">Удалить</button>` : ''}
        </div>
      `;
    });
    container.innerHTML = html;
  } catch(err) {
    console.log('Error loading donations:', err);
  }
}

async function handleAddDonation(e) {
  e.preventDefault();
  const nick = document.getElementById('donNick').value.trim();
  const amount = parseInt(document.getElementById('donAmount').value);
  const message = document.getElementById('donMsg').value.trim();

  try {
    await db.collection('donations').add({
      nick, amount, message,
      createdAt: new Date().toISOString()
    });
    closeModal('addDonationModal');
    showToast('Благодарность добавлена!');
    loadDonations();
  } catch(err) {
    showToast('Ошибка: ' + err.message);
  }
}

async function deleteDonation(id) {
  if(!confirm('Удалить эту запись?')) return;
  try {
    await db.collection('donations').doc(id).delete();
    showToast('Запись удалена');
    loadDonations();
  } catch(err) {
    showToast('Ошибка удаления: ' + err.message);
  }
}

async function saveDonateSettings(e) {
  e.preventDefault();
  const goal = parseInt(document.getElementById('masterDonGoal').value);
  const current = parseInt(document.getElementById('masterDonCurrent').value);
  const date = document.getElementById('masterDonDate').value;

  try {
    await db.collection('settings').doc('global').set({
      donateGoal: goal, donateCurrent: current, donateDate: date
    }, { merge: true });
    closeModal('masterAdminModal');
    showToast('Настройки доната обновлены!');
    loadDonateSettings();
  } catch(err) {
    showToast('Ошибка сохранения: ' + err.message);
  }
}
