import type { I18nKey } from "./en";

export const ko: Record<I18nKey, string> = {
	// Tabs
	"tab.browse": "둘러보기",
	"tab.chat": "채팅",

	// MenuBottomBar
	"input.placeholder": "오늘 뭐 먹고 싶어요?",
	"input.disabled": "채팅 한도에 도달했습니다",

	// CartSheet
	"cart.title": "장바구니",
	"cart.empty": "장바구니가 비어 있습니다",
	"cart.emptyDesc": "메뉴를 둘러보고 항목을 추가해 보세요.",
	"cart.readyToOrder": "주문 완료",
	"cart.showToWaiter": "직원에게 보여주고 완료되면 눌러주세요",
	"cart.ordered": "이미 주문함",

	// BrowseView
	"browse.noItems": "필터와 일치하는 항목이 없습니다.",
	"browse.clearFilters": "필터 지우기",

	// ChatView
	"chat.error": "문제가 발생했습니다. 다시 시도해 주세요.",

	// FilterBar — diets
	"diet.veg": "채식",
	"diet.non-veg": "비채식",
	"diet.egg": "난란채식",

	// FilterBar — allergens
	"allergen.no.dairy": "유제품 없음",
	"allergen.no.nuts": "견과류 없음",
	"allergen.no.gluten": "글루텐 없음",
	"allergen.no.eggs": "계란 없음",
	"allergen.no.soy": "대두 없음",
	"allergen.no.seafood": "해산물 없음",
	"allergen.no.shellfish": "조개류 없음",
	"allergen.no.seeds": "씨앗 없음",
	"allergen.no.alcohol": "주류 없음",

	// AllergenIcons (item-level labels)
	"allergen.dairy": "유제품",
	"allergen.nuts": "견과류",
	"allergen.gluten": "글루텐",
	"allergen.eggs": "계란",
	"allergen.soy": "대두",
	"allergen.seafood": "해산물",
	"allergen.shellfish": "조개류",
	"allergen.seeds": "씨앗",
	"allergen.alcohol": "주류",

	// QuantityButton
	"qty.add": "추가",

	// ItemBadges
	"badge.popular": "인기",
	"badge.new": "신메뉴",

	// Customizations
	"item.customizable": "맞춤 가능",
	"customization.addItem": "추가",
	"customization.required": "필수",
	"customization.optional": "선택",
	"customization.included": "포함",
	"customization.select": "선택하세요",
	"customization.selectOne": "필수 · 1개 선택",
	"customization.selectN": "필수 · 선택",
	"customization.selectRange": "필수 ·",
	"customization.optionalUpTo": "선택 · 최대",
	"customization.maxReached": "최대 선택 — 하나를 해제하면 변경 가능",
	"customization.customizeAgain": "다시 맞춤",
	"customization.addAnother": "하나 더 추가",
	"customization.yourPicks": "내 선택",
	"customization.default": "기본",
	"customization.addNew": "새 맞춤 추가",
};
