// Сообщество: биографии игроков, список игроков, публичный профиль

async function loadPublicBiographies() {
  const container = document.getElementById('publicPlayerBiographies');
  if (!container) return;

  try {
    const snapshot = await db.collection('biographies').get();
    if (snapshot.empty) {
      container.innerHTML = `<p style="color:var(--text-muted);">Пока никто не опубликовал биографию. Будьте первым из Профиля!</p>`;
      return;
    }

    let html = '';
    const isStaff = currentUser && (currentUser.email === OWNER_EMAIL || currentUser.role === 'deputy' || currentUser.role === 'tech_admin' || currentUser.role === 'admin');

    snapshot.forEach(doc => {
      const bio = doc.data();
      const isOwn = currentUser && currentUser.email === bio.authorEmail;

      html += `
        <div style="background:rgba(6, 4, 13, 0.7); border-left:4px solid var(--accent-purple); padding:1.2rem; border-radius:0 16px 16px 0; position:relative;">
          <h4 style="color:var(--accent-light); font-size:1.1rem;">${bio.charName} <span style="font-size:0.8rem; color:var(--accent-pink);">(${bio.charRole})</span></h4>
          <p style="font-size:0.82rem; color:var(--text-muted); margin-bottom:0.5rem;">Автор: <b>${bio.authorNick}</b></p>
          <div style="font-size:0.95rem; color:var(--text-main); line-height:1.6;">${bio.bioText}</div>
          ${(isOwn || isStaff) ? `<button class="btn btn-danger" style="padding:0.2rem 0.5rem; font-size:0.7rem; position:absolute; top:1rem; right:1rem;" onclick="deleteBio('${doc.id}')">Удалить</button>` : ''}
        </div>
      `;
    });
    container.innerHTML = html;
  } catch (err) {
    console.log('Error loading bios:', err);
  }
}

async function loadCommunityPlayers() {
  const tbody = document.getElementById('communityPlayersTableList');
  if (!tbody) return;

  try {
    const snapshot = await db.collection('users').get();
    if (snapshot.empty) {
      tbody.innerHTML = `<tr><td colspan="4" style="text-align:center;">Игроков не найдено</td></tr>`;
      return;
    }

    let html = '';
    snapshot.forEach(doc => {
      const u = doc.data();
      const avatarUrl = getUserAvatarUrl(u);
      const isOwner = u.email === OWNER_EMAIL;

      let roleDisplay = 'Игрок';
      if (isOwner) roleDisplay = 'Владелец';
      else if (u.role === 'deputy') roleDisplay = 'Зам. Владельца';
      else if (u.role === 'tech_admin') roleDisplay = 'Тех. Админ';
      else if (u.role === 'admin') roleDisplay = 'Администратор';

      const faction = u.faction || 'Резидент';

      html += `
        <tr onclick="openPublicProfile('${u.email}')">
          <td>
            <div class="player-row-user">
              <img src="${avatarUrl}" class="player-row-avatar" alt="Ava">
              <b style="color:#fff;">${u.nick}</b>
            </div>
          </td>
          <td><span style="color:var(--accent-pink); font-weight:800;">${faction}</span></td>
          <td><span style="color:var(--accent-light); font-size:0.85rem; font-weight:700;">${roleDisplay}</span></td>
          <td><span style="color:var(--text-muted); font-size:0.85rem;">Опубликовано квент</span></td>
        </tr>
      `;
    });
    tbody.innerHTML = html;
  } catch (err) {
    console.log('Error loading community players:', err);
  }
}

async function openPublicProfile(email) {
  try {
    const doc = await db.collection('users').doc(email).get();
    if (!doc.exists) return;
    const u = doc.data();

    document.getElementById('pubProfNick').innerText = u.nick;
    document.getElementById('pubProfAvatar').src = getUserAvatarUrl(u);
    document.getElementById('pubProfFaction').innerText = u.faction || 'Резидент';
    document.getElementById('pubProfSkin').src = `https://mc-heads.net/body/${u.skinNick || u.nick}`;

    openModal('publicProfileModal');
  } catch (err) {
    showToast('Ошибка загрузки профиля: ' + err.message);
  }
}