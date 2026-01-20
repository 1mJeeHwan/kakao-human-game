/**
 * 헬퍼 함수들
 */

const { getFullJobName } = require('./jobs');
const { formatGold } = require('./gameConfig');
const { getJobImage, getStatusImage } = require('./images');

/**
 * 캐릭터 전체 이름 생성
 * @param {Object} human - 인간 캐릭터 객체
 * @returns {string} 전체 이름
 */
function getHumanFullName(human) {
  const jobFullName = getFullJobName(human.job.name, human.level);
  return `${human.title.name} +${human.level} ${jobFullName}`;
}

/**
 * 카카오 응답 형식 생성
 * @param {string} text - 응답 텍스트
 * @param {Array} quickReplies - 빠른 응답 버튼 배열
 * @returns {Object} 카카오 응답 객체
 */
function createKakaoResponse(text, quickReplies = []) {
  const response = {
    version: '2.0',
    template: {
      outputs: [
        {
          simpleText: {
            text: text
          }
        }
      ]
    }
  };

  if (quickReplies.length > 0) {
    response.template.quickReplies = quickReplies;
  }

  return response;
}

/**
 * 빠른 응답 버튼 생성
 * @param {string} label - 버튼 라벨
 * @param {string} message - 메시지 (blockId 대신 message 사용)
 * @returns {Object} 빠른 응답 객체
 */
function createQuickReply(label, message) {
  return {
    label: label,
    action: 'message',
    messageText: message
  };
}

/**
 * 기본 빠른 응답 버튼들
 */
const DEFAULT_QUICK_REPLIES = [
  createQuickReply('업그레이드', '업그레이드'),
  createQuickReply('판매하기', '판매'),
  createQuickReply('확률표', '확률')
];

const UPGRADE_QUICK_REPLIES = [
  createQuickReply('계속 업그레이드', '업그레이드'),
  createQuickReply('판매하기', '판매'),
  createQuickReply('상태 확인', '시작')
];

const SELL_QUICK_REPLIES = [
  createQuickReply('강화하기', '강화'),
  createQuickReply('상태 확인', '시작'),
  createQuickReply('확률표', '확률')
];

/**
 * 카카오 요청에서 유저 ID 추출
 * @param {Object} body - 요청 바디
 * @returns {string|null} 유저 ID 또는 null
 */
function extractUserId(body) {
  try {
    return body.userRequest?.user?.id || null;
  } catch (error) {
    return null;
  }
}

/**
 * 등급별 이모지 가져오기
 * @param {string} grade - 등급
 * @returns {string} 이모지
 */
function getGradeEmoji(grade) {
  const emojis = {
    common: '',
    uncommon: '🔹',
    rare: '✨',
    epic: '⭐',
    legendary: '🌟'
  };
  return emojis[grade] || '';
}

/**
 * 이미지가 포함된 카카오 응답 (basicCard)
 * @param {string} title - 카드 제목
 * @param {string} description - 카드 설명
 * @param {string} imageUrl - 이미지 URL
 * @param {Array} quickReplies - 빠른 응답 버튼 배열
 * @returns {Object} 카카오 응답 객체
 */
function createKakaoCardResponse(title, description, imageUrl, quickReplies = []) {
  const response = {
    version: '2.0',
    template: {
      outputs: [
        {
          basicCard: {
            title: title,
            description: description,
            thumbnail: {
              imageUrl: imageUrl
            }
          }
        }
      ]
    }
  };

  if (quickReplies.length > 0) {
    response.template.quickReplies = quickReplies;
  }

  return response;
}

/**
 * 텍스트 + 이미지 혼합 응답
 * @param {string} text - 텍스트 내용
 * @param {string} imageUrl - 이미지 URL (선택)
 * @param {Array} quickReplies - 빠른 응답 버튼 배열
 * @returns {Object} 카카오 응답 객체
 */
function createKakaoMixedResponse(text, imageUrl, quickReplies = []) {
  const outputs = [];

  // 이미지가 있으면 먼저 추가
  if (imageUrl) {
    outputs.push({
      simpleImage: {
        imageUrl: imageUrl,
        altText: '게임 이미지'
      }
    });
  }

  // 텍스트 추가
  outputs.push({
    simpleText: {
      text: text
    }
  });

  const response = {
    version: '2.0',
    template: {
      outputs: outputs
    }
  };

  if (quickReplies.length > 0) {
    response.template.quickReplies = quickReplies;
  }

  return response;
}

module.exports = {
  getHumanFullName,
  createKakaoResponse,
  createKakaoCardResponse,
  createKakaoMixedResponse,
  createQuickReply,
  DEFAULT_QUICK_REPLIES,
  UPGRADE_QUICK_REPLIES,
  SELL_QUICK_REPLIES,
  extractUserId,
  getGradeEmoji
};
