// Мастер-панель, роли, фракции, модерация заявок

async function populateMasterModal() {
  const doc = await db.collection('settings').doc('global').get();
  const data = doc.exists ? doc.data() : {};

  document.getElementById('masterTgChan').value = data.tgChannel || 'https://t.me/spectrum_smp';
  document.getElementById('masterTgChat').value = data.tgChat || 'https://t.me/spectrum_private';
  document.getElementById('masterDiscord').value = data.discord || 'https://discord.gg/spectrum';
  document.getElementById('masterModpack').value = data.modpack || 'https://drive.google.com';
  document.getElementById('masterFactionApply').value = data.factionApply || 'https://t.me/spectrum_smp';
  document.getElementById('masterModListText').value = data.modListText || '• Create v0.5.1 — Инженерия\n• Farmer\'s Delight — Кулинария';
  document.getElementById('masterServerLore').value = data.serverLore || 'Много веков назад мир существовал в привычной гармонии...';
  document.getElementById('masterGuideDesc').value = data.guideDesc || 'Следуйте простой пошаговой инструкции...';

  const isOwner = currentUser && currentUser.email === OWNER_EMAIL;
  const adminRolesSec = document.getElementById('masterAdminRolesSection');

  if (isOwner) {
    adminRolesSec.style.display = 'block';
    const usersSnap = await db.collection('users').get();
    const rTable = document.getElementById('masterAdminRolesList');
    let rHtml = '';

    usersSnap.forEach(uDoc => {
      const u = uDoc.data();
      if (u.email !== OWNER_EMAIL) {
        rHtml += `
          <tr>
            <td><b>${u.nick}</b></td>
            <td>${u.email}</td>
            <td><span style="color:var(--accent-gold); font-weight:bold;">${u.role || 'player'}</span></td>
            <td>
              <div style="display:flex; gap:0.5rem;">
                <select id="roleSelect_${u.email.replace(/[@.]/g, '_')}" class="form-control" style="padding:0.3rem; font-size:0.8rem;">
                  <option value="player" ${(!u.role || u.role === 'player') ? 'selected' : ''}>Игрок / Резидент</option>
                  <option value="admin" ${u.role === 'admin' ? 'selected' : ''}>🛡️ Модератор (Анкеты & Биографии)</option>
                  <option value="tech_admin" ${u.role === 'tech_admin' ? 'selected' : ''}>🛠️ Тех. Админ (Контент & Новости)</option>
                  <option value="deputy" ${u.role === 'deputy' ? 'selected' : ''}>👑 Зам. Владельца (Полный доступ)</option>
                </select>
                <button class="btn btn-gold" style="padding:0.3rem 0.6rem; font-size:0.75rem;" onclick="saveUserRole('${u.email}', 'roleSelect_${u.email.replace(/[@.]/g, '_')}')">Сохранить</button>
              </div>
            </td>
          </tr>
        `;
      }
    });
    rTable.innerHTML = rHtml;
  } else {
    adminRolesSec.style.display = 'none';
  }

  const usersSnap = await db.collection('users').get();
  const fTable = document.getElementById('masterPlayerFactionsList');
  let fHtml = '';
  usersSnap.forEach(uDoc => {
    const u = uDoc.data();
    fHtml += `
      <tr>
        <td><b>${u.nick}</b></td>
        <td>${u.email}</td>
        <td><span style="color:var(--accent-pink);">${u.faction || 'Резидент'}</span></td>
        <td>
          <div style="display:flex; gap:0.5rem;">
            <input type="text" id="factionInput_${u.email.replace(/[@.]/g, '_')}" class="form-control" style="padding:0.3rem; font-size:0.8rem;" placeholder="Напр. Фракция: Инженеры" value="${u.faction || 'Резидент'}">
            <button class="btn btn-gold" style="padding:0.3rem 0.6rem; font-size:0.75rem;" onclick="saveUserFaction('${u.email}', 'factionInput_${u.email.replace(/[@.]/g, '_')}')">Сохранить</button>
          </div>
        </td>
      </tr>
    `;
  });
  fTable.innerHTML = fHtml;
}

async function saveUserRole(email, selectId) {
  const newRole = document.getElementById(selectId).value;
  try {
    await db.collection('users').doc(email).update({ role: newRole });
    showToast('Административная роль пользователя обновлена!');
    populateMasterModal();
  } catch (err) {
    showToast('Ошибка сохранения роли: ' + err.message);
  }
}

async function saveUserFaction(email, inputId) {
  const val = document.getElementById(inputId).value.trim();
  try {
    await db.collection('users').doc(email).update({ faction: val });
    showToast('Фракция/Статус игрока обновлен!');
    loadCommunityPlayers();
    if (currentUser && currentUser.email === email) {
      currentUser.faction = val;
      localStorage.setItem('spectrum_cloud_user', JSON.stringify(currentUser));
      setupCabinetView();
    }
  } catch (err) {
    showToast('Ошибка сохранения: ' + err.message);
  }
}

async function saveMasterSettings(e) {
  e.preventDefault();
  try {
    await db.collection('settings').doc('global').set({
      tgChannel: document.getElementById('masterTgChan').value,
      tgChat: document.getElementById('masterTgChat').value,
      discord: document.getElementById('masterDiscord').value,
      modpack: document.getElementById('masterModpack').value,
      factionApply: document.getElementById('masterFactionApply').value,
      modListText: document.getElementById('masterModListText').value,
      serverLore: document.getElementById('masterServerLore').value,
      guideDesc: document.getElementById('masterGuideDesc').value,
      donateGoal: parseInt(document.getElementById('masterDonGoal').value) || 0,
      donateCurrent: parseInt(document.getElementById('masterDonCurrent').value) || 0,
      donateDate: document.getElementById('masterDonDate').value
    }, { merge: true });
    closeModal('masterAdminModal');
    showToast('Настройки проекта обновлены!');
    loadGlobalSettings();
  } catch (err) {
    showToast('Ошибка сохранения: ' + err.message);
  }
}

async function loadAdminData() {
  const snapshot = await db.collection('applications').get();
  let html = '';

  if (snapshot.empty) {
    html = `<tr><td colspan="7" style="text-align:center;">Заявок пока нет</td></tr>`;
  } else {
    snapshot.forEach(doc => {
      const app = doc.data();
      const isApproved = app.status === 'approved';
      html += `
        <tr>
          <td><b>${app.nick}</b></td>
          <td>${app.email}</td>
          <td>${app.age}</td>
          <td>${app.rpExp || 'Н/У'}</td>
          <td style="max-width:250px; font-size:0.85rem;">${app.about}</td>
          <td>${isApproved ? '<span style="color:var(--accent-emerald)">Одобрено</span>' : '<span style="color:var(--accent-gold)">На проверке</span>'}</td>
          <td>
            ${!isApproved ? `<button class="btn btn-primary" style="padding:0.3rem 0.5rem; font-size:0.75rem;" onclick="approveApp('${app.email}')">Одобрить</button>` : ''}
            <button class="btn btn-danger" style="padding:0.3rem 0.5rem; font-size:0.75rem;" onclick="banUser('${app.email}')">Бан</button>
          </td>
        </tr>
      `;
    });
  }
  document.getElementById('adminAppsList').innerHTML = html;
}

async function approveApp(email) {
  await db.collection('applications').doc(email).update({ status: 'approved' });
  showToast('Анкета одобрена!');
  loadAdminData();
}

async function banUser(email) {
  if (confirm('Заблокировать игрока?')) {
    await db.collection('users').doc(email).update({ banned: true });
    await db.collection('applications').doc(email).delete();
    showToast('Игрок заблокирован!');
    loadAdminData();
  }
}
