// Утилиты интерфейса: табы, модалки, тосты, копирование

function insertImgPrompt(textareaId) {
  const url = prompt('Введите прямую URL-ссылку на картинку:');
  if (url && url.trim() !== '') {
    const txtArea = document.getElementById(textareaId);
    txtArea.value += `\n<img src="${url.trim()}" alt="Image" />\n`;
  }
}

function switchTab(sectionId, element) {
  if (sectionId === 'guideSection' && !isUserApproved) {
    showToast('🔒 Раздел доступен только после одобрения анкеты!');
    return;
  }

  document.querySelectorAll('.page-section').forEach(sec => sec.classList.remove('active-section'));
  document.getElementById(sectionId).classList.add('active-section');

  if (element) {
    document.querySelectorAll('.nav-link').forEach(link => link.classList.remove('active'));
    element.classList.add('active');
  }

  if (sectionId === 'cabinetSection') setupCabinetView();
  if (sectionId === 'communitySection') loadCommunityPlayers();

  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function switchLoreSubTab(subTab) {
  const serverBlock = document.getElementById('serverLoreBlock');
  const playersBlock = document.getElementById('playersLoreBlock');
  const btnServer = document.getElementById('btnServerLore');
  const btnPlayers = document.getElementById('btnPlayersLore');

  if (subTab === 'serverLore') {
    serverBlock.style.display = 'block';
    playersBlock.style.display = 'none';
    btnServer.className = 'btn btn-primary';
    btnPlayers.className = 'btn btn-outline';
  } else {
    serverBlock.style.display = 'none';
    playersBlock.style.display = 'block';
    btnServer.className = 'btn btn-outline';
    btnPlayers.className = 'btn btn-primary';
  }
}

function openModal(id) {
  document.getElementById(id).classList.add('active');
  if (id === 'adminModal') loadAdminData();
  if (id === 'masterAdminModal') populateMasterModal();
  if (id === 'editRulesModal') populateDirectRulesModal();
}

function closeModal(id) {
  document.getElementById(id).classList.remove('active');
}

function showToast(text) {
  const toast = document.getElementById('toast');
  document.getElementById('toastMsg').innerText = text;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 3500);
}

function toggleRulesAcceptance() {
  const cb = document.getElementById('rulesCheckbox');
  document.getElementById('startRegBtn').disabled = !cb.checked;
}

function copyIp() {
  navigator.clipboard.writeText('play.spectrum-v2.ru');
  showToast('IP-адрес скопирован в буфер!');
}

function getUserAvatarUrl(user) {
  if (user.avatar) return user.avatar;
  return `https://mc-heads.net/avatar/${user.nick}`;
}