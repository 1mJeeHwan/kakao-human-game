/**
 * 특수 엔딩 시스템
 * 사망 시 특정 조건에 따라 다음 직업이 결정되는 이벤트
 */

const { JOBS } = require('./jobs');

// 특수 엔딩 타입
const ENDING_TYPES = {
  RANDOM: 'random',           // 조건 없이 랜덤 발생
  JOB_BASED: 'job_based',     // 직업 기반
  TITLE_BASED: 'title_based', // 칭호 기반
  LEVEL_BASED: 'level_based', // 레벨 기반
  GOLD_BASED: 'gold_based',   // 골드 기반
  COMPLEX: 'complex',         // 복합 조건
  MILESTONE: 'milestone',     // 마일스톤 (사망 횟수 등)
  ANIMAL: 'animal'            // 동물 직업 전용
};

/**
 * 특수 엔딩 목록
 */
const SPECIAL_ENDINGS = [
  // ========== 랜덤 발생 (조건 없음) ==========
  {
    id: 'isekai',
    type: ENDING_TYPES.RANDOM,
    chance: 3,
    condition: null,
    deathMessage: '✨ 빛에 휩싸여 이세계로 떠났습니다...',
    nextJob: '용사',
    flavor: '새로운 세계에서 영웅으로 태어납니다!'
  },
  {
    id: 'divine_call',
    type: ENDING_TYPES.RANDOM,
    chance: 2,
    condition: null,
    deathMessage: '🙏 신의 부름을 받았습니다...',
    nextJob: '현자',
    flavor: '신성한 지혜를 얻었습니다!'
  },
  {
    id: 'darkness',
    type: ENDING_TYPES.RANDOM,
    chance: 2,
    condition: null,
    deathMessage: '🌑 어둠이 영혼을 삼켰습니다...',
    nextJob: '암살자',
    flavor: '그림자 속에서 다시 태어납니다!'
  },
  {
    id: 'golden_light',
    type: ENDING_TYPES.RANDOM,
    chance: 1,
    condition: null,
    deathMessage: '💰 황금빛 기운이 감쌌습니다...',
    nextJob: '대부호',
    flavor: '부의 축복을 받았습니다!'
  },
  {
    id: 'dragon_blood',
    type: ENDING_TYPES.RANDOM,
    chance: 0.5,
    condition: null,
    deathMessage: '🐉 고대 용의 피가 각성했습니다...',
    nextJob: '드래곤슬레이어',
    flavor: '용의 힘이 깨어납니다!'
  },
  {
    id: 'secret_society',
    type: ENDING_TYPES.RANDOM,
    chance: 2,
    condition: null,
    deathMessage: '🕵️ 비밀 조직이 접근했습니다...',
    nextJob: '용병',
    flavor: '어둠의 세계로 발을 들입니다!'
  },
  {
    id: 'reborn_genius',
    type: ENDING_TYPES.RANDOM,
    chance: 3,
    condition: null,
    deathMessage: '🧒 천재로 환생했습니다...',
    nextJob: '연구원',
    flavor: '뛰어난 두뇌와 함께 돌아왔습니다!'
  },
  {
    id: 'wanderer',
    type: ENDING_TYPES.RANDOM,
    chance: 3,
    condition: null,
    deathMessage: '🚶 방랑의 길을 떠났습니다...',
    nextJob: '모험가',
    flavor: '새로운 모험이 시작됩니다!'
  },
  {
    id: 'fame',
    type: ENDING_TYPES.RANDOM,
    chance: 2,
    condition: null,
    deathMessage: '⭐ 죽어서 전설이 되었습니다...',
    nextJob: '배우',
    flavor: '불멸의 명성을 얻었습니다!'
  },

  // ========== 직업 기반 조건부 ==========
  {
    id: 'mage_awakening',
    type: ENDING_TYPES.JOB_BASED,
    chance: 30,
    condition: (user) => user.human.job.name === '마법사' && user.human.level >= 7,
    deathMessage: '💥 마력 폭주! 차원을 넘었습니다...',
    nextJob: '대마법사',
    flavor: '강대한 마력과 함께 돌아왔습니다!'
  },
  {
    id: 'warrior_hero',
    type: ENDING_TYPES.JOB_BASED,
    chance: 25,
    condition: (user) => user.human.job.name === '전사' && user.human.level >= 10,
    deathMessage: '⚔️ 전장의 영웅으로 기억됩니다...',
    nextJob: '용사',
    flavor: '영웅의 영혼으로 환생합니다!'
  },
  {
    id: 'archer_legend',
    type: ENDING_TYPES.JOB_BASED,
    chance: 20,
    condition: (user) => user.human.job.name === '궁수' && user.human.level >= 10,
    deathMessage: '🏹 전설의 명사수로 환생...',
    nextJob: '드래곤슬레이어',
    flavor: '활의 전설이 이어집니다!'
  },
  {
    id: 'knight_spirit',
    type: ENDING_TYPES.JOB_BASED,
    chance: 20,
    condition: (user) => user.human.job.name === '기사' && user.human.level >= 5,
    deathMessage: '🛡️ 기사도 정신이 계승됩니다...',
    nextJob: '용사',
    flavor: '명예로운 영혼의 귀환!'
  },
  {
    id: 'researcher_legacy',
    type: ENDING_TYPES.JOB_BASED,
    chance: 25,
    condition: (user) => user.human.job.name === '연구원',
    deathMessage: '📚 연구는 계속됩니다...',
    nextJob: '교수',
    flavor: '지식이 다음 세대로 이어집니다!'
  },
  {
    id: 'professor_sage',
    type: ENDING_TYPES.JOB_BASED,
    chance: 20,
    condition: (user) => user.human.job.name === '교수',
    deathMessage: '📖 지식의 끝을 보았습니다...',
    nextJob: '현자',
    flavor: '깨달음을 얻었습니다!'
  },
  {
    id: 'doctor_alchemist',
    type: ENDING_TYPES.JOB_BASED,
    chance: 25,
    condition: (user) => user.human.job.name === '의사' && user.human.level >= 10,
    deathMessage: '💉 생명의 비밀을 깨달았습니다...',
    nextJob: '연금술사',
    flavor: '생명을 다루는 힘을 얻었습니다!'
  },
  {
    id: 'developer_gamer',
    type: ENDING_TYPES.JOB_BASED,
    chance: 30,
    condition: (user) => user.human.job.name === '개발자',
    deathMessage: '🐛 버그 속에서 깨어났습니다...',
    nextJob: '프로게이머',
    flavor: '코드를 넘어 게임의 신이 됩니다!'
  },
  {
    id: 'chef_alchemist',
    type: ENDING_TYPES.JOB_BASED,
    chance: 15,
    condition: (user) => user.human.job.name === '요리사' && user.human.level >= 10,
    deathMessage: '🍳 전설의 레시피를 남겼습니다...',
    nextJob: '연금술사',
    flavor: '요리의 연금술을 깨달았습니다!'
  },
  {
    id: 'entertainer_rich',
    type: ENDING_TYPES.JOB_BASED,
    chance: 10,
    condition: (user) => ['가수', '배우'].includes(user.human.job.name),
    deathMessage: '🌟 영원한 스타가 되었습니다...',
    nextJob: '대부호',
    flavor: '명성이 부로 이어집니다!'
  },
  {
    id: 'merchant_tycoon',
    type: ENDING_TYPES.JOB_BASED,
    chance: 20,
    condition: (user) => user.human.job.name === '상인' && user.human.level >= 10,
    deathMessage: '🏪 부의 비밀을 깨달았습니다...',
    nextJob: '대부호',
    flavor: '상인의 정점에 올랐습니다!'
  },
  {
    id: 'business_empire',
    type: ENDING_TYPES.JOB_BASED,
    chance: 30,
    condition: (user) => user.human.job.name === '사업가',
    deathMessage: '🏢 제국을 물려받았습니다...',
    nextJob: '대부호',
    flavor: '사업이 대업으로 성장합니다!'
  },
  {
    id: 'detective_sage',
    type: ENDING_TYPES.JOB_BASED,
    chance: 20,
    condition: (user) => user.human.job.name === '탐정',
    deathMessage: '🔍 진실을 보는 눈을 얻었습니다...',
    nextJob: '현자',
    flavor: '모든 것을 꿰뚫어 봅니다!'
  },
  {
    id: 'adventurer_dragon',
    type: ENDING_TYPES.JOB_BASED,
    chance: 15,
    condition: (user) => user.human.job.name === '모험가' && user.human.level >= 10,
    deathMessage: '🗺️ 최고의 보물을 발견했습니다...',
    nextJob: '드래곤슬레이어',
    flavor: '전설의 모험가로 귀환합니다!'
  },
  {
    id: 'unemployed_chance',
    type: ENDING_TYPES.JOB_BASED,
    chance: 10,
    condition: (user) => user.human.job.name === '백수',
    deathMessage: '☁️ 하늘이 기회를 주었습니다...',
    nextJob: 'RANDOM_RARE',  // 랜덤 희귀 이상 직업
    flavor: '운명이 바뀝니다!'
  },
  {
    id: 'parttime_success',
    type: ENDING_TYPES.JOB_BASED,
    chance: 25,
    condition: (user) => user.human.job.name === '알바생' && user.human.level >= 10,
    deathMessage: '💪 노력이 빛을 발했습니다...',
    nextJob: '사업가',
    flavor: '바닥에서 정상으로!'
  },

  // ========== 칭호 기반 조건부 ==========
  {
    id: 'title_indomitable',
    type: ENDING_TYPES.TITLE_BASED,
    chance: 40,
    condition: (user) => user.human.title.name === '불굴의',
    deathMessage: '🔥 꺾이지 않는 영혼...',
    nextJob: '용사',
    flavor: '불굴의 의지가 영웅을 만듭니다!'
  },
  {
    id: 'title_genius',
    type: ENDING_TYPES.TITLE_BASED,
    chance: 30,
    condition: (user) => user.human.title.name === '천재',
    deathMessage: '🧠 재능이 다음 생으로...',
    nextJob: '대마법사',
    flavor: '천재성이 마력으로 변환됩니다!'
  },
  {
    id: 'title_lucky',
    type: ENDING_TYPES.TITLE_BASED,
    chance: 25,
    condition: (user) => user.human.title.name === '행운의',
    deathMessage: '🍀 행운이 따라갑니다...',
    nextJob: '대부호',
    flavor: '행운이 부를 불러옵니다!'
  },
  {
    id: 'title_cursed',
    type: ENDING_TYPES.TITLE_BASED,
    chance: 35,
    condition: (user) => user.human.title.name === '저주받은',
    deathMessage: '👻 저주가 힘이 되었습니다...',
    nextJob: '암살자',
    flavor: '어둠이 동반자가 됩니다!'
  },
  {
    id: 'title_legendary',
    type: ENDING_TYPES.TITLE_BASED,
    chance: 50,
    condition: (user) => user.human.title.grade === 'legendary',
    deathMessage: '👑 전설은 계속됩니다...',
    nextJob: 'RANDOM_LEGENDARY',  // 랜덤 전설 직업
    flavor: '전설의 귀환!'
  },
  {
    id: 'title_madness',
    type: ENDING_TYPES.TITLE_BASED,
    chance: 30,
    condition: (user) => user.human.title.name === '광기의',
    deathMessage: '😈 광기가 각성했습니다...',
    nextJob: '대마법사',
    flavor: '광기가 마력이 됩니다!'
  },
  {
    id: 'title_lonely',
    type: ENDING_TYPES.TITLE_BASED,
    chance: 25,
    condition: (user) => user.human.title.name === '고독한',
    deathMessage: '🌙 어둠과 친구가 되었습니다...',
    nextJob: '암살자',
    flavor: '고독이 힘이 됩니다!'
  },
  {
    id: 'title_wealthy',
    type: ENDING_TYPES.TITLE_BASED,
    chance: 30,
    condition: (user) => user.human.title.name === '부유한',
    deathMessage: '💎 재산이 환생했습니다...',
    nextJob: '대부호',
    flavor: '부는 영원히!'
  },
  {
    id: 'title_humble',
    type: ENDING_TYPES.TITLE_BASED,
    chance: 25,
    condition: (user) => user.human.title.name === '겸손한',
    deathMessage: '🙏 신이 겸손을 보았습니다...',
    nextJob: '현자',
    flavor: '겸손이 지혜가 됩니다!'
  },

  // ========== 레벨 기반 조건부 ==========
  {
    id: 'level_almost_max',
    type: ENDING_TYPES.LEVEL_BASED,
    chance: 30,
    condition: (user) => user.human.level >= 13,
    deathMessage: '😭 거의 완성된 자...',
    nextJob: 'KEEP_JOB',  // 이전 직업 유지
    flavor: '아쉬움이 다음 생으로 이어집니다!'
  },
  {
    id: 'level_high',
    type: ENDING_TYPES.LEVEL_BASED,
    chance: 20,
    condition: (user) => user.human.level >= 10 && user.human.level < 13,
    deathMessage: '💪 강한 자의 환생...',
    nextJob: 'RANDOM_RARE',
    flavor: '강함이 이어집니다!'
  },
  {
    id: 'level_zero_death',
    type: ENDING_TYPES.LEVEL_BASED,
    chance: 15,
    condition: (user) => user.human.level === 0,
    deathMessage: '😢 시작도 못해봤네...',
    nextJob: 'RANDOM_RARE',
    flavor: '운명이 다시 한번 기회를 줍니다!'
  },

  // ========== 골드 기반 조건부 ==========
  {
    id: 'gold_rich_death',
    type: ENDING_TYPES.GOLD_BASED,
    chance: 30,
    condition: (user) => user.gold >= 10000,
    deathMessage: '💰 부자의 죽음은 화려합니다...',
    nextJob: '대부호',
    flavor: '부의 인연이 이어집니다!'
  },
  {
    id: 'gold_broke_death',
    type: ENDING_TYPES.GOLD_BASED,
    chance: 20,
    condition: (user) => user.gold <= 100,
    deathMessage: '🥺 빈손으로 왔다가 빈손으로...',
    nextJob: 'RANDOM_RARE',
    flavor: '신이 불쌍히 여깁니다!'
  },

  // ========== 복합 조건 (레어) ==========
  {
    id: 'perfect_legendary',
    type: ENDING_TYPES.COMPLEX,
    chance: 50,
    condition: (user) =>
      user.human.title.grade === 'legendary' &&
      user.human.job.grade === 'legendary',
    deathMessage: '🌟 완벽한 존재였습니다...',
    nextJob: 'RANDOM_LEGENDARY',
    flavor: '전설은 전설로 이어집니다!'
  },
  {
    id: 'genius_mage_max',
    type: ENDING_TYPES.COMPLEX,
    chance: 80,
    condition: (user) =>
      user.human.job.name === '마법사' &&
      user.human.title.name === '천재' &&
      user.human.level >= 10,
    deathMessage: '🔮 역대 최고의 마법사...',
    nextJob: '대마법사',
    flavor: '마법의 정점에 도달합니다!'
  },
  {
    id: 'lucky_unemployed_miracle',
    type: ENDING_TYPES.COMPLEX,
    chance: 100,
    condition: (user) =>
      user.human.job.name === '백수' &&
      user.human.title.name === '행운의' &&
      user.human.level >= 15,
    deathMessage: '🎉 기적을 만들었습니다...',
    nextJob: 'RANDOM_LEGENDARY',
    flavor: '기적이 전설을 만듭니다!'
  },
  {
    id: 'dragonslayer_curse',
    type: ENDING_TYPES.COMPLEX,
    chance: 50,
    condition: (user) => user.human.job.name === '드래곤슬레이어',
    deathMessage: '🐲 용의 저주가 남았습니다...',
    nextJob: 'RANDOM_CHOICE',
    nextJobChoices: ['용사', '대마법사'],
    flavor: '용의 힘이 새로운 형태로!'
  },

  // ========== 동물 직업 전용 엔딩 ==========
  {
    id: 'dog_loyalty',
    type: ENDING_TYPES.ANIMAL,
    chance: 25,
    condition: (user) => user.human.job.name === '강아지',
    deathMessage: '🐕 충성스러운 영혼이 새로운 주인을 찾습니다...',
    nextJob: '기사',
    flavor: '충성심이 기사도로 승화됩니다!'
  },
  {
    id: 'cat_nine_lives',
    type: ENDING_TYPES.ANIMAL,
    chance: 30,
    condition: (user) => user.human.job.name === '고양이',
    deathMessage: '🐱 9개의 목숨 중 하나를 사용했습니다...',
    nextJob: 'RANDOM_RARE',
    flavor: '남은 목숨으로 새 인생을!'
  },
  {
    id: 'rabbit_speed',
    type: ENDING_TYPES.ANIMAL,
    chance: 20,
    condition: (user) => user.human.job.name === '토끼',
    deathMessage: '🐰 빠른 발로 다음 생으로 뛰어갑니다...',
    nextJob: '모험가',
    flavor: '달리기는 계속됩니다!'
  },
  {
    id: 'hamster_wheel',
    type: ENDING_TYPES.ANIMAL,
    chance: 20,
    condition: (user) => user.human.job.name === '햄스터',
    deathMessage: '🐹 쳇바퀴를 돌다 우주의 진리를 깨달았습니다...',
    nextJob: '연구원',
    flavor: '무한 반복 속에서 지혜를!'
  },
  {
    id: 'penguin_wisdom',
    type: ENDING_TYPES.ANIMAL,
    chance: 25,
    condition: (user) => user.human.job.name === '펭귄',
    deathMessage: '🐧 남극의 신비를 품고 돌아옵니다...',
    nextJob: '현자',
    flavor: '극한의 환경이 현자를 만듭니다!'
  },
  {
    id: 'panda_fame',
    type: ENDING_TYPES.ANIMAL,
    chance: 25,
    condition: (user) => user.human.job.name === '판다',
    deathMessage: '🐼 귀여움으로 세상을 정복합니다...',
    nextJob: '배우',
    flavor: '타고난 스타성!'
  },
  {
    id: 'fox_nine_tails',
    type: ENDING_TYPES.ANIMAL,
    chance: 35,
    condition: (user) => user.human.job.name === '여우',
    deathMessage: '🦊 꼬리 9개를 모아 구미호로 진화합니다...',
    nextJob: '대마법사',
    flavor: '천년의 마력이 깨어납니다!'
  },
  {
    id: 'bear_warrior',
    type: ENDING_TYPES.ANIMAL,
    chance: 20,
    condition: (user) => user.human.job.name === '곰',
    deathMessage: '🐻 산의 왕이 인간계로 내려옵니다...',
    nextJob: '전사',
    flavor: '야생의 힘이 전장을 흔듭니다!'
  },
  {
    id: 'wolf_pack',
    type: ENDING_TYPES.ANIMAL,
    chance: 25,
    condition: (user) => user.human.job.name === '늑대',
    deathMessage: '🐺 달빛 아래 새로운 무리를 찾습니다...',
    nextJob: '용병',
    flavor: '무리의 본능이 팀을 이끕니다!'
  },
  {
    id: 'lion_king',
    type: ENDING_TYPES.ANIMAL,
    chance: 40,
    condition: (user) => user.human.job.name === '사자',
    deathMessage: '🦁 정글의 왕이 인간 세계를 정복합니다...',
    nextJob: '대부호',
    flavor: '왕은 어디서든 왕입니다!'
  },

  // ========== 마일스톤 (사망 횟수 기반) ==========
  {
    id: 'first_death',
    type: ENDING_TYPES.MILESTONE,
    chance: 100,
    condition: (user) => user.stats.deathCount === 0,
    deathMessage: '📘 모든 시작은 실패부터...',
    nextJob: 'RANDOM_RARE',
    flavor: '첫 교훈과 함께 새로운 기회가!'
  },
  {
    id: 'death_10',
    type: ENDING_TYPES.MILESTONE,
    chance: 100,
    condition: (user) => user.stats.deathCount === 9,
    deathMessage: '🔟 이제 익숙해졌군요...',
    nextJob: 'RANDOM_RARE',
    flavor: '경험이 쌓였습니다!'
  },
  {
    id: 'death_50',
    type: ENDING_TYPES.MILESTONE,
    chance: 100,
    condition: (user) => user.stats.deathCount === 49,
    deathMessage: '💀 죽음의 베테랑...',
    nextJob: null,
    flavor: '전설적인 칭호를 얻습니다!',
    grantLegendaryTitle: true
  },
  {
    id: 'death_100',
    type: ENDING_TYPES.MILESTONE,
    chance: 100,
    condition: (user) => user.stats.deathCount === 99,
    deathMessage: '♾️ 불사의 경지...',
    nextJob: 'RANDOM_LEGENDARY',
    flavor: '전설의 직업이 부여됩니다!'
  }
];

/**
 * 전설 직업 목록
 */
const LEGENDARY_JOBS = ['용사', '대마법사', '연금술사', '용병', '암살자', '현자', '드래곤슬레이어', '대부호'];

/**
 * 희귀 이상 직업 목록
 */
const RARE_PLUS_JOBS = [
  // 희귀
  '의사', '변호사', '교수', '연구원', '마법사', '기사', '탐정', '모험가', '파일럿', '외교관', '프로게이머', '사업가',
  // 전설
  ...LEGENDARY_JOBS
];

/**
 * 사망 시 특수 엔딩 체크
 * @param {Object} user - 유저 객체
 * @returns {Object|null} 특수 엔딩 정보 또는 null
 */
function checkSpecialEnding(user) {
  // 조건부 엔딩 먼저 체크 (우선순위 높음)
  const conditionalEndings = SPECIAL_ENDINGS.filter(e => e.condition !== null);

  for (const ending of conditionalEndings) {
    try {
      if (ending.condition(user)) {
        const roll = Math.random() * 100;
        if (roll < ending.chance) {
          return processEnding(ending, user);
        }
      }
    } catch (err) {
      // 조건 체크 실패시 무시
      continue;
    }
  }

  // 랜덤 엔딩 체크
  const randomEndings = SPECIAL_ENDINGS.filter(e => e.type === ENDING_TYPES.RANDOM);
  const totalRandomChance = randomEndings.reduce((sum, e) => sum + e.chance, 0);

  const roll = Math.random() * 100;
  if (roll < totalRandomChance) {
    let cumulative = 0;
    for (const ending of randomEndings) {
      cumulative += ending.chance;
      if (roll < cumulative) {
        return processEnding(ending, user);
      }
    }
  }

  return null;
}

/**
 * 엔딩 처리 및 다음 직업 결정
 * @param {Object} ending - 엔딩 정보
 * @param {Object} user - 유저 객체
 * @returns {Object} 처리된 엔딩 정보
 */
function processEnding(ending, user) {
  const result = {
    id: ending.id,
    type: ending.type,
    deathMessage: ending.deathMessage,
    flavor: ending.flavor,
    nextJob: null,
    grantLegendaryTitle: ending.grantLegendaryTitle || false
  };

  // 다음 직업 결정
  switch (ending.nextJob) {
    case 'KEEP_JOB':
      result.nextJob = user.human.job.name;
      break;
    case 'RANDOM_LEGENDARY':
      result.nextJob = LEGENDARY_JOBS[Math.floor(Math.random() * LEGENDARY_JOBS.length)];
      break;
    case 'RANDOM_RARE':
      result.nextJob = RARE_PLUS_JOBS[Math.floor(Math.random() * RARE_PLUS_JOBS.length)];
      break;
    case 'RANDOM_CHOICE':
      result.nextJob = ending.nextJobChoices[Math.floor(Math.random() * ending.nextJobChoices.length)];
      break;
    case null:
      result.nextJob = null;  // 기본 랜덤 직업
      break;
    default:
      result.nextJob = ending.nextJob;  // 고정 직업
  }

  return result;
}

/**
 * 직업 이름으로 직업 정보 가져오기
 * @param {string} jobName - 직업 이름
 * @returns {Object|null} 직업 정보
 */
function getJobByName(jobName) {
  const job = JOBS.find(j => j.name === jobName);
  if (job) {
    return { ...job };
  }
  return null;
}

module.exports = {
  SPECIAL_ENDINGS,
  ENDING_TYPES,
  LEGENDARY_JOBS,
  RARE_PLUS_JOBS,
  checkSpecialEnding,
  getJobByName
};
