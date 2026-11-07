/* =========================================================
   清醒点 · 大学生防骗指南
   Vanilla JS — no dependencies, no network requests
   ========================================================= */

(() => {
  'use strict';

  /* ---------- Helpers ---------- */

  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));

  const reduceMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
  const getScrollBehavior = () => (reduceMotionQuery.matches ? 'auto' : 'smooth');

  const escapeHTML = (value) =>
    String(value).replace(/[&<>"']/g, (char) => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;',
    }[char]));

  const escapeRegExp = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

  let toastTimer;
  const toast = $('#toast');
  function showToast(message) {
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add('is-visible');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove('is-visible'), 2800);
  }

  async function copyText(text, successMessage) {
    try {
      await navigator.clipboard.writeText(text);
    } catch (error) {
      const helper = document.createElement('textarea');
      helper.value = text;
      helper.setAttribute('readonly', '');
      helper.style.position = 'fixed';
      helper.style.opacity = '0';
      document.body.appendChild(helper);
      helper.select();
      try {
        document.execCommand('copy');
      } catch (fallbackError) {
        document.body.removeChild(helper);
        showToast('复制失败，手动选一下文字吧');
        return false;
      }
      document.body.removeChild(helper);
    }
    showToast(successMessage || '已复制到剪贴板');
    return true;
  }

  function lockBody() {
    document.body.classList.add('is-locked');
  }

  function unlockBody() {
    if (!document.body.classList.contains('is-locked')) return;
    const navOpen = $('#mainNav')?.classList.contains('is-open');
    const modalOpen = !$('#scamModal')?.hidden;
    if (!navOpen && !modalOpen) document.body.classList.remove('is-locked');
  }

  /* ---------- Scam data ---------- */

  const categories = {
    parttime: '兼职赚钱',
    identity: '冒充身份',
    shopping: '网购交易',
    romance: '情感投资',
    campus: '校园生活',
  };

  const sources = {
    mpsTen: {
      short: '公安部',
      org: '公安部',
      title: '公安部公布十大高发电信网络诈骗类型',
      date: '2024-06-25',
      url: 'http://www.news.cn/legal/20240625/a5d7ef4c1be44d76a5777f9a803739d8/c.html',
      note: '新华网转载公安部发布内容',
    },
    mpsTicket: {
      short: '公安部',
      org: '公安部',
      title: '“内部渠道”买演出门票，当心被骗钱',
      date: '2025-07-30',
      url: 'https://gaj.tongliao.gov.cn/xwzx/jftx/202507/t20250730_975375.html',
      note: '通辽市公安局网站转载公安部网站内容',
    },
    mpsAI: {
      short: '公安部网站',
      org: '公安部网站（转载《人民日报》）',
      title: '警惕利用人工智能技术进行新型犯罪',
      date: '2023-10-26',
      url: 'http://paper.people.com.cn/rmrbwap/html/2023-10/26/nw.D110000renmrb_20231026_2-18.htm',
      note: '《人民日报》2023-10-26 报道，公安部网站转载',
    },
    moeJob: {
      short: '教育部',
      org: '教育部',
      title: '求职高峰期，毕业生求职需警惕陷阱，避免踩“坑”',
      date: '2023-04-20',
      url: 'http://www.moe.gov.cn/jyb_xwfb/gzdt_gzdt/s5987/202304/t20230420_1056465.html',
    },
    moeAid: {
      short: '教育部资助中心',
      org: '教育部全国学生资助管理中心',
      title: '2022年第2号预警：提醒广大学生和家长警惕“助学”骗局',
      date: '2022-08-29',
      url: 'http://www.moe.gov.cn/jyb_xwfb/s5147/202208/t20220829_656118.html',
    },
    mpsHandbook: {
      short: '国家反诈中心',
      org: '公安部刑侦局、国家反诈中心',
      title: '《2026版防范电信网络诈骗宣传手册》',
      date: '2026-06-25',
      url: 'https://ao.china-embassy.gov.cn/chn/lsfw_0/tsyj/202606/t20260625_11951857.htm',
      note: '中国驻安哥拉大使馆网站转载',
    },
  };

  const sourceByScamId = {
    brushing: sources.mpsTen,
    'campus-loan': sources.mpsTen,
    refund: sources.mpsTen,
    official: sources.mpsTen,
    romance: sources.mpsTen,
    'fake-job': sources.moeJob,
    ticket: sources.mpsTicket,
    teacher: sources.mpsTen,
    game: sources.mpsTen,
    overseas: sources.mpsHandbook,
    scholarship: sources.moeAid,
    'ai-face': sources.mpsAI,
    thesis: sources.mpsTen,
  };

  const scams = [
    {
      id: 'brushing',
      no: '01',
      category: 'parttime',
      tone: 'orange',
      title: '刷单返利',
      hook: '动动手指，日入三百？先甜后苦的垫付局。',
      quote: '“前两单已经返现了，第三单做完连本带利一起给你。”',
      breakdown: [
        '先用 5–20 元的小额返利建立信任，让你觉得“真的能赚”。',
        '第三单开始要求垫付，金额逐次升级，还会出现“连单”“任务未完成”。',
        '想提现？先交保证金、解冻费、税费，直到你借无可借。',
      ],
      signals: [
        '任何要求先垫付、先充值的“兼职”',
        '返利金额明显高于正常劳动报酬',
        '以“连单未完成”“操作失误”为由拒绝提现',
        '让你去网贷平台借钱继续做任务',
      ],
      actions: [
        '立刻停止垫付，不再做任何“补救单”。',
        '保存聊天、转账和群聊证据，退出群聊并举报。',
        '已经转账就尽快拨打 96110 或 110。',
      ],
    },
    {
      id: 'campus-loan',
      no: '02',
      category: 'identity',
      tone: 'pink',
      title: '注销校园贷',
      hook: '一通“征信中心”的电话，可能让你背上真贷款。',
      quote: '“你名下有一笔学生贷款未注销，不处理会影响征信。”',
      breakdown: [
        '冒充网贷平台、金融监管部门或“征信中心”，准确报出你的学校信息。',
        '用“影响考公、考研、买房”制造恐慌，要求你配合“注销流程”。',
        '诱导你在多个平台借贷，再把钱转入所谓“清零账户”，贷款却记在你名下。',
      ],
      signals: [
        '声称能“注销校园贷”“修复征信”',
        '要求你把贷款额度提现后转入指定账户',
        '让你下载会议软件、共享屏幕“指导操作”',
        '用“征信污点”“影响毕业”逼你马上处理',
      ],
      actions: [
        '征信记录不能花钱修复，也没有“注销校园贷”的官方收费渠道。',
        '挂断电话，通过学校资助中心或正规金融机构核实。',
        '不要向陌生账户转任何“保证金”“清零款”。',
      ],
    },
    {
      id: 'refund',
      no: '03',
      category: 'shopping',
      tone: 'blue',
      title: '客服退款 / 快递理赔',
      hook: '“双倍赔付”的背后，是一场屏幕共享。',
      quote: '“您的快递丢了，我们双倍赔付，请下载会议软件共享屏幕。”',
      breakdown: [
        '冒充电商客服、快递员，准确说出你的订单和地址，先取得信任。',
        '以“商品有问题”“快递丢失”为由主动提出退款、理赔。',
        '诱导你下载会议软件、共享屏幕，或先开通网贷“走流水”，再转走钱款。',
      ],
      signals: [
        '主动联系你退款，却要求加私人微信/QQ',
        '让你下载会议 App、共享屏幕',
        '退款前要求你先转账、贷款、刷流水',
        '索要银行卡密码、验证码、人脸识别',
      ],
      actions: [
        '只在官方 App 的订单页核实，不点陌生链接。',
        '正规退款原路返回，不需要你先付钱或贷款。',
        '已在共享屏幕，立即关闭并修改支付密码。',
      ],
    },
    {
      id: 'official',
      no: '04',
      category: 'identity',
      tone: 'blue',
      title: '冒充公检法',
      hook: '“你涉嫌洗钱”——最老套，也最容易让人慌。',
      quote: '“你涉嫌一起洗钱案，现在需要配合资金清查，不要告诉任何人。”',
      breakdown: [
        '冒充公安、检察院、法院，用伪造的通缉令、警号、办案视频把你镇住。',
        '要求你保持通话、单独待着、别告诉家人，切断你所有外部提醒。',
        '以“清查资金”“自证清白”为由，让你把钱转入“安全账户”，甚至贷款。',
      ],
      signals: [
        '公检法通过电话、社交软件“办案”',
        '要求你转钱到“安全账户”“监管账户”',
        '要求共享屏幕、下载会议软件、保持单线联系',
        '强调“保密”，不让你告诉家人和老师',
      ],
      actions: [
        '直接挂断。公检法不会电话办案，更不会让你转账自证清白。',
        '拨打 110 或到就近派出所当面核实。',
        '已经共享屏幕，立刻关闭并联系银行止付。',
      ],
    },
    {
      id: 'romance',
      no: '05',
      category: 'romance',
      tone: 'pink',
      title: '网恋投资 / 杀猪盘',
      hook: '“稳赚不赔”的爱情，最后都通向充值页面。',
      quote: '“我舅舅在平台做技术，发现一个漏洞，跟着我稳赚。”',
      breakdown: [
        '在社交软件、游戏、兴趣群里接近你，用长时间聊天建立恋爱或知己关系。',
        '不经意透露“内部渠道”“平台漏洞”“老师带单”，先让你小额盈利。',
        '等你加大投入，平台就以“流水不足”“账户冻结”为由拒绝提现，人也没了。',
      ],
      signals: [
        '网恋对象主动带你投资、博彩、买币',
        '“内部消息”“平台漏洞”“稳赚不赔”',
        '让你下载陌生 App 或向个人账户充值',
        '拒绝视频，或以各种理由不让你提现',
      ],
      actions: [
        '凡是网恋对象带你赚钱，直接当成诈骗处理。',
        '不向陌生平台充值，不把验证码和账户交给任何人。',
        '保留聊天和转账记录，立即报警。',
      ],
    },
    {
      id: 'fake-job',
      no: '06',
      category: 'parttime',
      tone: 'yellow',
      title: '高薪兼职与培训贷',
      hook: '面试五分钟就录用，先交 980 元培训费？',
      quote: '“你条件很好，交个培训费/服装费，上岗一个月就返还。”',
      breakdown: [
        '用“零门槛、高时薪、包上岗”吸引急于找兼职的大学生。',
        '以培训费、服装费、设备押金、体检费名义收费，或诱导你办“培训贷”。',
        '承诺的岗位不存在，退款无门；贷款却需要你自己还。',
      ],
      signals: [
        '入职前以任何名义收费',
        '让你用身份证、银行卡办理“分期培训”',
        '合同里出现贷款、分期、服务费字样',
        '高薪却说不清具体工作内容',
      ],
      actions: [
        '任何先交钱的兼职，默认不做。',
        '不签看不懂的合同，不办任何“培训贷”。',
        '向学校就业中心核实招聘企业资质。',
      ],
    },
    {
      id: 'ticket',
      no: '07',
      category: 'shopping',
      tone: 'yellow',
      title: '门票 / 二手交易',
      hook: '“平台手续费太高，微信直转便宜 300。”',
      quote: '“你微信直接转我，我把票转给你，平台还要抽成。”',
      breakdown: [
        '在二手平台挂出低价演唱会票、球票、数码产品，诱导你脱离平台交易。',
        '发来伪造的订单截图、身份证、学生证，甚至“先票后款”的假视频。',
        '收到钱就拉黑；或发假链接、假客服，继续以“解冻”为名骗钱。',
      ],
      signals: [
        '要求脱离平台，私下微信/支付宝转账',
        '价格明显低于市场价，还催你“先到先得”',
        '发来陌生链接让你“确认订单”',
        '拒绝平台担保，只接受先款',
      ],
      actions: [
        '坚持平台内交易，不脱离平台付款。',
        '先验票、验货，再确认收货。',
        '对方催得越急，越要停下来核实。',
      ],
    },
    {
      id: 'teacher',
      no: '08',
      category: 'identity',
      tone: 'green',
      title: '冒充老师 / 熟人',
      hook: '头像是辅导员，语气也很像——但号是新的。',
      quote: '“我是你辅导员，学校要登记奖学金，点这个链接填一下银行卡。”',
      breakdown: [
        '盗取老师、同学、亲戚的社交账号，或注册高仿号。',
        '以收班费、奖学金登记、急事借钱、代付为由，让你马上转账。',
        '群发链接收集银行卡、验证码；或用 AI 换脸、拟声伪造视频通话。',
      ],
      signals: [
        '熟人突然换号、新号加你，开口就借钱',
        '老师通过私聊收钱、发陌生链接',
        '催你“马上转，别打电话，我在开会”',
        '视频里的人在，但要求你共享屏幕或念验证码',
      ],
      actions: [
        '挂断后，用你原本存着的号码回拨核实。',
        '问一个只有你们知道的问题，或当面确认。',
        '不点链接，不填银行卡，不转“急用钱”。',
      ],
    },
    {
      id: 'game',
      no: '09',
      category: 'shopping',
      tone: 'green',
      title: '游戏账号 / 低价充值',
      hook: '“内部渠道五折充值”，先交账号密码的那种。',
      quote: '“官方充值太贵，我有内部渠道，先把账号密码给我。”',
      breakdown: [
        '在游戏公屏、QQ 群发布低价充值、代练、账号买卖信息。',
        '诱导你脱离官方平台交易，先付定金或交“解冻费”“保证金”。',
        '拿到账号后盗号、洗装备；或以“平台检测”为由继续骗钱。',
      ],
      signals: [
        '低价充值、代练、买卖账号绕开官方平台',
        '索要账号密码、短信验证码',
        '以“账户冻结”“需要保证金”为由让你继续付钱',
        '发来陌生交易链接或二维码',
      ],
      actions: [
        '只在官方渠道充值和交易。',
        '任何索要验证码的“客服”都是骗子。',
        '账号已被盗，立刻冻结并联系官方客服。',
      ],
    },
    {
      id: 'overseas',
      no: '10',
      category: 'parttime',
      tone: 'orange',
      title: '境外高薪 / 缅北陷阱',
      hook: '“包机票、月入两万”，可能是单程票。',
      quote: '“包机票、月入两万，去缅北做客服，到了就上岗。”',
      breakdown: [
        '在兼职群、短视频平台发布境外高薪招聘，承诺包吃住、包机票。',
        '以“先去云南培训”“转机”等名义，把你带到边境并偷渡出境。',
        '到了园区就被控制、没收证件，被迫从事诈骗，甚至遭受暴力。',
      ],
      signals: [
        '境外高薪、零门槛、包机票',
        '要求偷渡、绕开正规签证和劳务手续',
        '面试只靠聊天，不签正规合同',
        '催你尽快出发，不让你告诉家人',
      ],
      actions: [
        '不轻信境外高薪招聘，尤其是“包机票、包偷渡”。',
        '出境工作必须走正规劳务渠道，核实企业资质。',
        '发现被控制，尽快寻找机会报警或向家人求救。',
      ],
    },
    {
      id: 'scholarship',
      no: '11',
      category: 'campus',
      tone: 'blue',
      title: '助学金 / 奖学金诈骗',
      hook: '“今天截止，先交 200 元手续费，不然名额作废。”',
      quote: '“助学金今天截止，先交 200 元手续费，不然名额作废。”',
      breakdown: [
        '冒充老师、资助中心或教育局，通知你“助学金/奖学金已到账”。',
        '以手续费、税费、激活费、银行卡验证为由，让你先转账或填信息。',
        '收到钱就消失；或用你的身份信息去贷款。',
      ],
      signals: [
        '助学金发放前要求先交钱',
        '让你点击陌生链接填写银行卡、验证码',
        '用“今天截止”“名额作废”制造紧迫感',
        '通过私人微信/QQ 联系你办理',
      ],
      actions: [
        '助学金发放不会要求你先交任何费用。',
        '通过学校资助中心、辅导员当面或官方电话核实。',
        '不点链接，不向任何人透露验证码。',
      ],
    },
    {
      id: 'ai-face',
      no: '12',
      category: 'identity',
      tone: 'pink',
      title: 'AI 换脸 / 拟声借钱',
      hook: '视频里是朋友的脸，声音也像，就一定是本人吗？',
      quote: '“视频里就是我啊，你还不信？先转 5000 应急。”',
      breakdown: [
        '盗取熟人照片、短视频和语音，用 AI 合成换脸视频或拟声。',
        '以“出车祸”“被拘留”“急用钱”为由，催你马上转账。',
        '拒绝长时间通话，或用“信号不好”解释画面异常。',
      ],
      signals: [
        '视频通话很短，画面僵硬、口型不同步',
        '对方只催转账，拒绝回答私人问题',
        '要求你共享屏幕、念验证码“验证身份”',
        '账号是新号，或头像资料刚刚更换',
      ],
      actions: [
        '挂断，用你原本存的号码回拨。',
        '问只有你们知道的细节，或找第三个人核实。',
        '不给陌生人转账，不共享屏幕。',
      ],
    },
    {
      id: 'thesis',
      no: '13',
      category: 'campus',
      tone: 'paper',
      title: '论文代写 / 查重勒索',
      hook: '“包过查重”的下一页，可能是敲诈。',
      quote: '“包过查重，先付定金；敢退款就把你的论文发到学校。”',
      breakdown: [
        '在校园群、社交平台发布“论文代写、包过查重、改分”广告。',
        '先收定金，再以“查重费”“保密费”“润色费”不断加价。',
        '拿到你的个人信息和论文后，反过来威胁举报、勒索。',
      ],
      signals: [
        '承诺代写、包过、改分',
        '要求先付定金，再层层加价',
        '索要学号、身份证、学校信息',
        '以“举报学术不端”威胁你继续付钱',
      ],
      actions: [
        '论文代写本身违反学术规范，别把把柄交给陌生人。',
        '已经付钱被威胁，保存证据并告诉辅导员。',
        '不要继续转账，越转越难脱身。',
      ],
    },
  ];

  scams.forEach((scam) => {
    scam.source = sourceByScamId[scam.id] || sources.mpsTen;
  });

  const scamGrid = $('#scamGrid');
  const scamSearch = $('#scamSearch');
  const resultCount = $('#resultCount');
  const scamEmpty = $('#scamEmpty');
  const filterChips = $('#filterChips');

  let activeFilter = 'all';

  function getFilteredScams() {
    const query = (scamSearch?.value || '').trim().toLowerCase();
    return scams.filter((scam) => {
      const matchesFilter = activeFilter === 'all' || scam.category === activeFilter;
      if (!matchesFilter) return false;
      if (!query) return true;
      const haystack = [
        scam.title,
        scam.hook,
        scam.quote,
        categories[scam.category],
        ...scam.breakdown,
        ...scam.signals,
        ...scam.actions,
      ].join(' ').toLowerCase();
      return haystack.includes(query);
    });
  }

  function renderScams() {
    if (!scamGrid) return;
    const filtered = getFilteredScams();
    const query = (scamSearch?.value || '').trim();
    const showGalleryCta = activeFilter === 'all' && !query && filtered.length === scams.length;

    const galleryCta = `
      <a class="gallery-cta" href="#scanner">
        <span class="gallery-cta-eyebrow">拿不准？</span>
        <span class="gallery-cta-title">把那段可疑话术<br>丢进消息体检仪。</span>
        <span class="gallery-cta-bottom">
          本地分析 · 不上传内容
          <span class="gallery-cta-arrow" aria-hidden="true">↘</span>
        </span>
      </a>
    `;

    scamGrid.innerHTML = filtered.map((scam, index) => `
      <button
        class="scam-card"
        type="button"
        data-id="${escapeHTML(scam.id)}"
        data-tone="${escapeHTML(scam.tone)}"
        style="animation-delay:${Math.min(index, 9) * 0.035}s"
      >
        <span class="visually-hidden">查看骗局详情：</span>
        <span class="card-top">
          <span class="card-cat">${escapeHTML(categories[scam.category])}</span>
          <span class="card-no">NO.${escapeHTML(scam.no)}</span>
        </span>
        <span class="card-title">${escapeHTML(scam.title)}</span>
        <span class="card-hook">${escapeHTML(scam.hook)}</span>
        <span class="card-quote">${escapeHTML(scam.quote)}</span>
        <span class="card-source"><span class="source-mark" aria-hidden="true">◉</span>来源：${escapeHTML(scam.source.short)} · ${escapeHTML(scam.source.date)}</span>
        <span class="card-foot">
          <span>拆解这局</span>
          <span class="card-arrow" aria-hidden="true">↗</span>
        </span>
      </button>
    `).join('') + (showGalleryCta ? galleryCta : '');

    if (resultCount) {
      resultCount.textContent = `共 ${filtered.length} 条${activeFilter === 'all' ? '' : ` · ${categories[activeFilter]}`}`;
    }
    if (scamEmpty) scamEmpty.hidden = filtered.length !== 0;
    scamGrid.hidden = filtered.length === 0;
  }

  if (filterChips) {
    filterChips.addEventListener('click', (event) => {
      const button = event.target.closest('[data-filter]');
      if (!button) return;
      activeFilter = button.dataset.filter;
      $$('.chip', filterChips).forEach((chip) => {
        const isActive = chip === button;
        chip.classList.toggle('is-active', isActive);
        chip.setAttribute('aria-pressed', String(isActive));
      });
      renderScams();
    });
  }

  if (scamSearch) {
    scamSearch.addEventListener('input', renderScams);
  }

  $('#resetFilters')?.addEventListener('click', () => {
    activeFilter = 'all';
    if (scamSearch) scamSearch.value = '';
    $$('.chip', filterChips).forEach((chip) => {
      const isActive = chip.dataset.filter === 'all';
      chip.classList.toggle('is-active', isActive);
      chip.setAttribute('aria-pressed', String(isActive));
    });
    renderScams();
  });

  /* ---------- Scam modal ---------- */

  const modal = $('#scamModal');
  const modalPanel = $('.modal-panel', modal);
  let lastFocusedElement = null;

  function openModal(scam) {
    if (!modal || !scam) return;
    lastFocusedElement = document.activeElement;

    $('#modalCategory').textContent = categories[scam.category];
    $('#modalIndex').textContent = `NO.${scam.no} / 13`;
    $('#modalTitle').textContent = scam.title;
    $('#modalTagline').textContent = scam.hook;

    const quote = $('#modalQuote');
    quote.textContent = scam.quote;

    const breakdown = $('#modalBreakdown');
    breakdown.innerHTML = scam.breakdown.map((item) => `<li>${escapeHTML(item)}</li>`).join('');

    const signals = $('#modalSignals');
    signals.innerHTML = scam.signals.map((item) => `<li>${escapeHTML(item)}</li>`).join('');

    const actions = $('#modalActions');
    actions.innerHTML = scam.actions.map((item) => `<li>${escapeHTML(item)}</li>`).join('');

    const source = scam.source;
    const modalSource = $('#modalSource');
    if (modalSource) {
      modalSource.innerHTML = `
        <span class="modal-source-label">来源与时间</span>
        <div class="modal-source-main">
          <a href="${escapeHTML(source.url)}" target="_blank" rel="noopener noreferrer">
            ${escapeHTML(source.org)}：${escapeHTML(source.title)}
            <span aria-hidden="true">↗</span><span class="visually-hidden">（在新标签页打开）</span>
          </a>
          <time datetime="${escapeHTML(source.date)}">${escapeHTML(source.date)}</time>
          ${source.note ? `<span class="modal-source-note">${escapeHTML(source.note)}</span>` : ''}
        </div>
      `;
    }

    modal.hidden = false;
    modalPanel.scrollTop = 0;
    lockBody();

    requestAnimationFrame(() => {
      $('#modalClose')?.focus();
    });
  }

  function closeModal() {
    if (!modal || modal.hidden) return;
    modal.hidden = true;
    unlockBody();
    if (lastFocusedElement && typeof lastFocusedElement.focus === 'function') {
      lastFocusedElement.focus();
    }
  }

  scamGrid?.addEventListener('click', (event) => {
    const card = event.target.closest('.scam-card');
    if (!card) return;
    const scam = scams.find((item) => item.id === card.dataset.id);
    if (scam) openModal(scam);
  });

  modal?.addEventListener('click', (event) => {
    if (event.target.closest('[data-close-modal]')) closeModal();
  });

  $('#modalClose')?.addEventListener('click', closeModal);

  document.addEventListener('keydown', (event) => {
    if (!modal || modal.hidden) return;

    if (event.key === 'Escape') {
      event.preventDefault();
      closeModal();
      return;
    }

    if (event.key !== 'Tab') return;

    const focusable = $$('button, [href], input, textarea, select, [tabindex]:not([tabindex="-1"])', modalPanel)
      .filter((element) => !element.disabled && element.offsetParent !== null);

    if (!focusable.length) return;

    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  });

  /* ---------- Scanner ---------- */

  const scanGroups = {
    control: {
      name: '远程控制 / 信息套取',
      advice: [
        '立刻退出会议、关闭屏幕共享，不要按对方提示继续操作。',
        '不向任何人透露验证码、银行卡密码和人脸识别信息。',
        '已经共享过屏幕，马上修改支付和银行 App 密码。',
      ],
    },
    official: {
      name: '冒充公检法 / 政府机构',
      advice: [
        '公检法不会通过电话或聊天软件办案，更不会要求转账到“安全账户”。',
        '立即挂断，拨打 110 或到就近派出所当面核实。',
        '不要因为对方报出你的身份信息就相信他，这些信息可能已经泄露。',
      ],
    },
    parttime: {
      name: '刷单返利 / 虚假兼职',
      advice: [
        '停止垫付，不要为了“拿回本金”继续做任务。',
        '刷单本身违法，所谓“连本带利返还”只是继续骗钱的借口。',
        '保存聊天和转账证据，尽快拨打 96110 或 110。',
      ],
    },
    refund: {
      name: '冒充客服 / 退款理赔',
      advice: [
        '只通过官方 App 的订单页核实，不点陌生链接、不加私人客服。',
        '正规退款会原路返回，不需要你先转账、贷款或共享屏幕。',
        '已经泄露银行卡信息，立即联系银行冻结并修改密码。',
      ],
    },
    loan: {
      name: '注销校园贷 / 征信陷阱',
      advice: [
        '征信不能人为“修复”，也没有收费的“注销校园贷”渠道。',
        '不要向陌生账户转“保证金”“清零款”，更不要先借贷。',
        '通过学校资助中心或正规金融机构核实，必要时报警。',
      ],
    },
    invest: {
      name: '投资理财 / 情感诈骗',
      advice: [
        '“漏洞、内幕、稳赚不赔”是诈骗的高频关键词。',
        '不向陌生平台充值，不把账户交给“老师”或网恋对象操作。',
        '已经充值，保存平台链接、聊天和转账记录并立即报警。',
      ],
    },
    private: {
      name: '私下交易 / 熟人借钱',
      advice: [
        '坚持在正规平台内交易，不脱离平台私下转账。',
        '涉及熟人借钱，用你原本存着的号码回拨或当面核实。',
        '不扫陌生二维码，不点陌生链接，不向个人账户付“定金”。',
      ],
    },
    unknown: {
      name: '暂未归类的可疑话术',
      advice: [
        '不点、不转、不共享屏幕，先停下来。',
        '通过官方渠道或你原本认识的号码，换一个渠道核实。',
        '拿不准就问辅导员、家长或同学，不要一个人做决定。',
      ],
    },
  };

  const scanRules = [
    { id: 'screen', group: 'control', weight: 35, label: '要求共享屏幕', terms: ['共享屏幕', '屏幕共享', '共享一下', '会议软件', '腾讯会议', '钉钉会议', '下载会议', '远程控制'] },
    { id: 'code', group: 'control', weight: 32, label: '索要验证码/人脸', terms: ['验证码', '动态码', '短信码', '人脸识别', '刷脸'] },
    { id: 'safe-account', group: 'official', weight: 40, label: '提到“安全账户”', terms: ['安全账户', '资金清查', '清查资金', '验资', '监管账户'] },
    { id: 'police', group: 'official', weight: 26, label: '自称公检法', terms: ['公安局', '派出所', '检察院', '法院', '通缉', '洗钱', '涉案', '公安'] },
    { id: 'secret', group: 'official', weight: 15, label: '要求保密/隔离', terms: ['不要告诉', '别告诉', '保密', '单独待着', '一个人'] },
    { id: 'brushing', group: 'parttime', weight: 30, label: '刷单/垫付/返利', terms: ['刷单', '垫付', '垫资', '返利', '佣金', '连单', '做任务', '激活任务'] },
    { id: 'easy-money', group: 'parttime', weight: 15, label: '高薪轻松赚钱', terms: ['日入', '日结', '高薪', '月入', '轻松赚', '动动手指', '零门槛'] },
    { id: 'loan', group: 'loan', weight: 30, label: '校园贷/征信话术', terms: ['注销校园贷', '校园贷', '征信', '学生贷款', '清空额度', '贷款额度'] },
    { id: 'refund', group: 'refund', weight: 19, label: '退款/理赔', terms: ['退款', '理赔', '快递丢失', '商品质量问题', '双倍赔偿', '客服'] },
    { id: 'private', group: 'private', weight: 22, label: '引导私下转账', terms: ['私下', '直接转', '微信转', '支付宝转', '扫码', '先付', '定金', '转我', '借我', '急用钱'] },
    { id: 'invest', group: 'invest', weight: 30, label: '稳赚/内幕/漏洞', terms: ['稳赚', '保本', '内幕', '漏洞', '高回报', '零风险', '老师带单', '博彩', '平台充值'] },
    { id: 'urgency', group: 'unknown', weight: 12, label: '制造紧迫感', terms: ['马上', '立刻', '最后', '名额', '逾期', '否则', '冻结', '起诉', '今天截止'] },
    { id: 'loan-word', group: 'loan', weight: 17, label: '诱导贷款/借款', terms: ['贷款', '借款', '额度', '花呗', '借呗', '白条', '网贷'] },
    { id: 'link', group: 'control', weight: 13, label: '陌生链接/App', terms: ['点击链接', '网址', '安装包', '浏览器打开', '下载'] },
    { id: 'identity', group: 'official', weight: 10, label: '冒充熟人/老师', terms: ['我是你', '换号', '新号', '我是辅导员', '我是老师', '领导让你', '学长推荐'] },
    { id: 'transfer', group: 'private', weight: 20, label: '要求转账/付款', terms: ['转账', '汇款', '打款', '付款', '扫码付'] },
    { id: 'card', group: 'control', weight: 15, label: '索要银行卡信息', terms: ['银行卡', '身份证号', '密码', '卡号'] },
  ];

  const scanInput = $('#scanInput');
  const scanBtn = $('#scanBtn');
  const scanResult = $('#scanResult');
  const charCount = $('#charCount');

  const examples = {
    parttime: '学妹，线上兼职日结 300，先垫 299 激活任务，做完连本带利返你。名额只剩两个了，别告诉别人。',
    refund: '您好，我是京东客服。您的订单误开成代理商，每月会自动扣 500 元。请下载会议软件共享屏幕，把银行卡余额转到安全账户验证。',
    police: '这里是市公安局，你涉嫌一起洗钱案。现在需要你配合资金清查，不要告诉任何人。请下载会议软件共享屏幕，把钱转到安全账户自证清白。',
    friend: '哥，我换号了，急用钱，先转我 2000，明天还你。别打电话，我在开会。',
    safe: '辅导员通知：明天下午 3 点在三教 201 开班会，请准时参加，不用回复。',
  };

  function updateCharCount() {
    if (!scanInput || !charCount) return;
    charCount.textContent = `${scanInput.value.length} / 2000`;
  }

  function getScanMatches(text) {
    const normalized = text.toLowerCase();
    return scanRules
      .map((rule) => {
        const hits = rule.terms.filter((term) => normalized.includes(term.toLowerCase()));
        return hits.length ? { ...rule, hits } : null;
      })
      .filter(Boolean);
  }

  function highlightMatches(text, matches) {
    const terms = [...new Set(matches.flatMap((match) => match.hits))]
      .sort((a, b) => b.length - a.length);
    if (!terms.length) return escapeHTML(text);

    const pattern = new RegExp(`(${terms.map(escapeRegExp).join('|')})`, 'gi');
    return text.split(pattern).map((part) => {
      if (!part) return '';
      const isMatch = terms.some((term) => part.toLowerCase() === term.toLowerCase());
      return isMatch ? `<mark>${escapeHTML(part)}</mark>` : escapeHTML(part);
    }).join('');
  }

  function analyzeText(text) {
    const matches = getScanMatches(text);
    let score = Math.min(99, matches.reduce((total, match) => total + match.weight, 0));

    const hasControl = matches.some((match) => match.id === 'screen' || match.id === 'code');
    const hasMoneySignal = matches.some((match) => ['safe-account', 'transfer', 'private', 'loan-word'].includes(match.id));
    if (hasControl && hasMoneySignal) score = Math.max(score, 86);
    if (matches.some((match) => match.id === 'safe-account') && matches.some((match) => match.id === 'police')) {
      score = Math.max(score, 82);
    }

    let level = 'safe';
    let levelLabel = '暂未发现';
    if (score >= 55) {
      level = 'high';
      levelLabel = '高危';
    } else if (score >= 25) {
      level = 'medium';
      levelLabel = '可疑';
    } else if (score > 0) {
      level = 'low';
      levelLabel = '留意';
    }

    const groupScores = {};
    matches.forEach((match) => {
      groupScores[match.group] = (groupScores[match.group] || 0) + match.weight;
    });
    const topGroupKey = Object.entries(groupScores).sort((a, b) => b[1] - a[1])[0]?.[0] || 'unknown';
    const group = scanGroups[topGroupKey] || scanGroups.unknown;

    let title = '暂未发现常见诈骗话术';
    let summary = '这句话没有命中我们词库里的高频高危信号。但这不代表绝对安全，遇到转账、共享屏幕、索要验证码，仍然要停下来核实。';
    if (level === 'high') {
      title = '高危：这段话很像诈骗话术';
      summary = `命中了 ${matches.length} 个风险信号，整体更接近「${group.name}」。先不要按对方说的做，换一个渠道核实。`;
    } else if (level === 'medium') {
      title = '可疑：有几处信号值得警惕';
      summary = `命中了 ${matches.length} 个风险信号。仅凭这些文字不能直接定性，但已经足够让你停下来核实。`;
    } else if (level === 'low') {
      title = '留意：有一个轻微信号';
      summary = '虽然信号不强，但涉及钱、账号或个人信息时，仍然建议通过官方渠道二次确认。';
    }

    return { score, level, levelLabel, title, summary, group, matches, topGroupKey };
  }

  function renderScanResult(result, text) {
    if (!scanResult) return;
    const tags = result.matches.map((match) => `<span class="scan-tag">${escapeHTML(match.label)}</span>`).join('');
    const advice = result.group.advice.map((item) => `<li>${escapeHTML(item)}</li>`).join('');
    const highlighted = highlightMatches(text, result.matches);

    scanResult.className = `scan-result is-${result.level}`;
    scanResult.innerHTML = `
      <div class="scan-result-head">
        <span class="scan-level">${escapeHTML(result.levelLabel)}</span>
        <h3>${escapeHTML(result.title)}</h3>
      </div>
      <div class="scan-score">
        <div class="scan-score-track"><span data-score-width="${result.score}"></span></div>
        <strong>${result.score}<small>/100</small></strong>
      </div>
      <p class="scan-summary">${escapeHTML(result.summary)}</p>
      ${tags ? `<div class="scan-tags">${tags}</div>` : ''}
      <div class="scan-advice">
        <h4>下一步建议</h4>
        <ul>${advice}</ul>
      </div>
      ${text ? `
        <div class="scan-highlight">
          <h4>标出的风险词</h4>
          <p>${highlighted}</p>
        </div>
      ` : ''}
      <p class="scan-result-note">这只是本地关键词匹配，帮你多留个心眼，不能代替警方判断。真遇到诈骗，直接打 96110 或 110。</p>
    `;
    scanResult.hidden = false;

    requestAnimationFrame(() => {
      const bar = $('[data-score-width]', scanResult);
      if (bar) bar.style.width = `${result.score}%`;
    });
  }

  function runScan() {
    if (!scanInput || !scanResult) return;
    const text = scanInput.value.trim();
    if (!text) {
      showToast('先粘贴一段可疑消息，再开始体检');
      scanInput.focus();
      return;
    }
    const result = analyzeText(text.slice(0, 2000));
    renderScanResult(result, text);
    scanResult.scrollIntoView({ behavior: getScrollBehavior(), block: 'nearest' });
  }

  if (scanInput) {
    scanInput.addEventListener('input', updateCharCount);
    scanInput.addEventListener('keydown', (event) => {
      if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') {
        event.preventDefault();
        runScan();
      }
    });
  }

  scanBtn?.addEventListener('click', runScan);

  $('#clearScan')?.addEventListener('click', () => {
    if (!scanInput) return;
    scanInput.value = '';
    updateCharCount();
    if (scanResult) {
      scanResult.hidden = true;
      scanResult.innerHTML = '';
    }
    scanInput.focus();
  });

  $('#exampleChips')?.addEventListener('click', (event) => {
    const chip = event.target.closest('[data-example]');
    if (!chip || !scanInput) return;
    const example = examples[chip.dataset.example];
    if (!example) return;
    scanInput.value = example;
    updateCharCount();
    runScan();
  });

  /* ---------- Quiz ---------- */

  const quizData = [
    {
      tag: '兼职刷单',
      question: '学长把你拉进“日结兼职群”，前两单真的返了 20 元。第三单要你先垫 3000 元，说做完一起返。你会？',
      options: [
        { text: '先垫 3000，前两单都返了，应该没问题', correct: false, why: '小额返利是鱼饵。骗子用前两单建立“可信”的印象，第三单才是收割的开始。', action: '任何需要先垫付的“任务”，都不是兼职。' },
        { text: '不垫，退出群聊，保存证据并举报', correct: true, why: '前两单的甜头，是为了让你在第三单放下戒心。停下来，就是最正确的操作。', action: '已经转账，尽快拨打 96110 或 110。' },
        { text: '只垫一半，试试水，亏了也认', correct: false, why: '“试水”正是骗子设计好的下一步。垫出去的钱不会因为金额小就更容易拿回来。', action: '不要用“试一下”说服自己，直接退出。' },
      ],
    },
    {
      tag: '冒充公检法',
      question: '一个自称“市公安局”的电话说你涉嫌洗钱，要你下载会议软件共享屏幕、把存款转到“安全账户”自证清白。你会？',
      options: [
        { text: '配合调查，先转过去，查清了会退回来', correct: false, why: '公检法没有“安全账户”，也不会通过电话办案。转出去的钱，往往第一时间被分流。', action: '直接挂断，拨打 110 或到派出所核实。' },
        { text: '挂断，用官方号码报警核实', correct: true, why: '真正的公检法不会让你转账、共享屏幕，更不会要求你对家人保密。', action: '96110 来电要接，96110 拨出也可以咨询。' },
        { text: '先加对方微信，看看他的警官证', correct: false, why: '警官证、通缉令都可以伪造。骗子甚至会搭一个假官网让你“查询”。', action: '不要进入对方提供的任何“核实”渠道。' },
      ],
    },
    {
      tag: '网购交易',
      question: '你在二手平台看到一张低价演唱会门票，卖家说“平台抽成太高，微信直接转我便宜 300”。你会？',
      options: [
        { text: '微信转，便宜 300 呢，先到先得', correct: false, why: '脱离平台就没有担保。对方收钱拉黑，你很难追回。', action: '坚持平台内交易，不接受私下转账。' },
        { text: '坚持平台内交易，先验票再付款', correct: true, why: '平台担保和验票，是你唯一能抓住的保障。价格越低，越要警惕。', action: '对方拒绝平台交易，就直接放弃。' },
        { text: '让他先发身份证照片，再微信转', correct: false, why: '身份证照片可以盗用、伪造。它不能给私下转账提供任何保障。', action: '不要用一张照片替代平台担保。' },
      ],
    },
    {
      tag: '奖学金',
      question: '“辅导员”用新 QQ 发来链接，说奖学金登记今天截止，要你填银行卡号、密码和短信验证码。你会？',
      options: [
        { text: '赶紧填，截止了就领不到了', correct: false, why: '奖学金登记不需要银行卡密码和验证码。催你“今天截止”，就是在抢走你核实的时间。', action: '不点链接，不填任何支付信息。' },
        { text: '不点链接，用原号码联系辅导员核实', correct: true, why: '换号 + 陌生链接 + 索要验证码，是冒充熟人诈骗的典型组合。', action: '通过学校官方渠道确认，再操作。' },
        { text: '先填银行卡号，验证码等一等再说', correct: false, why: '银行卡号同样是敏感信息。骗子可以先收集信息，再找机会盗刷。', action: '任何索要银行卡信息的“登记”，都要先核实。' },
      ],
    },
    {
      tag: '情感投资',
      question: '网恋一个月的对象说，他发现了某博彩平台的“漏洞”，带你充值 500 元试水，真的赚了。他让你加大投入。你会？',
      options: [
        { text: '再充 5000，抓住机会多赚一点', correct: false, why: '先让你小赚，是为了让你相信“漏洞是真的”。等你加大投入，平台就会以各种理由拒绝提现。', action: '网恋对象带你投资/博彩，直接按诈骗处理。' },
        { text: '立刻停止，保存记录并报警', correct: true, why: '“漏洞、内幕、稳赚”是杀猪盘的标准话术。感情是真的吗？至少骗钱是真的。', action: '不要为了“验证”再充一分钱。' },
        { text: '先提现试试，能提出来就继续', correct: false, why: '小额提现成功，是骗子放长线的手段。你看到的余额，只是后台改出来的数字。', action: '提现成功也不代表安全，立即停止。' },
      ],
    },
    {
      tag: '兼职培训',
      question: '一份“高薪实习”面试五分钟就通过，对方说要先交 980 元培训费，上岗一个月后返还。你会？',
      options: [
        { text: '交吧，高薪工作很快就赚回来了', correct: false, why: '正规用人单位不会在入职前向学生收取培训费。所谓“返还”，通常不会发生。', action: '入职前先交钱，默认拒绝。' },
        { text: '不交，核实企业资质后再决定', correct: true, why: '先收费、再承诺高薪，是培训贷和虚假招聘的常见套路。', action: '通过学校就业中心或企业官网核实。' },
        { text: '只交一半，让他给我留个名额', correct: false, why: '交一半也是交钱。对方会用“名额”“合同”继续套住你，甚至引导你办贷款。', action: '不要用定金换取一个不存在的岗位。' },
      ],
    },
  ];

  const quizBody = $('#quizBody');
  const quizStep = $('#quizStep');
  const quizTag = $('#quizTag');
  const quizProgress = $('#quizProgress');
  let quizState = { index: 0, score: 0, answered: false, selected: null };

  function renderQuizQuestion() {
    if (!quizBody) return;
    const question = quizData[quizState.index];
    quizState.answered = false;
    quizState.selected = null;

    quizStep.textContent = `第 ${quizState.index + 1} / ${quizData.length} 题`;
    quizTag.textContent = question.tag;
    quizProgress.style.width = `${((quizState.index + 1) / quizData.length) * 100}%`;

    quizBody.innerHTML = `
      <h3 class="quiz-question">${escapeHTML(question.question)}</h3>
      <div class="quiz-options" role="group" aria-label="答案选项">
        ${question.options.map((option, index) => `
          <button class="quiz-option" type="button" data-option="${index}">
            <span class="option-letter" aria-hidden="true">${String.fromCharCode(65 + index)}</span>
            <span>${escapeHTML(option.text)}</span>
          </button>
        `).join('')}
      </div>
      <div class="quiz-feedback-slot"></div>
    `;

    $$('.quiz-option', quizBody).forEach((button) => {
      button.addEventListener('click', () => selectQuizOption(Number(button.dataset.option)));
    });
  }

  function selectQuizOption(selectedIndex) {
    if (quizState.answered) return;
    const question = quizData[quizState.index];
    const selected = question.options[selectedIndex];
    if (!selected) return;

    quizState.answered = true;
    quizState.selected = selectedIndex;
    if (selected.correct) quizState.score += 1;

    const allOptions = $$('.quiz-option', quizBody);
    allOptions.forEach((button, index) => {
      button.disabled = true;
      if (index === question.options.findIndex((option) => option.correct)) {
        button.classList.add('is-correct');
      }
      if (index === selectedIndex && !selected.correct) {
        button.classList.add('is-wrong');
      }
    });

    const feedbackSlot = $('.quiz-feedback-slot', quizBody);
    if (!feedbackSlot) return;
    const last = quizState.index === quizData.length - 1;
    const correctAnswer = question.options.find((option) => option.correct);

    feedbackSlot.innerHTML = `
      <div class="quiz-feedback ${selected.correct ? '' : 'is-wrong'}">
        <div class="quiz-feedback-head">
          <span class="feedback-icon" aria-hidden="true">${selected.correct ? '✓' : '!'}</span>
          <span>${selected.correct ? '判断正确，先停再核实' : '这一题容易踩坑'}</span>
        </div>
        <p>${escapeHTML(selected.why)}</p>
        ${selected.correct ? '' : `<p><strong>更稳的选择：</strong>${escapeHTML(correctAnswer.text)}</p>`}
        <p class="feedback-action">${escapeHTML(selected.action)}</p>
      </div>
      <div class="quiz-nav">
        <button class="btn btn-primary btn-small quiz-next" id="quizNext" type="button">
          ${last ? '查看结果' : '下一题'} <span aria-hidden="true">→</span>
        </button>
      </div>
    `;

    const nextButton = $('#quizNext');
    nextButton?.addEventListener('click', () => {
      if (last) {
        renderQuizResult();
      } else {
        quizState.index += 1;
        renderQuizQuestion();
      }
    });
    nextButton?.focus({ preventScroll: true });
  }

  function getQuizOutcome(score) {
    if (score === 6) {
      return {
        label: '满分清醒',
        title: '人间清醒，反诈雷达满格',
        desc: '六个场景都躲过去了。别骄傲，骗子的剧本会更新，但“先停、再核实”永远不过时。',
        tips: [
          '把这页转给一个朋友，让清醒扩散。',
          '记住 96110，遇到可疑情况先咨询。',
          '任何要求共享屏幕、转账、保密的人，都先停下来。',
        ],
      };
    }
    if (score >= 4) {
      return {
        label: '基本清醒',
        title: '基本清醒，但别太自信',
        desc: '大部分坑你都能识别，但有一个场景让你犹豫了。真正的诈骗，往往就发生在犹豫的那几秒。',
        tips: [
          '重新看一遍你答错的那类骗局。',
          '转账前问自己：我认识电话那头的人吗？',
          '涉及熟人借钱，一定用原号码回拨。',
        ],
      };
    }
    if (score >= 2) {
      return {
        label: '需要补课',
        title: '有点容易上头，建议补课',
        desc: '你并非不聪明，只是骗子的剧本刚好打中了你的情绪。把图鉴里的红线记住，比背话术更有用。',
        tips: [
          '重点看“冒充身份”和“兼职赚钱”两类。',
          '把“不共享屏幕、不转安全账户”记牢。',
          '拿不准时，先问辅导员、家长或同学。',
        ],
      };
    }
    return {
      label: '高危预警',
      title: '现在就把骗局图鉴看一遍',
      desc: '这些场景距离你可能只有一个电话。别自责，先补上最关键的一课：任何让你着急转账的人，都值得怀疑。',
      tips: [
        '从“刷单返利”和“冒充公检法”开始看。',
        '记住：公检法没有安全账户，刷单没有垫付。',
        '遇到可疑情况，直接拨打 96110 咨询。',
      ],
    };
  }

  function renderQuizResult() {
    if (!quizBody) return;
    const outcome = getQuizOutcome(quizState.score);
    const percent = Math.round((quizState.score / quizData.length) * 100);

    quizStep.textContent = '测试完成';
    quizTag.textContent = '查看结果';
    quizProgress.style.width = '100%';

    quizBody.innerHTML = `
      <div class="quiz-result">
        <div class="score-ring" style="--score:${percent}" aria-label="得分 ${quizState.score} 分，满分 ${quizData.length} 分">
          <div class="score-ring-content"><strong>${quizState.score}</strong><span>/ ${quizData.length}</span></div>
        </div>
        <span class="quiz-result-label">${escapeHTML(outcome.label)}</span>
        <h3>${escapeHTML(outcome.title)}</h3>
        <p class="quiz-result-desc">${escapeHTML(outcome.desc)}</p>
        <ul class="result-tips">
          ${outcome.tips.map((tip) => `<li>${escapeHTML(tip)}</li>`).join('')}
        </ul>
        <p class="quiz-result-note">结果仅在本机计算，不上传、不保存。</p>
        <div class="quiz-result-actions">
          <button class="btn btn-primary btn-small" type="button" id="retryQuiz">再测一次</button>
          <a class="btn btn-ghost btn-small" href="#scams">去看骗局图鉴</a>
          <button class="btn btn-ghost btn-small" type="button" id="shareQuiz">复制结果</button>
        </div>
      </div>
    `;

    $('#retryQuiz')?.addEventListener('click', () => {
      quizState = { index: 0, score: 0, answered: false, selected: null };
      renderQuizQuestion();
      $('#quizCard')?.scrollIntoView({ behavior: getScrollBehavior(), block: 'center' });
    });

    $('#shareQuiz')?.addEventListener('click', () => {
      const shareText = `我在「清醒点 · 大学生防骗指南」的反诈自测里拿了 ${quizState.score}/${quizData.length} 分。记住：不轻信、不透露、不转账、多核实。遇到诈骗打 96110 / 110。`;
      copyText(shareText, '测试结果已复制，去发给朋友吧');
    });
  }

  if (quizBody) renderQuizQuestion();

  /* ---------- Emergency checklist ---------- */

  const checklist = $('#checklist');
  const checklistCount = $('#checklistCount');
  const checklistBar = $('#checklistBar');
  const storageKey = 'clearheaded-checklist-v2';
  const checklistSteps = ['stop-payment', 'police', 'evidence'];

  function readChecklist() {
    try {
      const parsed = JSON.parse(localStorage.getItem(storageKey) || '{}');
      return parsed && typeof parsed === 'object' ? parsed : {};
    } catch (error) {
      return {};
    }
  }

  function writeChecklist(state) {
    try {
      localStorage.setItem(storageKey, JSON.stringify(state));
    } catch (error) {
      /* Storage may be unavailable in private mode. Interactions still work. */
    }
  }

  function updateChecklistUI() {
    if (!checklist) return;
    const checked = $$('input[data-step]', checklist).filter((input) => input.checked);
    const total = checklistSteps.length;
    const count = checked.length;
    const percent = Math.round((count / total) * 100);

    if (checklistCount) checklistCount.textContent = `${count} / ${total} 已完成`;
    if (checklistBar) checklistBar.style.width = `${percent}%`;

    $$('.check-item', checklist).forEach((item) => {
      const input = $('input[data-step]', item);
      item.classList.toggle('is-checked', Boolean(input?.checked));
    });
  }

  function restoreChecklist() {
    if (!checklist) return;
    const state = readChecklist();
    $$('input[data-step]', checklist).forEach((input) => {
      input.checked = Boolean(state[input.dataset.step]);
    });
    updateChecklistUI();
  }

  if (checklist) {
    restoreChecklist();

    checklist.addEventListener('change', (event) => {
      const input = event.target.closest('input[data-step]');
      if (!input) return;
      const state = readChecklist();
      state[input.dataset.step] = input.checked;
      writeChecklist(state);
      updateChecklistUI();

      if ($$('input[data-step]', checklist).every((item) => item.checked)) {
        showToast('止损流程完成。保留好证据，告诉辅导员或家人，别一个人扛。');
      }
    });

    $('#resetChecklist')?.addEventListener('click', () => {
      $$('input[data-step]', checklist).forEach((input) => { input.checked = false; });
      writeChecklist({});
      updateChecklistUI();
      showToast('止损流程已重置');
    });
  }

  $('#copyReport')?.addEventListener('click', () => {
    const now = new Date();
    const date = `${now.getFullYear()} 年 ${now.getMonth() + 1} 月 ${now.getDate()} 日`;
    const report = [
      '【已转账 · 反诈报警信息模板】',
      '第一步：先拨打 96110，或银行 / 支付平台官方客服，申请止付、冻结。',
      '第二步：再拨打 110 报警。',
      '第三步：保留聊天与转账记录，不要删除记录，不要拉黑对方。',
      '',
      `时间：${date} ____ 时 ____ 分`,
      '地点：________________________',
      '我通过：□电话  □QQ  □微信  □短信  □陌生 App  □其他________',
      '对方账号 / 电话：________________________',
      '对方以：________________________________________ 为由，',
      '诱导我向：________________________（账户 / 平台）',
      '转账共：____________ 元。',
      '我保存的证据：□聊天记录  □转账凭证  □通话记录  □网址 / App  □其他________',
      '目前对方：□仍能联系  □无法联系  □账号异常',
      '我的姓名：____________  联系电话：____________',
      '',
      '请先止付，再报警；保留好聊天和转账记录，不要删除或拉黑对方。',
    ].join('\n');
    copyText(report, '报警要素已复制，可直接粘贴补充细节');
  });

  /* ---------- Navigation, scroll & reveal ---------- */

  const menuToggle = $('#menuToggle');
  const mainNav = $('#mainNav');
  const navBackdrop = $('#navBackdrop');
  const header = $('.site-header');

  function closeNav({ returnFocus = false } = {}) {
    if (!mainNav || !menuToggle) return;
    mainNav.classList.remove('is-open');
    menuToggle.setAttribute('aria-expanded', 'false');
    menuToggle.setAttribute('aria-label', '打开导航菜单');
    navBackdrop?.classList.remove('is-visible');
    unlockBody();
    if (returnFocus) {
      requestAnimationFrame(() => menuToggle.focus({ preventScroll: true }));
    }
  }

  function openNav() {
    if (!mainNav || !menuToggle) return;
    mainNav.classList.add('is-open');
    menuToggle.setAttribute('aria-expanded', 'true');
    menuToggle.setAttribute('aria-label', '关闭导航菜单');
    navBackdrop?.classList.add('is-visible');
    lockBody();
    requestAnimationFrame(() => {
      mainNav.querySelector('a')?.focus({ preventScroll: true });
    });
  }

  menuToggle?.addEventListener('click', () => {
    const isOpen = mainNav?.classList.contains('is-open');
    if (isOpen) closeNav({ returnFocus: true });
    else openNav();
  });

  navBackdrop?.addEventListener('click', () => closeNav({ returnFocus: true }));

  mainNav?.addEventListener('click', (event) => {
    if (event.target.closest('a')) closeNav({ returnFocus: true });
  });

  window.addEventListener('resize', () => {
    if (window.innerWidth > 940) closeNav();
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && mainNav?.classList.contains('is-open')) {
      closeNav({ returnFocus: true });
    }
  });

  const scrollBar = $('#scrollBar');
  function updateScrollProgress() {
    if (!scrollBar) return;
    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
    const percent = maxScroll > 0 ? Math.min(100, (scrollTop / maxScroll) * 100) : 0;
    scrollBar.style.width = `${percent}%`;
    header?.classList.toggle('is-scrolled', scrollTop > 10);
    if (scrollTop < 220) {
      $$('.main-nav a[href^="#"]').forEach((link) => {
        link.classList.remove('is-active');
        link.removeAttribute('aria-current');
      });
    }
  }

  window.addEventListener('scroll', updateScrollProgress, { passive: true });
  updateScrollProgress();

  const navLinks = $$('.main-nav a[href^="#"]');
  const observedSections = ['scams', 'scanner', 'quiz', 'emergency']
    .map((id) => document.getElementById(id))
    .filter(Boolean);

  if ('IntersectionObserver' in window && observedSections.length) {
    const navObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const id = entry.target.id;
        navLinks.forEach((link) => {
          const isActive = link.getAttribute('href') === `#${id}`;
          link.classList.toggle('is-active', isActive);
          if (isActive) link.setAttribute('aria-current', 'location');
          else link.removeAttribute('aria-current');
        });
      });
    }, { rootMargin: '-34% 0px -55% 0px', threshold: 0 });

    observedSections.forEach((section) => navObserver.observe(section));
  }

  const revealElements = $$('.reveal');
  if ('IntersectionObserver' in window && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    const revealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });

    revealElements.forEach((element) => revealObserver.observe(element));
  } else {
    revealElements.forEach((element) => element.classList.add('is-visible'));
  }

  $('#backTop')?.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: getScrollBehavior() });
  });

  $('#printBtn')?.addEventListener('click', () => window.print());

  $('#shareBtn')?.addEventListener('click', () => {
    const pageUrl = /^https?:$/.test(window.location.protocol) ? window.location.href : '';
    const text = [
      '别让骗子先毕业。',
      '这份「清醒点 · 大学生防骗指南」整理了 13 类校园高频骗局、可疑消息体检和被骗后的止损流程。',
      '记住：不轻信、不透露、不转账、多核实。遇到诈骗打 96110 或 110。',
      pageUrl ? `\n${pageUrl}` : '',
    ].join('\n').trim();
    copyText(text, '分享文案已复制，去发给你关心的人吧');
  });

  /* ---------- Init ---------- */

  renderScams();
  updateCharCount();
})();
