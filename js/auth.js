// Регистрация / вход / анкета whitelist / выход / состояние юзера

async function handleRegister(e) {
  e.preventDefault();
  const nick = document.getElementById('regNick').value.trim();
  const email = document.getElementById('regEmail').value.trim().toLowerCase();
  const pass = document.getElementById('regPass').value;

  try {
    const userDoc = await db.collection('users').doc(email).get();
    if (userDoc.exists) {
      showToast('Пользователь с такой почтой уже существует!');
      return;
    }

    const userData = {
      nick, email, pass, banned: false,
      role: email === OWNER_EMAIL ? 'owner' : 'player',
      faction: 'Резидент', skinNick: nick, avatar: null
    };
    await db.collection('users').doc(email).set(userData);

    currentUser = userData;
    localStorage.setItem('spectrum_cloud_user', JSON.stringify(userData));
    closeModal('regModal');
    showToast('Регистрация прошла успешно!');
    checkUserState();
  } catch (err) {
    showToast('Ошибка базы данных: ' + err.message);
  }
}

async function handleLogin(e) {
  e.preventDefault();
  const email = document.getElementById('loginEmail').value.trim().toLowerCase();
  const pass = document.getElementById('loginPass').value;

  try {
    const userDoc = await db.collection('users').doc(email).get();
    if (!userDoc.exists || userDoc.data().pass !== pass) {
      showToast('Неверная почта или пароль!');
      return;
    }
    if (userDoc.data().banned) {
      showToast('Ваш аккаунт заблокирован!');
      return;
    }

    currentUser = userDoc.data();
    localStorage.setItem('spectrum_cloud_user', JSON.stringify(currentUser));
    closeModal('loginModal');
    showToast(`С возвращением, ${currentUser.nick}!`);
    checkUserState();
  } catch (err) {
    showToast('Ошибка входа: ' + err.message);
  }
}

async function handleWhitelistSubmit(e) {
  e.preventDefault();
  const age = document.getElementById('wlAge').value;
  const rpExp = document.getElementById('wlRpExp').value;
  const lore = document.getElementById('wlLore').value;
  const plans = document.getElementById('wlPlans').value;

  try {
    const appData = {
      nick: currentUser.nick,
      email: currentUser.email,
      age, rpExp,
      about: `[Опыт: ${rpExp}] Квента: ${lore} | Планы: ${plans}`,
      status: 'pending',
      createdAt: new Date().toISOString()
    };
    await db.collection('applications').doc(currentUser.email).set(appData);
    closeModal('wlModal');
    showToast('Расширенная анкета отправлена!');
    checkUserState();
  } catch (err) {
    showToast('Ошибка сохранения: ' + err.message);
  }
}

function logout() {
  localStorage.removeItem('spectrum_cloud_user');
  currentUser = null;
  window.location.reload();
}

async function checkUserState() {
  if (!currentUser) return;

  const userDoc = await db.collection('users').doc(currentUser.email).get();
  if (userDoc.exists && userDoc.data().banned) {
    alert('Вы заблокированы администратором');
    logout();
    return;
  }

  const rulesBanner = document.getElementById('rulesBanner');
  if (rulesBanner) rulesBanner.style.display = 'none';

  document.getElementById('step1').classList.add('completed');
  document.getElementById('step2').classList.add('completed');
  document.getElementById('step3').classList.add('active');

  const isOwner = currentUser.email === OWNER_EMAIL;
  const isDeputy = currentUser.role === 'deputy';
  const isTechAdmin = currentUser.role === 'tech_admin';
  const isAdmin = isOwner || isDeputy || isTechAdmin || currentUser.role === 'admin';

  const avatarUrl = getUserAvatarUrl(currentUser);

  let headerHtml = `
    <div class="user-pill" onclick="switchTab('cabinetSection')">
      <img src="${avatarUrl}" class="user-avatar-head" alt="Skin">
      <div class="user-pill-info">
        <span class="user-pill-name">${currentUser.nick}</span>
        <span class="user-pill-role">${isOwner ? 'Владелец' : (isDeputy ? 'Зам. Владельца' : (isTechAdmin ? 'Тех. Админ' : (isAdmin ? 'Админ' : 'Резидент')))}</span>
      </div>
    </div>
  `;
  if (isAdmin) {
    headerHtml += `<button class="btn btn-outline" style="border-color:var(--accent-gold); color:var(--accent-gold); padding:0.45rem 0.8rem; font-size:0.85rem;" onclick="openModal('adminModal')">🛡️ Заявки</button>`;
  }
  document.getElementById('userHeaderBlock').innerHTML = headerHtml;
  document.getElementById('addGalleryBtnMaster').style.display = 'block';
  document.getElementById('addDonationBtnMaster').style.display = 'block';
  
  if (isOwner || isDeputy || isTechAdmin) {
    document.getElementById('masterNavBtn').style.display = 'flex';
    document.getElementById('addNewsBtnMaster').style.display = 'block';
    document.getElementById('editRulesBtnStaff').style.display = 'block';
  }

  if (isOwner) {
    document.getElementById('ownerThanksEditBlock').style.display = 'block';
    document.getElementById('thanksInput').value = document.getElementById('specialThanksDisplay').innerHTML;
  }

  const appDoc = await db.collection('applications').doc(currentUser.email).get();
  isUserApproved = isOwner || isDeputy || (appDoc.exists && appDoc.data().status === 'approved');

  if (isUserApproved) {
    unlockChatAndDiscord();
    unlockGuideLinks();
    document.getElementById('step3').classList.add('completed');
    document.getElementById('step4').classList.add('active', 'completed');

    document.getElementById('ipText').innerText = 'play.spectrum-v2.ru';
    document.getElementById('copyIpBtn').disabled = false;

    document.getElementById('accessStatusText').innerHTML = `
      <span style="color:var(--accent-emerald); font-weight:bold;">✓ Вы одобрены! Полный доступ получен.</span>
    `;
  } else if (appDoc.exists) {
    unlockChatAndDiscord();
    document.getElementById('accessStatusText').innerHTML = `Анкета отправлена и находится на рассмотрении. Закрытый чат ТГ открыт.`;
  } else {
    document.getElementById('accessStatusText').innerHTML = `Вы залогинены! <button class="btn btn-primary" onclick="openModal('wlModal')" style="padding:0.3rem 0.7rem; font-size:0.8rem; margin-left:0.5rem;">Заполнить анкету</button>`;
  }
  lucide.createIcons();
}

function unlockGuideLinks() {
  const navGuideBtn = document.getElementById('navGuideBtn');
  const bannerMiniGuideBtn = document.getElementById('bannerMiniGuideBtn');
  if (navGuideBtn) {
    navGuideBtn.classList.remove('disabled-link');
    navGuideBtn.innerHTML = '<i data-lucide="compass" style="width:16px;"></i> Гайд по входу';
  }
  if (bannerMiniGuideBtn) {
    bannerMiniGuideBtn.innerHTML = 'Мини гайд';
  }
  lucide.createIcons();
}

function unlockChatAndDiscord() {
  const chatCard = document.getElementById('tgChatCard');
  const chatLink = document.getElementById('tgChatLink');
  if (chatCard && chatLink) {
    chatCard.classList.remove('locked');
    chatLink.style.pointerEvents = 'all';
    chatLink.style.opacity = '1';
    chatLink.classList.remove('btn-outline');
    chatLink.classList.add('btn-primary');
    chatLink.innerHTML = '<i data-lucide="message-circle" style="width:16px;"></i> Войти в чат ТГ';
  }

  const discordCard = document.getElementById('discordCard');
  const discordLink = document.getElementById('discordLink');
  if (discordCard && discordLink) {
    discordCard.classList.remove('locked');
    discordLink.style.pointerEvents = 'all';
    discordLink.style.opacity = '1';
    discordLink.classList.remove('btn-outline');
    discordLink.classList.add('btn-discord');
    discordLink.innerHTML = '<i data-lucide="disc" style="width:16px;"></i> Войти в Discord';
  }
  lucide.createIcons();
}
