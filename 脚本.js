(async function () {
  var NS = 'xb';
  var ROOT = document.getElementById(NS + '-root');
  if (!ROOT || ROOT.getAttribute('data-' + NS + '-init') === '1') return;
  ROOT.setAttribute('data-' + NS + '-init', '1');

  var 名单 = ['苏婉','陈雪华','林雅芝','王秀兰','赵敏','孙莉','周慧敏','吴琼','郑秀','沈梦瑶'];
  /* 档位名与语义：与 世界书/阶段指导/评价值档位主持 一致，改一处必须同改另一处 */
  var 档 = [
    [100, '满分狂欢', '肆无忌惮，金色特权解锁', '#e0444b'],
    [ 80, '巅峰期',   '故意留破绽',           '#e0913f'],
    [ 60, '警觉期',   '收着演，加快进度',     '#d8b56a'],
    [ 40, '危机期',   '收敛，查对手软肋',     '#3fa7c9'],
    [ 20, '崩坏期',   '动违法手段，判断开始出错', '#5c6572'],
    [  1, '解绑边缘', '卖惨洗白，生命保护解除', '#3fae72'],
    [  0, '系统解绑', '前两次为暴走，第三次真解绑', '#5c6572']
  ];
  var 觉醒名 = [[71, '能推出系统的存在'], [31, '开始拼凑模式'], [0, '只察觉异常']];
  var PREV = {};

  /* ── MVU 变量读法：从最新楼层往回找最多 15 层；只认 assistant 楼层；逐级兜底 ── */
  async function allVars() {
    try {
      var maxId = 0;
      try { maxId = getLastMessageId(); } catch (e0) {}
      for (var i = 0; i < 15; i++) {
        var cid = maxId - i;
        if (cid < 0) break;
        var msg = null;
        try { msg = await getChatMessages(cid); } catch (e1) { continue; }
        if (Array.isArray(msg)) msg = msg[0];
        if (!msg) continue;
        if (msg.role && msg.role !== 'assistant') continue;
        var v = null;
        try {
          if (window.Mvu && Mvu.getMvuData) v = await Mvu.getMvuData({ type: 'message', message_id: msg.message_id });
          else if (typeof getVariables === 'function') v = await getVariables({ type: 'message', message_id: msg.message_id });
        } catch (e2) {}
        if (v && v.stat_data) return v.stat_data;
      }
    } catch (e) {}
    try {
      if (typeof getVariables === 'function') {
        var c = await getVariables({ type: 'chat' });
        if (c && c.stat_data) return c.stat_data;
      }
    } catch (e3) {}
    return {};
  }

  function n(v, d) { var x = Number(v); return isFinite(x) ? x : d; }
  function esc(s) {
    return String(s == null ? '' : s).replace(/[<>&"]/g, function (c) {
      return ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;' })[c];
    });
  }
  function money(v) {
    var x = n(v, 0);
    if (x >= 1e8) return (Math.round(x / 1e7) / 10) + ' 亿';
    if (x >= 1e4) return (Math.round(x / 1e3) / 10) + ' 万';
    return String(Math.round(x));
  }
  function setNum(id, val) {
    var el = document.getElementById(NS + '-' + id); if (!el) return;
    var nv = Math.round(n(val, 0)), old = PREV[id];
    el.textContent = nv;
    if (old !== undefined && old !== nv) {
      el.className = 'v ' + (nv > old ? 'up' : 'dn');   /* 涨红跌绿 */
      setTimeout(function () { el.className = 'v'; }, 1200);
    }
    PREV[id] = nv;
  }
  function setBar(id, val, color) {
    var el = document.getElementById(NS + '-' + id); if (!el) return;
    el.style.width = Math.max(0, Math.min(100, n(val, 0))) + '%';
    if (color) el.style.background = color;
  }
  function setTxt(id, s) { var el = document.getElementById(NS + '-' + id); if (el) el.textContent = s; }
  function setHtml(id, s) { var el = document.getElementById(NS + '-' + id); if (el) el.innerHTML = s; }

  function render(v) {
    v = v || {};
    ROOT.setAttribute('data-theme', /日|light/i.test(String((v.设置 || {}).主题 || '')) ? 'light' : 'dark');
    /* ─── A 状态栏 ─── */
    var W = v.世界 || {};
    setTxt('time', W.时间 || '—');
    setTxt('ch', n(W.章节, 1));
    setTxt('turn', n(W.回合, 1));
    setTxt('place', W.地点 || '—');
    var focus = (v.镜头 || {}).对象 || '—';
    setTxt('focus', focus);

    var R = v.反派状态 || {};
    var rv = Math.round(n(R.评价值, 0)), cur = 档[档.length - 1];
    for (var i = 0; i < 档.length; i++) { if (rv >= 档[i][0]) { cur = 档[i]; break; } }
    setNum('rv', rv);
    var rvEl = document.getElementById(NS + '-rv');
    if (rvEl) rvEl.style.color = cur[3];
    setTxt('rn', cur[1]);
    setTxt('rs', cur[2]);
    setBar('rb', rv);

    setTxt('rtier', R.财富等级 || '—');
    setTxt('rassetv', '资产 ' + money(R.资产));
    setBar('rasset', (n(R.资产, 0) / 5e9) * 100);
    setTxt('quota', n(R.已绑定数, 0) + ' / ' + n(R.绑定名额上限, 8));
    setBar('qb', (n(R.已绑定数, 0) / Math.max(1, n(R.绑定名额上限, 8))) * 100);
    setTxt('blown', '暴走 ' + n(R.系统暴走次数, 0) + ' / 3');

    var sys = [
      ['时停', R.时停剩余], ['预感', R.预感剩余], ['掌控', R.掌控剩余], ['救场', R.救场剩余],
      ['洗白', R.强制洗白可用 ? 1 : 0], ['积分', R.财富积分], ['第四面墙', R.第四面墙剩余]
    ];
    setHtml('sys', sys.map(function (x) {
      return '<span' + (n(x[1], 0) ? '' : ' class="off"') + '>' + x[0] + '<b>' + n(x[1], 0) + '</b></span>';
    }).join(''));

    /* ─── D 她的档案 · 当前镜头对象 ─── */
    var AW = Book[focus] || {};
    var awd = Math.round(n(AW.绑定深度, 0));
    var BODY = AW.身体状态 || {};
    var wet = Math.round(n(BODY.湿润, 0));
    setTxt('awho', focus);
    setTxt('pstage', AW.时期 || '当前目标');
    setTxt('pdepth', awd + (awd >= 80 ? ' · 清醒被百分百压掉' : awd >= 40 ? ' · 半压' : ' · 可以撬'));
    setTxt('pfreq', Math.round(n(AW.清醒频率, 0)));
    setTxt('plast', AW.最近一次清醒 || '无');
    setTxt('pbody', '湿润 ' + wet + (wet >= 60 ? ' · 身体已经答应' : wet >= 30 ? ' · 在洇' : ' · 还干着') + (BODY.乳尖 ? ' · 乳尖立着' : ''));
    setTxt('pmark', AW.占有印记 || '无');

    var P = v.玩家 || {};
    var aw = Math.round(n(P.觉醒度, 0));
    setNum('awk', aw); setBar('awb', aw);
    for (var j = 0; j < 觉醒名.length; j++) { if (aw >= 觉醒名[j][0]) { setTxt('awt', 觉醒名[j][1]); break; } }
    var df = Math.round(n(P.反抗力, 0));
    setNum('def', df); setBar('deb', df);
    setTxt('co', '公司' + (P.公司状态 || '正常'));
    setTxt('wife', '与妻子 ' + (P.与妻子关系 || '亲密'));

    var Book = v.绑定花名册 || {};
    setHtml('roster', 名单.map(function (nm) {
      var w = Book[nm] || {};
      var d = Math.round(n(w.绑定深度, 0));
      var f = Math.round(n(w.清醒频率, 0));
      var cls = d >= 80 ? 'lv3' : (d >= 40 ? 'lv2' : 'lv1');
      return '<tr>' +
        '<td class="nm' + (nm === focus ? ' focus' : '') + '">' + esc(nm) + '</td>' +
        '<td class="st">' + esc(w.时期 || '当前目标') + '</td>' +
        '<td class="tk"><span><i class="' + cls + '" style="width:' + d + '%"></i></span></td>' +
        '<td class="dm">' + d + '</td>' +
        '<td class="dm">' + f + '</td>' +
        '</tr>';
    }).join(''));

    /* ─── B 交涉面板 ─── */
    var J = v.交涉状态 || {};
    var on = !!J.进行中;
    setTxt('jt', on ? '进行中' : '未进行');
    setTxt('jwho', '对象 ' + (J.对象 || '—'));
    setTxt('jstage', '幕次 ' + (J.幕次 || '—') + ' · 第 ' + n(J.回合, 0) + ' 回合');
    setNum('jme', J.玩家共识分);
    setNum('jop', J.对手共识分);
    setTxt('jdm', on ? n(J.上轮玩家骰, 0) : '—');
    setTxt('jdo', on ? n(J.上轮对手骰, 0) : '—');
    var jd = document.getElementById(NS + '-jjd');
    if (jd) {
      var label = String(J.上轮判定 || '—');
      jd.textContent = on ? label : '—';
      jd.className = 'jd' + (/玩家|压住|把话说死|扳|胜/.test(label) ? ' w'
        : (/对手|林天|失手|败|刮擦|被压/.test(label) ? ' l' : ''));
    }
    var AT = P.交涉 || {};
    setHtml('jattr', ['气势', '口才', '情报', '地位'].map(function (k) {
      return '<span>' + k + '<b>' + Math.round(n(AT[k], 0)) + '</b></span>';
    }).join(''));
    var ev = String(P.证据链 || '').trim();
    setHtml('jev', ev ? '证据链：<b>' + esc(ev) + '</b>' : '证据链：无');

    var hist = String(J.交涉历史 || '').trim();
    setHtml('jhist', hist ? '回合历史<br><i>' + esc(hist.split('；').join('；<br>')) + '</i>' : '');

    /* ─── C 评论条 ─── */
    var C = v.评论 || {};
    setTxt('trend', C.倾向 || '叫好');
    var hot = String(C.热门 || '').trim();
    setHtml('cmt', hot ? '<span class="tn">热评</span><br>' + esc(hot) : '评论区暂时没什么动静。');
  }

  var 指纹 = '';
  function 指纹取(s) { try { return JSON.stringify(s || {}); } catch (e) { return String(Date.now()); } }
  function 重绘(force) {
    allVars().then(function (v) {
      var f = 指纹取(v);
      if (force || f !== 指纹) { 指纹 = f; try { render(v); } catch (e) {} }
    }).catch(function () {});
  }

  try { if (typeof waitGlobalInitialized === 'function') await waitGlobalInitialized('Mvu'); } catch (e) {}
  重绘(true);

  try {
    var ctx = (typeof SillyTavern !== 'undefined' && SillyTavern.getContext) ? SillyTavern.getContext() : null;
    if (ctx && ctx.eventSource && ctx.eventTypes) {
      var T = ctx.eventTypes;
      [T.MESSAGE_UPDATED, T.MESSAGE_RENDERED, T.MESSAGE_SWIPED, T.CHAT_CHANGED, T.GENERATION_ENDED,
       T.VARIABLES_UPDATED, T.VARIABLE_CHANGED]
        .forEach(function (t) { if (t) ctx.eventSource.on(t, function () { 重绘(false); }); });
    }
  } catch (e) {}
  try {
    if (typeof Mvu !== 'undefined' && Mvu.eventOn && Mvu.events) {
      Mvu.eventOn(Mvu.events.VARIABLE_UPDATE_ENDED, function () { 重绘(true); });
    }
  } catch (e) {}
  try { setInterval(function () { 重绘(false); }, 1500); } catch (e) {}
})();
