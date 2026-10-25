// Кабинет: профиль, аватар, скин, биографии, удаление аккаунта

async function handleBioSubmit(e) {
  e.preventDefault();
  if (!currentUser) return;

  const charName = document.getElementById('bioCharName').value.trim();
  const charRole = document.getElementById('bioCharRole').value.trim();
  const bioText = document.getElementById('bioText').value.trim();

  try {
    await db.collection('biographies').add({
      authorNick: currentUser.nick,
      authorEmail: currentUser.email,
      charName, charRole, bioText,
      createdAt: new Date().toISOString()
    });
    closeModal('bioModal');
    showToast('RP-биография опубликована!');
    loadPublicBiographies();
    setupCabinetView();
  } catch (err) {
    showToast('Ошибка сохранения биографии: ' + err.message);
  }
}

async function deleteBio(bioId) {
  if (!confirm('Вы уверены, что хотите удалить эту биографию?')) return;
  try {
    await db.collection('biographies').doc(bioId).delete();
    showToast('Биография удалена!');
    loadPublicBiographies();
    setupCabinetView();
  } catch (err) {
    showToast('Ошибка удаления: ' + err.message);
  }
}

async function deleteAccount() {
  if (!confirm('ВНИМАНИЕ! Это навсегда удалит ваш аккаунт. Продолжить?')) return;
  try {
    await db.collection('users').doc(currentUser.email).delete();
    await db.collection('applications').doc(currentUser.email).delete();
    showToast('Аккаунт успешно удален');
    logout();
  } catch (err) {
    showToast('Ошибка при удалении: ' + err.message);
  }
}

function handleAvatarUpload(e) {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = async function(evt) {
    const base64Img = evt.target.result;
    currentUser.avatar = base64Img;
    localStorage.setItem('spectrum_cloud_user', JSON.stringify(currentUser));

    try {
      await db.collection('users').doc(currentUser.email).update({ avatar: base64Img });
      showToast('Фотография профиля обновлена!');
      checkUserState();
      setupCabinetView();
    } catch (err) {
      showToast('Ошибка сохранения аватара: ' + err.message);
    }
  };
  reader.readAsDataURL(file);
}

async function updateSkinNick() {
  const val = document.getElementById('cabSkinNickInput').value.trim();
  if (!val) return;

  currentUser.skinNick = val;
  localStorage.setItem('spectrum_cloud_user', JSON.stringify(currentUser));

  try {
    await db.collection('users').doc(currentUser.email).update({ skinNick: val });
    document.getElementById('cabSkinImg').src = `https://mc-heads.net/body/${val}`;
    showToast('Скин профиля обновлен!');
  } catch (err) {
    showToast('Ошибка обновления скина: ' + err.message);
  }
}

async function setupCabinetView() {
  const guestNotice = document.getElementById('cabinetGuestNotice');
  const userBody = document.getElementById('cabinetUserBody');

  if (!currentUser) {
    guestNotice.style.display = 'block';
    userBody.style.display = 'none';
    return;
  }
  guestNotice.style.display = 'none';
  userBody.style.display = 'grid';

  const dbUserDoc = await db.collection('users').doc(currentUser.email).get();
  if (dbUserDoc.exists) {
    currentUser = dbUserDoc.data();
    localStorage.setItem('spectrum_cloud_user', JSON.stringify(currentUser));
  }

  document.getElementById('cabNickText').innerText = currentUser.nick;
  document.getElementById('cabInputNick').value = currentUser.nick;
  document.getElementById('cabInputEmail').value = currentUser.email;
  document.getElementById('cabInputFaction').value = currentUser.faction || 'Резидент';
  document.getElementById('cabSkinNickInput').value = currentUser.skinNick || currentUser.nick;

  const isOwner = currentUser.email === OWNER_EMAIL;
  const appDoc = await db.collection('applications').doc(currentUser.email).get();
  const approved = isOwner || (appDoc.exists && appDoc.data().status === 'approved');

  let roleTitle = 'РЕЗИДЕНТ';
  if (isOwner) roleTitle = 'ВЛАДЕЛЕЦ';
  else if (currentUser.role === 'deputy') roleTitle = 'ЗАМ. ВЛАДЕЛЬЦА';
  else if (currentUser.role === 'tech_admin') roleTitle = 'ТЕХ. АДМИН';
  else if (currentUser.role === 'admin') roleTitle = 'АДМИНИСТРАТОР';

  document.getElementById('cabRoleText').innerText = roleTitle;
  document.getElementById('cabInputStatus').value = approved ? '✓ ДОСТУП ОДОБРЕН' : 'НА РАССМОТРЕНИИ';
  document.getElementById('cabSkinImg').src = `https://mc-heads.net/body/${currentUser.skinNick || currentUser.nick}`;

  const ownBiosContainer = document.getElementById('userOwnBiosList');
  const biosSnap = await db.collection('biographies').where('authorEmail', '==', currentUser.email).get();

  if (biosSnap.empty) {
    ownBiosContainer.innerHTML = `<p style="color:var(--text-muted); font-size:0.85rem;">У вас пока нет опубликованных биографий.</p>`;
  } else {
    let biosHtml = '';
    biosSnap.forEach(doc => {
      const b = doc.data();
      biosHtml += `
        <div style="background:rgba(6, 4, 13, 0.8); padding:0.8rem; border-radius:10px; display:flex; justify-content:space-between; align-items:center;">
          <div><b style="color:var(--accent-light);">${b.charName}</b> (${b.charRole})</div>
          <button class="btn btn-danger" style="padding:0.2rem 0.5rem; font-size:0.7rem; margin-left:auto;" onclick="deleteBio('${doc.id}')">Удалить</button>
        </div>
      `;
    });
    ownBiosContainer.innerHTML = biosHtml;
  }
}