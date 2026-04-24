import type { I18nKey } from "./en";

export const zh: Record<I18nKey, string> = {
	// Tabs
	"tab.browse": "浏览",
	"tab.chat": "聊天",

	// MenuBottomBar
	"input.placeholder": "今天想吃什么？",
	"input.disabled": "聊天次数已达上限",

	// CartSheet
	"cart.title": "您的购物车",
	"cart.empty": "购物车是空的",
	"cart.emptyDesc": "浏览菜单并添加菜品开始点餐。",
	"cart.readyToOrder": "已下单",
	"cart.showToWaiter": "请出示给服务员，完成后点击确认",
	"cart.ordered": "已下单",

	// BrowseView
	"browse.noItems": "没有符合筛选条件的菜品。",
	"browse.clearFilters": "清除筛选",

	// ChatView
	"chat.error": "出了点问题，请重试。",

	// FilterBar — diets
	"diet.veg": "素食",
	"diet.non-veg": "非素食",
	"diet.egg": "蛋奶素",

	// FilterBar — allergens
	"allergen.no.dairy": "无乳制品",
	"allergen.no.nuts": "无坚果",
	"allergen.no.gluten": "无麸质",
	"allergen.no.eggs": "无鸡蛋",
	"allergen.no.soy": "无大豆",
	"allergen.no.seafood": "无海鲜",
	"allergen.no.shellfish": "无贝类",
	"allergen.no.seeds": "无种子",
	"allergen.no.alcohol": "无酒精",

	// AllergenIcons (item-level labels)
	"allergen.dairy": "乳制品",
	"allergen.nuts": "坚果",
	"allergen.gluten": "麸质",
	"allergen.eggs": "鸡蛋",
	"allergen.soy": "大豆",
	"allergen.seafood": "海鲜",
	"allergen.shellfish": "贝类",
	"allergen.seeds": "种子",
	"allergen.alcohol": "酒精",

	// QuantityButton
	"qty.add": "添加",

	// ItemBadges
	"badge.popular": "人气",
	"badge.new": "新品",

	// Customizations
	"item.customizable": "可定制",
	"customization.addItem": "添加",
	"customization.required": "必选",
	"customization.optional": "可选",
	"customization.included": "已包含",
	"customization.select": "请选择",
	"customization.selectOne": "必选 · 选择 1",
	"customization.selectN": "必选 · 选择",
	"customization.selectRange": "必选 ·",
	"customization.optionalUpTo": "可选 · 最多",
	"customization.maxReached": "已达上限 — 取消一个后可更换",
	"customization.customizeAgain": "重新定制",
	"customization.addAnother": "再加一份",
	"customization.yourPicks": "您的选择",
	"customization.default": "默认",
	"customization.addNew": "添加新的定制",
};
