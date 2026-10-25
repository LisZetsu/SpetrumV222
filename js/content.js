// Настройки сайта, новости, правила, лор, благодарность

async function loadGlobalSettings() {
  try {
    const doc = await db.collection('settings').doc('global').get();
    if (doc.exists) {
      const data = doc.data();
      if (data.specialThanks) document.getElementById('specialThanksDisplay').innerHTML = data.specialThanks;
      if (data.tgChannel)    document.getElementById('tgChannelLinkBtn').href = data.tgChannel;
      if (data.tgChat)       document.getElementById('tgChatLink').href = data.tgChat;
      if (data.discord)      document.getElementById('discordLink').href = data.discord;
      if (data.modpack)      document.getElementById('modpackGuideBtn').href = data.modpack;
      if (data.factionApply) document.getElementById('factionApplyLinkBtn').href = data.factionApply;
      if (data.serverLore)   document.getElementById('serverLoreTextDisplay').innerHTML = data.serverLore;
      if (data.guideDesc)    document.getElementById('guideDisplayDesc').innerHTML = data.guideDesc;

      if (data.modListText) {
        document.getElementById('modListDisplay').innerHTML = data.modListText;
      } else {
        document.getElementById('modListDisplay').innerHTML = `
          <p>• <b>Create v0.5.1</b> — Базовый инженерный мод, конвейеры, шестерни и поезда.</p>
          <p>• <b>Farmer's Delight</b> — Полноценная кулинария, фермерство и рецепты.</p>
          <p>• <b>Spectrum Amethyst</b> — Магия аметистов и кристаллов.</p>
          <p>• <b>Simple Voice Chat</b> — Внутриигровой позиционный голосовой чат.</p>
        `;
      }

      if (data.rulesHeader) document.getElementById('rulesTextDisplay').innerHTML = data.rulesHeader;
      if (data.rulesRp)     document.getElementById('ruleCardRpDisplay').innerHTML = data.rulesRp;
      if (data.rulesTech)   document.getElementById('ruleCardTechDisplay').innerHTML = data.rulesTech;
      if (data.rulesHeader) document.getElementById('rulesTextDisplay').innerHTML = data.rulesHeader;
      if (data.rulesRp)     document.getElementById('ruleCardRpDisplay').innerHTML = data.rulesRp;
      if (data.rulesTech)   document.getElementById('ruleCardTechDisplay').innerHTML = data.rulesTech;

      if (data.donateGoal) document.getElementById('masterDonGoal').value = data.donateGoal;
      if (data.donateCurrent) document.getElementById('masterDonCurrent').value = data.donateCurrent;
      if (data.donateDate) document.getElementById('masterDonDate').value = data.donateDate;
    }
    }
  } catch (err) {
    console.log('Error loading settings:', err);
  }
}

async function populateDirectRulesModal() {
  const doc = await db.collection('settings').doc('global').get();
  const data = doc.exists ? doc.data() : {};

  document.getElementById('ruleInputHeader').value = data.rulesHeader || 'Ознакомьтесь с основными нормами взаимодействия...';
  document.getElementById('ruleInputRp').value = data.rulesRp || '• Имя персонажа: Ник должен быть RP\n• Гриферство запрещено';
  document.getElementById('ruleInputTech').value = data.rulesTech || '• Оптимизация: Лагающие механизмы выключать\n• Читы запрещены';
}

async function saveDirectRules(e) {
  e.preventDefault();
  try {
    await db.collection('settings').doc('global').set({
      rulesHeader: document.getElementById('ruleInputHeader').value,
      rulesRp: document.getElementById('ruleInputRp').value,
      rulesTech: document.getElementById('ruleInputTech').value
    }, { merge: true });

    closeModal('editRulesModal');
    showToast('Правила сервера успешно обновлены!');
    loadGlobalSettings();
  } catch (err) {
    showToast('Ошибка сохранения правил: ' + err.message);
  }
}

async function saveSpecialThanks() {
  const text = document.getElementById('thanksInput').value;
  try {
    await db.collection('settings').doc('global').set({ specialThanks: text }, { merge: true });
    document.getElementById('specialThanksDisplay').innerHTML = text;
    showToast('Благодарность обновлена!');
  } catch (err) {
    showToast('Ошибка сохранения: ' + err.message);
  }
}

async function loadNews() {
  const container = document.getElementById('newsContainer');
  try {
    const snapshot = await db.collection('news').get();
    if (snapshot.empty) {
      container.innerHTML = `<p style="color:var(--text-muted);">Новостей пока нет.</p>`;
      return;
    }

    const isMaster = currentUser && (currentUser.email === OWNER_EMAIL || currentUser.role === 'deputy' || currentUser.role === 'tech_admin');
    let html = '';

    snapshot.forEach(doc => {
      const n = doc.data();
      html += `
        <div class="news-card">
          <img src="${n.img}" class="news-card-img" alt="News">
          <div class="news-date">${n.date}</div>
          <h3>${n.title}</h3>
          <div style="color:var(--text-muted); font-size:0.95rem;">${n.content}</div>
          ${isMaster ? `<button class="btn btn-danger" style="padding:0.2rem 0.5rem; font-size:0.7rem; margin-top:0.5rem;" onclick="deleteNews('${doc.id}')">Удалить новость</button>` : ''}
        </div>
      `;
    });
    container.innerHTML = html;
  } catch (err) {
    console.log('Error loading news:', err);
  }
}

async function handleAddNews(e) {
  e.preventDefault();
  const title = document.getElementById('newsTitle').value;
  const img = document.getElementById('newsImg').value;
  const content = document.getElementById('newsContent').value;

  try {
    await db.collection('news').add({
      title, img, content,
      date: new Date().toLocaleDateString('ru-RU')
    });
    closeModal('addNewsModal');
    showToast('Новость добавлена!');
    loadNews();
  } catch (err) {
    showToast('Ошибка: ' + err.message);
  }
}

async function deleteNews(id) {
  if (!confirm('Удалить эту новость?')) return;
  try {
    await db.collection('news').doc(id).delete();
    showToast('Новость удалена!');
    loadNews();
  } catch (err) {
    showToast('Ошибка удаления: ' + err.message);
  }
}
